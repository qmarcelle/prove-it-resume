import AxeBuilder from '@axe-core/playwright';
import { openPath } from './disclosure';
import { expect, test, type Page } from '@playwright/test';

/**
 * Browser coverage for the three progressive-disclosure interactions.
 *
 * The unit suite already covers state transitions. What only a browser can check is
 * here: real layout at real widths, focus behaviour against a production build,
 * reduced-motion emulation, and axe against the *interacting* states rather than the
 * resting page.
 */

const diff = (page: Page) =>
  page.locator('section').filter({ hasText: 'Repository decision diff' }).first();
const interlock = (page: Page) =>
  page.locator('section').filter({ hasText: 'Interlock counterfactual' }).first();
// Keyed on the section id rather than heading text: the redesign moved the heading
// into ChapterMark, and a locator that tracks copy breaks on every wording change.
const vreko = (page: Page) => page.locator('#vreko');

/** Opens every disclosure the three interactions have. */
async function openEverything(page: Page) {
  await diff(page)
    .getByRole('button', { name: /Attribute$/ })
    .click();
  await interlock(page)
    .getByRole('button', { name: /Evidence$/ })
    .click();
  await interlock(page)
    .getByRole('button', { name: /Perturb the evidence/ })
    .click();

  /*
   * The containment diagram has no expand step: every layer is drawn at rest and one
   * is always selected. Walking all six is the equivalent sweep: it puts each layer's
   * components on screen and each hop's detail through the panel, which is the surface
   * the contrast and focus checks below need to see.
   */
  const architecture = vreko(page);
  for (const layer of [
    'AI coding assistant',
    'Hosted edge',
    'Local edge',
    'MCP protocol surface',
    'Vreko platform',
    'Your workspace',
  ]) {
    await architecture.getByRole('button', { name: new RegExp(layer) }).click();
  }

  /*
   * Let the disclosure fades finish before anything is measured. Axe samples computed
   * styles, so a half-faded paragraph reports a blended foreground colour and a
   * contrast failure that no reader ever sees. Waiting is the honest check: it asserts
   * the settled state, which is the state that has to pass.
   */
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))),
  );
}

test.describe('repository decision diff', () => {
  test('rests compact and discloses on request', async ({ page }) => {
    await page.goto('/');
    const panel = diff(page);

    /*
     * The conditions are never hidden behind a stage; they are why the run is
     * credible. They now sit in the rail beside the comparison rather than inside it,
     * so this asserts against the section: the guarantee is that a reader sees them
     * without stepping, not which element holds them.
     */
    const rail = page.locator('#repository-intelligence').getByRole('complementary', {
      name: 'HELD FIXED',
    });
    await expect(rail).toBeVisible();
    await expect(rail.getByText('qwen-plus')).toBeVisible();

    // But the comparison itself is not imposed.
    await expect(panel.getByText('ADDED')).toHaveCount(0);

    await panel.getByRole('button', { name: /Compare$/ }).click();
    await expect(panel.getByText('ADDED')).toBeVisible();
    await expect(panel.getByText('REMOVED')).toBeVisible();
    await expect(panel.getByText('CONSTRAINED')).toBeVisible();
  });

  test('attributes each changed row to named evidence', async ({ page }) => {
    await page.goto('/');
    const panel = diff(page);

    await panel.getByRole('button', { name: /Attribute$/ }).click();
    await expect(panel.getByText(/BECAUSE OF/).first()).toBeVisible();
    await expect(panel.getByText(/BECAUSE OF/)).toHaveCount(3);

    // Provenance and a re-check command, not just an assertion.
    await expect(panel.getByText('shasum -a 256 -c SHA256SUMS').first()).toBeVisible();
  });

  test('links the frozen run at an immutable revision', async ({ page }) => {
    await page.goto('/');
    // The artifact link moved to the section's proof layer, where the boundary is also
    // stated once. The revision pin is the part that must not slip.
    const link = page
      .locator('#repository-intelligence')
      .getByRole('link', { name: /paired plan run bundle/ });
    await expect(link).toHaveAttribute(
      'href',
      /github\.com\/workspacejson\/datahub-agent\/blob\/[0-9a-f]{40}\//,
    );
  });

  test('steps by keyboard from a single tab stop', async ({ page }) => {
    await page.goto('/');
    const panel = diff(page);

    await panel.getByRole('button', { name: /Baseline$/ }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(panel.getByRole('button', { name: /Add evidence$/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await page.keyboard.press('End');
    await expect(panel.getByRole('button', { name: /Attribute$/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await page.keyboard.press('Home');
    await expect(panel.getByRole('button', { name: /Baseline$/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  /**
   * The acceptance criterion for progressive compression.
   *
   * The panel is cumulative by design, and that used to mean the evidence bodies stayed
   * at full height underneath every later stage. Pressing `Compare` then put roughly
   * 600px of payload between the control and the plan pair it had just produced, so on
   * a laptop the answer was below the fold behind its own cause.
   *
   * Asserted from the control rather than from the top of the document, because that is
   * the reader's actual position: they pressed a button, and what the button produced
   * has to be reachable from where the button is. Measured at two ordinary laptop
   * heights, since the fix has to hold on the shorter one.
   */
  for (const viewport of [
    { width: 1440, height: 800 },
    { width: 1280, height: 720 },
  ]) {
    test(`shows the changed plan without scrolling past the evidence at ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      const panel = diff(page);

      await panel.getByRole('button', { name: /Compare$/ }).click();
      await page.evaluate(() =>
        Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))),
      );

      // Put the reader where they just pressed.
      const control = panel.getByRole('button', { name: /Compare$/ });
      await control.evaluate((el) => el.scrollIntoView({ block: 'start' }));

      const informed = panel.getByText('Catalog projection + repository evidence', {
        exact: true,
      });

      const controlBox = (await control.boundingBox())!;
      const informedBox = (await informed.boundingBox())!;
      const changedRow = (await panel
        .getByText('REMOVED', { exact: true })
        .boundingBox())!;

      // The literal criterion: the changed plan is on screen.
      expect(
        informedBox.y + informedBox.height,
        `the changed plan falls below the fold at ${viewport.height}px`,
      ).toBeLessThanOrEqual(viewport.height);

      /*
       * And it is close to the control, which is the part that regresses. The failure
       * being guarded against is not "the plan is missing" but "the plan is 800px down
       * behind its own evidence", so the gap is asserted as a fraction of the screen
       * rather than as an absolute number that would drift with copy.
       */
      const gap = informedBox.y - (controlBox.y + controlBox.height);
      expect(
        gap,
        `${Math.round(gap)}px of payload sits between the control and the changed plan`,
      ).toBeLessThan(viewport.height * 0.6);

      // The whole comparison, changed rows included, is one screen from the control.
      expect(
        changedRow.y + changedRow.height - (controlBox.y + controlBox.height),
      ).toBeLessThanOrEqual(viewport.height);

      // And the evidence it replaced is still on the page, named, not deleted.
      await expect(panel.getByText(/^Repository evidence \(\d+\)$/)).toBeVisible();
      await expect(panel.getByText('Exact producing source')).toBeVisible();
    });
  }

  test('folds prior stages without losing them, and puts them back on request', async ({
    page,
  }) => {
    await page.goto('/');
    const panel = diff(page);

    await panel.getByRole('button', { name: /Compare$/ }).click();

    // The evidence bodies are folded, and the control that restores them is a real,
    // labelled control rather than a hover target.
    await expect(panel.getByText(/Artifact repository, revision/)).toHaveCount(0);
    const restore = panel.getByRole('button', { name: /Show evidence detail/ });
    await expect(restore).toHaveAttribute('aria-expanded', 'false');

    await restore.click();
    await expect(panel.getByText(/Artifact repository, revision/)).toBeVisible();

    // The reader's choice outlives the stage that overrode it.
    await panel.getByRole('button', { name: /Attribute$/ }).click();
    await expect(panel.getByText(/Artifact repository, revision/)).toBeVisible();
    await expect(panel.getByText('@workspacejson/cli')).toBeVisible();
  });

  test('is deep-linkable without breaking the default', async ({ page }) => {
    await page.goto('/?decision=attribution');
    await expect(
      diff(page)
        .getByText(/BECAUSE OF/)
        .first(),
    ).toBeVisible();

    // And a nonsense value is ignored rather than throwing the page away.
    await page.goto('/?decision=not-a-stage');
    await expect(diff(page).getByText('ADDED')).toHaveCount(0);
  });
});

test.describe('interlock counterfactual', () => {
  test('draws both arms on one scale with one constraint marker', async ({ page }) => {
    await page.goto('/');
    const panel = interlock(page);

    // The bound and the invariant it expresses read as one line above the axis.
    await expect(panel.getByText(/BOUND 130 · sum\(services/)).toBeVisible();

    // Two bars, one marker, and the marker sits at the same x for both arms because
    // there is only one of it.
    await expect(panel.getByRole('img')).toHaveCount(2);
    await expect(panel.locator('[class*="BoundAxis"][class*="marker"]')).toHaveCount(1);
  });

  test('moves through stages to the frozen outcome', async ({ page }) => {
    await page.goto('/');
    const panel = interlock(page);

    await panel.getByRole('button', { name: /Result$/ }).click();
    await expect(panel.getByText('INVALID JOINT STATE').first()).toBeVisible();
    await expect(panel.getByText('CONSTRAINT HELD').first()).toBeVisible();
  });

  test('perturbation is user-triggered and changes the decision', async ({ page }) => {
    await page.goto('/');
    const panel = interlock(page);

    await panel.getByRole('button', { name: /Result$/ }).click();
    await expect(panel.getByText('CONSTRAINT HELD').first()).toBeVisible();

    await panel.getByRole('button', { name: /Perturb the evidence/ }).click();
    await expect(panel.getByText(/ALLOW_PARALLEL/).first()).toBeVisible();
    await expect(panel.getByText('CONSTRAINT HELD')).toHaveCount(0);
  });

  test('resolves its evidence link', async ({ page }) => {
    await page.goto('/');
    // The artifact link moved to the section's proof layer, where the boundary is also
    // stated once. The revision pin is the part that must not slip.
    await expect(
      // Anchored on the call-to-action text: the evidence panel in the same section
      // also names the frozen packet, but points at the published cockpit rather than
      // the revision-pinned artifact, and that is the one under test here.
      page.locator('#interlock').getByRole('link', {
        name: /^HAC-330 frozen evidence packet/,
      }),
    ).toHaveAttribute('href', /Marcelle-Labs\/interlock\/blob\/[0-9a-f]{40}\//);
  });

  test('never uses celebratory or alarm treatment', async ({ page }) => {
    await page.goto('/');
    const panel = interlock(page);
    await panel.getByRole('button', { name: /Result$/ }).click();

    // The satisfied arm is not rewarded with a different hue family, and the breached
    // arm is not punished with red. Both verdicts use the page's own ink/accent scale.
    const colors = await panel
      .locator('[class*="verdict"]')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).color));
    for (const color of colors) {
      expect(color).not.toMatch(/rgb\(2[0-9]{2}, [0-5][0-9]?, /);
    }
  });
});

test.describe('vreko containment diagram', () => {
  test('draws every layer at rest, with none of them moving', async ({ page }) => {
    await page.goto('/');
    const panel = vreko(page);

    // Offsets are measured relative to the section, not the viewport: selecting a layer
    // scrolls the page, and viewport coordinates would report that as movement.
    const offsetInPanel = async () =>
      panel.evaluate((root) => {
        const node = [...root.querySelectorAll('button')].find((el) =>
          el.textContent?.includes('AI coding assistant'),
        )!;
        return node.getBoundingClientRect().top - root.getBoundingClientRect().top;
      });

    const before = await offsetInPanel();
    await panel.getByRole('button', { name: /Vreko platform/ }).click();

    /*
     * Selecting a different layer discloses its components and hides the previous
     * one's, so the boxes below the selection do move. The upstream neighbour sits
     * above every layer in the diagram and must not: that is what makes this a diagram
     * being annotated rather than one being replaced.
     */
    expect(Math.abs((await offsetInPanel()) - before)).toBeLessThan(4);
    await expect(panel.getByRole('button', { name: /Hosted edge/ })).toBeVisible();
    await expect(panel.getByRole('button', { name: /Your workspace/ })).toBeVisible();
  });

  test('moves the detail panel to the selected layer', async ({ page }) => {
    await page.goto('/');
    const panel = vreko(page);
    const detail = panel.getByRole('complementary');

    await expect(detail.getByRole('heading', { name: 'Hosted edge' })).toBeVisible();

    await panel.getByRole('button', { name: /Vreko platform/ }).click();
    await expect(detail.getByRole('heading', { name: 'Vreko platform' })).toBeVisible();
    await expect(detail.getByText('WITHHELD')).toBeVisible();
  });

  test('never advances on its own', async ({ page }) => {
    await page.goto('/');
    const panel = vreko(page);
    const detail = panel.getByRole('complementary');

    await expect(detail.getByRole('heading', { name: 'Hosted edge' })).toBeVisible();

    // Wait well past any plausible choreography; the selection must not move itself.
    await page.waitForTimeout(1500);
    await expect(detail.getByRole('heading', { name: 'Hosted edge' })).toBeVisible();
  });

  test('states the public boundary with a re-derivable command', async ({ page }) => {
    await page.goto('/');
    const panel = vreko(page);

    await expect(
      panel.getByText(/npm view @vreko\/intelligence version/).first(),
    ).toBeVisible();
    await expect(panel.getByText(/4 published packages/)).toBeVisible();
    await expect(panel.getByText(/9 declared and unpublished/)).toBeVisible();
  });

  test('exposes no storyboard level identifiers', async ({ page }) => {
    await page.goto('/');
    await openEverything(page);

    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/\bL[012]\b/);
    expect(text).not.toMatch(/\bB[0-4]\b/);
    expect(text).not.toMatch(/\bt[0-4]\b/);
    expect(text).not.toMatch(/\bHOP [1-5]\b/);
  });
});

test.describe('reduced motion', () => {
  /*
   * Emulated per test rather than via `test.use`, matching the existing accessibility
   * suite, and because the media emulation has to be in place before the first
   * navigation for the CSS to take effect on the initial render.
   */
  test('every state is still reachable and complete', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await openEverything(page);

    // The whole argument is present with animation disabled.
    await expect(
      diff(page)
        .getByText(/BECAUSE OF/)
        .first(),
    ).toBeVisible();
    await expect(
      interlock(page)
        .getByText(/ALLOW_PARALLEL/)
        .first(),
    ).toBeVisible();
    // `openEverything` leaves the last layer selected, so the panel is showing the
    // workspace hop and the diagram is showing that layer's own interior.
    await expect(
      vreko(page).getByRole('complementary').getByRole('heading', {
        name: 'Your workspace',
      }),
    ).toBeVisible();
    await expect(vreko(page).getByText(/writes .agents\/workspace.json/)).toBeVisible();
  });

  test('interlock bars are at their final widths immediately', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const panel = interlock(page);
    await panel.getByRole('button', { name: /Result$/ }).click();

    /*
     * Two independent rules make this true: the component drops `transition-property`
     * entirely, and the global reduced-motion block clamps every duration to 0.01ms.
     * The assertion is about the effect rather than either exact string, so it does not
     * break if one of them is refactored away.
     */
    const bars = await panel
      .locator('[class*="__segment"]:not([class*="segmentLine"])')
      .evaluateAll((els) =>
        els.map((el) => {
          const style = getComputedStyle(el);
          return {
            property: style.transitionProperty,
            seconds: parseFloat(style.transitionDuration),
          };
        }),
      );

    expect(bars.length).toBeGreaterThan(0);
    for (const bar of bars) {
      expect(bar.property === 'none' || bar.seconds < 0.05).toBe(true);
    }
  });
});

test.describe('layout', () => {
  const VIEWPORTS = [320, 375, 768, 1024, 1440];

  for (const width of VIEWPORTS) {
    test(`no page overflow at ${width}px with every interaction open`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await openEverything(page);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test('explicit previous and next controls exist on a narrow viewport', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/');

    // Nothing may depend on a swipe gesture.
    await expect(diff(page).getByRole('button', { name: /Next/ })).toBeVisible();
    await expect(interlock(page).getByRole('button', { name: /Next/ })).toBeVisible();

    await diff(page).getByRole('button', { name: /Next/ }).click();
    await expect(
      diff(page).getByRole('button', { name: /Add evidence$/ }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('interlock numeric labels do not overlap at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/');
    const panel = interlock(page);
    await panel.getByRole('button', { name: /Result$/ }).click();

    const boxes = await panel.locator('[class*="armHead"]').evaluateAll((heads) =>
      heads.map((head) => {
        const label = head.firstElementChild!.getBoundingClientRect();
        const totals = head.lastElementChild!.getBoundingClientRect();
        return {
          labelRight: label.right,
          totalsLeft: totals.left,
          sameRow: Math.abs(label.top - totals.top) < 4,
        };
      }),
    );
    for (const box of boxes) {
      if (box.sameRow) expect(box.labelRight).toBeLessThanOrEqual(box.totalsLeft + 1);
    }
  });
});

test.describe('accessibility of interacting states', () => {
  test('no violations with all three interactions open', async ({ page }) => {
    await page.goto('/');
    await openEverything(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('no violations at 320px with all three interactions open', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/');
    await openEverything(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('tabbing through the interactions always shows a focus ring', async ({ page }) => {
    await page.goto('/');
    await openEverything(page);

    /*
     * Focus is driven with the keyboard rather than `element.focus()`, because
     * `:focus-visible` (which is what actually paints the ring) does not match for
     * programmatic focus on a button. Testing it the other way would assert a ring the
     * keyboard user never sees.
     */
    await page.locator('#vreko').getByRole('button').first().focus();

    let checked = 0;
    for (let i = 0; i < 60 && checked < 15; i += 1) {
      await page.keyboard.press('Tab');

      const state = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const inInteraction = el.closest(
          '[class*="RepositoryDecisionDiff"], [class*="InterlockCounterfactual"], [class*="VrekoArchitectureTrace"], [class*="StepControl"]',
        );
        if (!inInteraction) return null;
        const style = getComputedStyle(el);
        return {
          outlineStyle: style.outlineStyle,
          outlineWidth: parseFloat(style.outlineWidth),
          label: el.textContent?.trim().slice(0, 40),
        };
      });

      if (!state) continue;
      checked += 1;
      expect(state.outlineStyle, `no focus ring on "${state.label}"`).not.toBe('none');
      expect(state.outlineWidth, `zero-width ring on "${state.label}"`).toBeGreaterThan(
        0,
      );
    }

    expect(checked).toBeGreaterThan(5);
  });
});

/**
 * The verdict chip, in both palettes.
 *
 * This exists because of a real defect rather than a hypothetical one. `.verdictHolds`
 * filled itself with `--color-ink` and set its label in `--color-inverse-ink`: two
 * separate assumptions about which end of the scale is dark. On the light page both
 * hold. On the Lit Work Surface, where ink *is* the light step, the two resolved to the
 * same value and the chip rendered as a blank rectangle with the word painted on
 * itself. Nothing caught it: the text was in the DOM, axe reads declared colours on the
 * element and the collision only appears once the custom properties are resolved.
 *
 * So this reads the computed colours off the served page and does the contrast
 * arithmetic. It runs on both routes, because the whole point is that one palette
 * passing says nothing about the other.
 */
const CONTRAST_FLOOR = 4.5;

/** WCAG relative luminance, from a computed `rgb(...)` / `rgba(...)` string. */
function luminance(colour: string): number {
  const [r, g, b] = colour
    .match(/[\d.]+/g)!
    .slice(0, 3)
    .map(Number);
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(fg: string, bg: string): number {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

/**
 * The counterfactual, wherever the surface keeps it.
 *
 * On `/` it is in the section's opening layer. On `/linear` it sits behind the question
 * that walks the coordination proof, so reaching it costs one click there and none here.
 * Parameterised tests over both routes call this rather than branching inline.
 */
async function reachCounterfactual(page: Page, route: string) {
  if (route === '/linear') {
    await openPath(page.locator('#interlock'), /Walk the coordination proof/);
  }
}

for (const route of ['/', '/linear']) {
  test.describe(`verdict chips on ${route}`, () => {
    test('are legible against their own fill', async ({ page }) => {
      await page.goto(route);
      await reachCounterfactual(page, route);
      const panel = interlock(page);
      await panel.getByRole('button', { name: /Result$/ }).click();

      for (const word of ['CONSTRAINT HELD', 'INVALID JOINT STATE']) {
        const chip = panel.getByText(word).first();
        await expect(chip, `${word} is not rendered`).toBeVisible();

        /*
         * The chip's own background is transparent in neither palette today, but a
         * future one could set it so. Walking up to the first painted ancestor is what
         * a reader's eye does, and it keeps this test measuring the real pairing rather
         * than a declared one.
         */
        const pair = await chip.evaluate((el) => {
          const fg = getComputedStyle(el).color;
          let node: HTMLElement | null = el as HTMLElement;
          while (node) {
            const bg = getComputedStyle(node).backgroundColor;
            const alpha = Number(bg.match(/[\d.]+/g)?.[3] ?? 1);
            if (alpha > 0) return { fg, bg };
            node = node.parentElement;
          }
          return { fg, bg: 'rgb(255, 255, 255)' };
        });

        expect(
          pair.fg,
          `${word} is painted on itself: ${pair.fg} on ${pair.bg}`,
        ).not.toBe(pair.bg);

        expect(
          contrast(pair.fg, pair.bg),
          `${word} is ${pair.fg} on ${pair.bg}`,
        ).toBeGreaterThanOrEqual(CONTRAST_FLOOR);
      }
    });
  });
}

/**
 * The selected stage of a step control, in both palettes.
 *
 * The second defect of exactly the verdict chip's kind, and the reason the structural
 * guard grew a descendant rule. `.step[aria-pressed='true']` filled from `--color-ink`
 * and labelled from `--color-canvas`: sound, a fill against its ground. The ordinal
 * beside the label was coloured in a separate rule from `--color-inverse-accent`, and
 * nothing related the two. On the light page that is warm sand on near-black at 8.99:1.
 * On the Lit Work Surface the fill is cream and that token is the bright amber, so the
 * numeral rendered at **1.35:1**; present in the DOM, absent to the eye, and passing
 * axe, which reads declared colours rather than resolved ones.
 *
 * Both marks are measured against the fill their own parent paints, because that is the
 * background a reader actually sees them against. The ordinal is checked at the large-
 * text floor rather than the body floor; it is a single glyph at 11.5px in the mono
 * face, and both palettes clear the body floor anyway, which is the point: one triple,
 * answered per surface, with the same hierarchy on each.
 */
for (const route of ['/', '/linear']) {
  test.describe(`the selected stage on ${route}`, () => {
    test('is legible against the fill its own control paints', async ({ page }) => {
      await page.goto(route);
      await reachCounterfactual(page, route);

      const selected = interlock(page).locator('[aria-pressed="true"]').first();
      await expect(selected).toBeVisible();

      const measured = await selected.evaluate((el) => {
        const paintedBackground = (node: HTMLElement | null) => {
          while (node) {
            const bg = getComputedStyle(node).backgroundColor;
            if (Number(bg.match(/[\d.]+/g)?.[3] ?? 1) > 0) return bg;
            node = node.parentElement;
          }
          return 'rgb(255, 255, 255)';
        };

        const fill = paintedBackground(el as HTMLElement);
        const ordinal = el.querySelector('span');
        return {
          fill,
          label: getComputedStyle(el).color,
          ordinal: ordinal ? getComputedStyle(ordinal).color : null,
          ordinalText: ordinal?.textContent ?? '',
        };
      });

      expect(measured.ordinal, 'the stage ordinal is not rendered').not.toBeNull();
      expect(measured.ordinalText.trim()).toMatch(/^\d+$/);

      // Neither mark may be painted on its own ground, whatever the palette resolves to.
      expect(measured.label, `label on itself: ${measured.fill}`).not.toBe(measured.fill);
      expect(measured.ordinal, `ordinal on itself: ${measured.fill}`).not.toBe(
        measured.fill,
      );

      expect(
        contrast(measured.label, measured.fill),
        `stage label is ${measured.label} on ${measured.fill}`,
      ).toBeGreaterThanOrEqual(CONTRAST_FLOOR);

      expect(
        contrast(measured.ordinal!, measured.fill),
        `stage ordinal is ${measured.ordinal} on ${measured.fill}`,
      ).toBeGreaterThanOrEqual(CONTRAST_FLOOR);

      /*
       * The ordinal is meant to be quieter than the label, not equal to it. Asserted so
       * that "fix the contrast" cannot be answered by setting it to the label's colour,
       * which would pass every threshold above and lose the hierarchy the design has.
       */
      expect(contrast(measured.ordinal!, measured.fill)).toBeLessThan(
        contrast(measured.label, measured.fill),
      );
    });
  });
}

/**
 * The URL, and the two modes it has.
 *
 * Interaction state used to be written into the query string as the reader stepped
 * through it, so reading three sections of the page turned the address into
 * `?interlock=evidence&layer=workspace&decision=comparison#vreko`. The capability is
 * worth keeping; the default was wrong. Browsing now leaves `/linear` alone, and one
 * explicit control builds the shareable address.
 *
 * Four things have to hold together, and losing any one of them silently reintroduces
 * the old behaviour or drops the capability: browsing stays clean, an incoming link is
 * still honoured, the control still produces a link that carries the whole page's state,
 * and a URL never asserts a stage the page is not in.
 */

/**
 * Bring both stepped interactions onto the page.
 *
 * On `/linear` the counterfactual and the recorded-run diff each sit behind a named
 * question. Opening those paths is what a reader does before they can step either
 * control, so it is what these tests do too.
 */
async function openStepped(page: Page) {
  await openPath(page.locator('#interlock'), /Walk the coordination proof/);
  await openPath(
    page.locator('#repository-intelligence'),
    /Walk the repository-to-agent path/,
  );
}

test.describe('shareable state', () => {
  test('ordinary interaction leaves the address alone', async ({ page }) => {
    await page.goto('/linear');
    await openStepped(page);
    const panel = interlock(page);

    await panel.getByRole('button', { name: /Result$/ }).click();
    await panel.getByRole('button', { name: /Perturb the evidence/ }).click();
    await diff(page)
      .getByRole('button', { name: /Attribute$/ })
      .click();

    const url = new URL(page.url());
    expect(url.search, 'browsing wrote state into the URL').toBe('');
    expect(url.hash).toBe('');
  });

  test('an incoming deep link is still honoured', async ({ page }) => {
    await page.goto('/linear?interlock=evidence&decision=comparison');

    await expect(
      interlock(page)
        .getByText(/frozen/i)
        .first(),
    ).toBeVisible();
    await expect(diff(page).getByRole('button', { name: /Compare$/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('a stale parameter is dropped when the reader moves off it', async ({ page }) => {
    await page.goto('/linear?interlock=evidence&decision=comparison');

    // Step the counterfactual somewhere else. Its parameter no longer describes the
    // page, so it goes, and the one that is still accurate stays.
    await interlock(page)
      .getByRole('button', { name: /Intents$/ })
      .click();

    const url = new URL(page.url());
    expect(url.searchParams.has('interlock')).toBe(false);
    expect(url.searchParams.get('decision')).toBe('comparison');
  });

  test('copy this view carries the whole page, not one panel', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/linear');
    await openStepped(page);

    // Two different panels moved off their defaults, then shared from the second.
    await diff(page)
      .getByRole('button', { name: /Compare$/ })
      .click();
    await interlock(page)
      .getByRole('button', { name: /Result$/ })
      .click();
    await interlock(page)
      .getByRole('button', { name: /COPY THIS VIEW/ })
      .click();

    await expect(
      interlock(page).getByRole('button', { name: /LINK COPIED/ }),
    ).toBeVisible();

    const copied = new URL(await page.evaluate(() => navigator.clipboard.readText()));
    expect(copied.pathname).toBe('/linear');
    expect(copied.searchParams.get('decision')).toBe('comparison');
    expect(copied.searchParams.get('interlock')).toBe('outcome');
    expect(copied.hash).toBe('#interlock');

    // The page the reader is on is still clean. Sharing is not browsing.
    expect(new URL(page.url()).search).toBe('');
  });

  /**
   * A copied address names every key it carries.
   *
   * This is the one failure the unit suite structurally cannot see. The sections that
   * name a disclosure key are server components; while the map lived in a `'use client'`
   * module every lookup reached them as a client reference and resolved to `undefined`,
   * so all five sections published their state under one key called `undefined` and the
   * last to mount won. The page rendered correctly and every component test passed. Only
   * the copied link showed it, as `?undefined=path`.
   *
   * So the assertion is on the address, from a real build, with several panels open.
   */
  test('a copied link names every key it carries', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/linear');
    await openStepped(page);
    await openPath(page.locator('#product-history'), /What did I actually build/);

    await interlock(page)
      .getByRole('button', { name: /COPY THIS VIEW/ })
      .click();

    const copied = new URL(await page.evaluate(() => navigator.clipboard.readText()));
    expect([...copied.searchParams.keys()]).not.toContain('undefined');
    expect(copied.searchParams.get('coordination')).toBe('proof');
    expect(copied.searchParams.get('context')).toBe('path');
    expect(copied.searchParams.get('history')).toBe('built');
  });

  test('a copied link reopens the page in the state it described', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/linear');
    await openStepped(page);

    await interlock(page)
      .getByRole('button', { name: /Evidence$/ })
      .click();
    await interlock(page)
      .getByRole('button', { name: /COPY THIS VIEW/ })
      .click();

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(copied);

    await expect(
      interlock(page).getByRole('button', { name: /Evidence$/ }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('reload returns the page to its resting state', async ({ page }) => {
    await page.goto('/linear');
    await openStepped(page);
    await interlock(page)
      .getByRole('button', { name: /Result$/ })
      .click();

    await page.reload();

    /*
     * Nothing was written to the address, so the reload lands on the orientation layer
     * and the reader opens the proof again themselves. That the counterfactual comes
     * back at its first stage rather than mid-argument is the assertion.
     */
    await openPath(page.locator('#interlock'), /Walk the coordination proof/);

    /*
     * The first stage, because nothing was ever written to the address. That is the
     * point: a reader who steps through a disclosure has not changed where they are,
     * and a reload should not hand them back a page mid-argument.
     */
    await expect(interlock(page).getByRole('button', { name: /State$/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(new URL(page.url()).search).toBe('');
  });

  test('stepping never fills the back button', async ({ page }) => {
    await page.goto('/');
    await page.goto('/linear');
    await openStepped(page);

    const panel = interlock(page);
    for (const stage of [/Intents$/, /Decision$/, /Result$/]) {
      await panel.getByRole('button', { name: stage }).click();
    }

    // One press goes back to the previous page, not to a previous stage.
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
  });
});
