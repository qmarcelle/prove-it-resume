import AxeBuilder from '@axe-core/playwright';
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
const vreko = (page: Page) =>
  page.locator('section').filter({ hasText: 'Public architecture' }).first();

/** Opens every disclosure the three interactions have. */
async function openEverything(page: Page) {
  await diff(page)
    .getByRole('button', { name: /Attribute the change/ })
    .click();
  await interlock(page)
    .getByRole('button', { name: /Frozen evidence/ })
    .click();
  await interlock(page)
    .getByRole('button', { name: /Perturb the evidence/ })
    .click();

  const architecture = vreko(page);
  await architecture.getByRole('button', { name: /Explore architecture/ }).click();

  // Clicking a toggle renames it to "Hide internals", so the matching set shrinks as we
  // go. Always take the first remaining one rather than a stale index.
  const remaining = () => architecture.getByRole('button', { name: /Show internals/ });
  for (let guard = 0; (await remaining().count()) > 0 && guard < 10; guard += 1) {
    await remaining().first().click();
  }

  await architecture.getByRole('button', { name: /Trace a request/ }).click();

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

    // The controls are never hidden behind a stage — they are why the run is credible.
    await expect(panel.getByText('HELD FIXED')).toBeVisible();
    await expect(panel.getByText(/Model — qwen-plus/)).toBeVisible();

    // But the comparison itself is not imposed.
    await expect(panel.getByText('ADDED')).toHaveCount(0);

    await panel.getByRole('button', { name: /Compare plans/ }).click();
    await expect(panel.getByText('ADDED')).toBeVisible();
    await expect(panel.getByText('REMOVED')).toBeVisible();
    await expect(panel.getByText('CONSTRAINED')).toBeVisible();
  });

  test('attributes each changed row to named evidence', async ({ page }) => {
    await page.goto('/');
    const panel = diff(page);

    await panel.getByRole('button', { name: /Attribute the change/ }).click();
    await expect(panel.getByText(/BECAUSE OF/).first()).toBeVisible();
    await expect(panel.getByText(/BECAUSE OF/)).toHaveCount(3);

    // Provenance and a re-check command, not just an assertion.
    await expect(panel.getByText('shasum -a 256 -c SHA256SUMS').first()).toBeVisible();
  });

  test('links the frozen run at an immutable revision', async ({ page }) => {
    await page.goto('/');
    const link = diff(page).getByRole('link', { name: /INSPECT FROZEN RUN/ });
    await expect(link).toHaveAttribute(
      'href',
      /github\.com\/workspacejson\/datahub-agent\/blob\/[0-9a-f]{40}\//,
    );
  });

  test('steps by keyboard from a single tab stop', async ({ page }) => {
    await page.goto('/');
    const panel = diff(page);

    await panel.getByRole('button', { name: /Baseline plan/ }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(
      panel.getByRole('button', { name: /Add repository evidence/ }),
    ).toHaveAttribute('aria-pressed', 'true');

    await page.keyboard.press('End');
    await expect(
      panel.getByRole('button', { name: /Attribute the change/ }),
    ).toHaveAttribute('aria-pressed', 'true');

    await page.keyboard.press('Home');
    await expect(panel.getByRole('button', { name: /Baseline plan/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
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

    await expect(panel.getByText(/JOINT SHARED STATE · BOUND 130/)).toBeVisible();

    // Two bars, one marker, and the marker sits at the same x for both arms because
    // there is only one of it.
    await expect(panel.getByRole('img')).toHaveCount(2);
    const markers = panel.locator('[class*="marker"]:not([class*="markerLabel"])');
    await expect(markers).toHaveCount(1);
  });

  test('moves through stages to the frozen outcome', async ({ page }) => {
    await page.goto('/');
    const panel = interlock(page);

    await panel.getByRole('button', { name: /Resulting state/ }).click();
    await expect(panel.getByText('INVALID JOINT STATE').first()).toBeVisible();
    await expect(panel.getByText('CONSTRAINT HELD').first()).toBeVisible();
  });

  test('perturbation is user-triggered and changes the decision', async ({ page }) => {
    await page.goto('/');
    const panel = interlock(page);

    await panel.getByRole('button', { name: /Resulting state/ }).click();
    await expect(panel.getByText('CONSTRAINT HELD').first()).toBeVisible();

    await panel.getByRole('button', { name: /Perturb the evidence/ }).click();
    await expect(panel.getByText(/ALLOW_PARALLEL/).first()).toBeVisible();
    await expect(panel.getByText('CONSTRAINT HELD')).toHaveCount(0);
  });

  test('resolves its evidence link', async ({ page }) => {
    await page.goto('/');
    await expect(
      interlock(page).getByRole('link', { name: /INSPECT FROZEN EXPERIMENT/ }),
    ).toHaveAttribute('href', /Marcelle-Labs\/interlock\/blob\/[0-9a-f]{40}\//);
  });

  test('never uses celebratory or alarm treatment', async ({ page }) => {
    await page.goto('/');
    const panel = interlock(page);
    await panel.getByRole('button', { name: /Resulting state/ }).click();

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

test.describe('vreko architecture trace', () => {
  test('expands in place, keeping its neighbours', async ({ page }) => {
    await page.goto('/');
    const panel = vreko(page);

    // Offsets are measured relative to the panel, not the viewport: clicking scrolls
    // the page, and viewport coordinates would report that as movement.
    const offsetInPanel = async () =>
      panel.evaluate((root) => {
        const node = [...root.querySelectorAll('*')].find(
          (el) => el.textContent?.trim() === 'AI coding assistant',
        )!;
        return node.getBoundingClientRect().top - root.getBoundingClientRect().top;
      });

    const before = await offsetInPanel();
    await panel.getByRole('button', { name: /Explore architecture/ }).click();

    // The upstream neighbour is still present and has not moved within the diagram:
    // the system box grew downward, it was not replaced.
    const after = await offsetInPanel();
    expect(Math.abs(after - before)).toBeLessThan(4);

    await expect(panel.getByText('Hosted edge', { exact: true })).toBeVisible();
    await expect(panel.getByText('Your workspace')).toBeVisible();
  });

  test('discloses internals one level deeper and collapses back', async ({ page }) => {
    await page.goto('/');
    const panel = vreko(page);

    await panel.getByRole('button', { name: /Explore architecture/ }).click();
    await panel
      .getByRole('button', { name: /Show internals/ })
      .first()
      .click();
    await expect(panel.getByText('API key authentication')).toBeVisible();

    await panel.getByRole('button', { name: /^Collapse$/ }).click();
    await expect(panel.getByText('Hosted edge', { exact: true })).toHaveCount(0);
  });

  test('the trace is user-stepped and never auto-advances', async ({ page }) => {
    await page.goto('/');
    const panel = vreko(page);

    await panel.getByRole('button', { name: /Trace a request/ }).click();
    await expect(
      panel.getByText('Assistant issues a tool call', { exact: true }),
    ).toBeVisible();

    // Wait well past any plausible choreography; the hop must not move on its own.
    await page.waitForTimeout(1500);
    await expect(
      panel.getByText('Assistant issues a tool call', { exact: true }),
    ).toBeVisible();

    await panel.getByRole('button', { name: /Next hop/ }).click();
    await expect(
      panel.getByText('Crosses into the hosted edge', { exact: true }),
    ).toBeVisible();

    await panel.getByRole('button', { name: /Reset trace/ }).click();
    await expect(panel.getByRole('button', { name: /Trace a request/ })).toBeVisible();
  });

  test('states the public boundary with a re-derivable command', async ({ page }) => {
    await page.goto('/');
    const panel = vreko(page);

    await expect(
      panel.getByText(/npm view @vreko\/intelligence version/).first(),
    ).toBeVisible();
    await expect(panel.getByText('@vreko/intelligence').first()).toBeVisible();
    await expect(panel.getByText(/4 PUBLISHED · 9 NOT PUBLISHED/)).toBeVisible();
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
   * suite — and because the media emulation has to be in place before the first
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
    await expect(vreko(page).getByText('API key authentication')).toBeVisible();
    await expect(
      vreko(page).getByText('Assistant issues a tool call', { exact: true }),
    ).toBeVisible();
  });

  test('interlock bars are at their final widths immediately', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const panel = interlock(page);
    await panel.getByRole('button', { name: /Resulting state/ }).click();

    /*
     * Two independent rules make this true — the component drops `transition-property`
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
      diff(page).getByRole('button', { name: /Add repository evidence/ }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('interlock numeric labels do not overlap at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/');
    const panel = interlock(page);
    await panel.getByRole('button', { name: /Resulting state/ }).click();

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
     * `:focus-visible` — which is what actually paints the ring — does not match for
     * programmatic focus on a button. Testing it the other way would assert a ring the
     * keyboard user never sees.
     */
    await page.locator('#sec-02').getByRole('button').first().focus();

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
