import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Let every running animation finish before anything is measured.
 *
 * The hero chain arrives over three seconds with staggered delays. Axe samples computed
 * styles, so a station caught mid-rise reports a blended foreground colour and a
 * contrast failure no reader ever sees. Asserting the settled state is the honest
 * check; it is the state a reader is left with, and the one that has to pass.
 */
const settle = (page: Page) =>
  page.evaluate(() =>
    Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))),
  );

/**
 * The Linear application surface.
 *
 * Three things are being protected here, in descending order of how bad it would be to
 * lose them:
 *
 * 1. **The private/public boundary.** No workspace URL, no issue body, no credential
 *    may reach the page a browser renders. `linear.test.ts` scans the source; this
 *    scans the served HTML, which is the artifact that actually leaves the building.
 * 2. **One address per surface.** `/linear` exists and `/role/linear` does not. Two
 *    public representations of one application is the duplication the whole lens
 *    architecture exists to prevent, and it would appear silently the moment the
 *    registries were merged.
 * 3. **The evidence is the same evidence.** The proofs, their boundaries, and the claim
 *    ledger are the durable ones: reordered, never rewritten.
 */
test('/linear renders the application surface', async ({ page }) => {
  const response = await page.goto('/linear');
  expect(response?.status()).toBe(200);

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /I build AI products and the systems that make them reliable/,
    }),
  ).toBeVisible();

  // Each stage of the page plan is a section that is actually on the page.
  for (const id of [
    'product-history',
    'linear-in-practice',
    'never-ask-twice',
    'repository-intelligence',
    'interlock',
    'vreko',
    'product-judgment',
    'career',
    'claim-ledger',
  ]) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
});

test('/linear is not indexed, and is canonical to the durable page', async ({ page }) => {
  await page.goto('/linear');

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /follow/);

  /*
   * Absolute, and pointing at the durable page.
   *
   * It used to be asserted as "ends with a slash", which passed on the relative `/` this
   * emitted before a canonical origin was declared. Now that `metadataBase` is set, Next
   * resolves it to an absolute URL and normalises the root path away, so the property
   * worth checking is the one that was always meant: this surface is canonical to the
   * site root, on the real origin, not to itself.
   */
  const canonical = new URL(
    (await page.locator('link[rel="canonical"]').getAttribute('href')) ?? '',
  );
  expect(canonical.protocol).toBe('https:');
  expect(canonical.pathname).toBe('/');
});

test('/linear describes itself, rather than inheriting the durable page card', async ({
  page,
}) => {
  /*
   * The unfurl is the first thing most recipients of this link see, because a link sent
   * to a hiring team is pasted into a channel before it is opened. Only `title` and
   * `description` were set per route, so `openGraph` came from the root layout and
   * `/linear` unfurled as a description of the three durable proofs: the tab right and
   * the card about a different page.
   */
  await page.goto('/linear');

  const og = async (property: string) =>
    page.locator(`meta[property="${property}"]`).getAttribute('content');

  expect(await og('og:title')).toContain('Linear');
  expect(await og('og:description')).toContain('Linear');
  expect(await og('og:url')).toMatch(/^https:\/\/[^/]+\/linear$/);

  // And it must not be the durable page's card, whatever that card currently says.
  await page.goto('/');
  const durableTitle = await og('og:title');
  await page.goto('/linear');
  expect(await og('og:title')).not.toBe(durableTitle);
});

test('the application surface has no second address under /role', async ({ page }) => {
  const response = await page.goto('/role/linear');
  expect(response?.status()).toBe(404);
});

test('the durable routes are unchanged', async ({ page }) => {
  for (const route of ['/', '/role/athenahealth-yoh', '/role/end-to-end-delivery']) {
    const response = await page.goto(route);
    expect(response?.status(), `${route} must still resolve`).toBe(200);
  }

  // The durable page still opens on the durable claim, not on an application's framing.
  await page.goto('/');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /I build the infrastructure between AI agents and production software/,
    }),
  ).toBeVisible();
});

test('no private workspace data reaches the served page', async ({ page }) => {
  await page.goto('/linear');
  const html = await page.content();

  expect(html).not.toMatch(/linear\.app/i);
  expect(html).not.toMatch(/LINEAR_API_KEY|LINEAR_TOKEN/);

  // The identifiers are printed; they are handles, not links. Nothing on the page may
  // point at a destination the reader cannot open.
  await expect(page.getByText('META-268', { exact: true })).toBeVisible();
  const hrefs = await page
    .locator('a[href]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  for (const href of hrefs) {
    expect(href).not.toContain('linear.app');
  }
});

test('receipts state their limits and claim no verified evidence', async ({ page }) => {
  await page.goto('/linear');

  const section = page.locator('#linear-in-practice');

  /*
   * One stated-gap marker per receipt, in the place a call to action would sit, but
   * the receipts are a tab strip once the page has hydrated, so only the open one is on
   * screen. Walking the strip is the assertion that matters: no receipt may be reachable
   * without its marker, because a receipt without one reads as verified evidence.
   */
  const tabs = section.getByRole('tab');
  await expect(tabs).toHaveCount(3);

  for (const identifier of ['META-268', 'META-331', 'INFRA-11']) {
    await tabs.filter({ hasText: identifier }).click();
    const panel = section.getByRole('tabpanel');
    await expect(panel.getByText('[VERIFY BEFORE PUBLISHING]')).toHaveCount(1);
    // Every receipt states what it does not establish, in the same panel as the finding.
    await expect(panel.getByText(/It does not establish|Establishes/)).toHaveCount(1);
  }

  await expect(section.getByText(/stated claims, not verified evidence/)).toBeVisible();
});

test('/linear projects the durable proofs rather than forking them', async ({ page }) => {
  await page.goto('/linear');

  // Repository Intelligence then Interlock on this surface; Vreko is demoted to the
  // close. The sections are the same modules the durable page renders, so their
  // boundaries come along unchanged.
  const order = await page
    .locator('main section[id]')
    .evaluateAll((sections) => sections.map((section) => section.id));
  expect(
    order.filter((id) => ['vreko', 'repository-intelligence', 'interlock'].includes(id)),
  ).toEqual(['repository-intelligence', 'interlock', 'vreko']);

  await expect(
    page.getByRole('button', { name: /Inspect evidence.*EV-ILK/ }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /SHOW CLAIM LEDGER/ })).toBeVisible();
});

test('the proof rail maps the page it is on', async ({ page }) => {
  await page.goto('/linear');

  const labels = await page
    .getByRole('navigation', { name: 'Proof progress' })
    .locator('li button')
    .evaluateAll((buttons) => buttons.map((button) => button.textContent ?? ''));

  expect(labels[0]).toContain('Product history');
  expect(labels[1]).toContain('Linear in practice');
  expect(labels).toHaveLength(9);
});

/**
 * One sequence, everywhere it is shown.
 *
 * The defect this guards against was visible on the served page: the rail counted the
 * page plan, the header nav counted something else, and the proof sections printed the
 * stage they hold on `/`, so the section a reader reached by clicking "05" introduced
 * itself as "03". These assertions read the numbers out of each surface that renders
 * them and require them to be the same list.
 */
test('every visible sequence on /linear is the same sequence', async ({ page }) => {
  await page.goto('/linear');

  const rail = await page
    .getByRole('navigation', { name: 'Proof progress' })
    .locator('li button')
    .evaluateAll((buttons) =>
      buttons.map((button) => ({
        n: button.querySelector('span')?.textContent?.trim() ?? '',
        id: '',
      })),
    );

  // The rail counts from 01 upward with no gaps and no repeats.
  expect(rail.map((step) => step.n)).toEqual(
    rail.map((_, index) => String(index + 1).padStart(2, '0')),
  );

  // Each section prints the number the rail gave it, at the position the rail gave it.
  const printed = await page
    .locator('main section:has(> [data-section-head], > div > [data-section-head])')
    .evaluateAll((sections) =>
      sections.map((section) => ({
        id: section.id,
        n:
          section
            .querySelector('[data-section-index]')
            ?.getAttribute('data-section-index') ?? '',
      })),
    );

  expect(printed.map((entry) => entry.n)).toEqual(rail.map((step) => step.n));

  // The header nav points at the sections it numbers, using those same numbers.
  const nav = await page
    .getByRole('navigation', { name: 'Sections' })
    .locator('a')
    .evaluateAll((links) =>
      links.map((link) => ({
        label: link.textContent?.trim() ?? '',
        href: link.getAttribute('href') ?? '',
      })),
    );

  for (const [index, entry] of nav.entries()) {
    expect(entry.label.startsWith(rail[index].n)).toBe(true);
    expect(entry.href).toBe(`#${printed[index].id}`);
  }
});

/**
 * A proof's durable stage is a fact about `/`, and may not leak onto this page.
 *
 * Vreko is stage `02` in the content model and sixth in this surface's plan. A reader
 * here must be shown `06`, and must not be shown `02` anywhere in that section's head.
 */
test('proof sections take their number from the plan, not from their durable stage', async ({
  page,
}) => {
  await page.goto('/linear');

  const head = page.locator('#vreko > div').first();
  await expect(head).toContainText('06');
  await expect(head).toContainText('PLATFORM DEPTH');
  await expect(head).not.toContainText('PROOF ONE');
});

/**
 * One index rail, one content origin.
 *
 * Editorial sections, the receipts band, the product proofs, the compact treatment and
 * the demoted platform-depth row are five different frames. They are allowed to differ
 * in ground, density and scale; they are not allowed to differ in where the number sits
 * or where the heading begins, which is what made the old page read as five stacked
 * documents rather than one.
 */
test('every section head shares one horizontal anchor', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/linear');

  const origins = await page.locator('main [data-section-head]').evaluateAll((heads) =>
    heads.map((head) => ({
      id: head.closest('section')?.id ?? '',
      frame: head.getAttribute('data-section-head') ?? '',
      index: Math.round(
        head.querySelector('[data-section-index]')!.getBoundingClientRect().left,
      ),
      title: Math.round(head.querySelector('h2')!.getBoundingClientRect().left),
    })),
  );

  // All four frames are exercised, so the assertion below is about the frame set and
  // not about the one frame that happens to be most common.
  expect(new Set(origins.map((entry) => entry.frame))).toEqual(
    new Set(['standard', 'band', 'inline']),
  );

  expect(origins.length).toBeGreaterThanOrEqual(8);

  const [first] = origins;
  for (const entry of origins) {
    expect(entry.index, `${entry.id} index rail`).toBe(first.index);
    expect(entry.title, `${entry.id} content origin`).toBe(first.title);
  }
});

test('/linear has no automatically detectable accessibility violations', async ({
  page,
}) => {
  await page.goto('/linear');
  await settle(page);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('/linear is clean with its disclosures open', async ({ page }) => {
  await page.goto('/linear');

  await page.getByRole('button', { name: /Inspect evidence.*EV-ILK/ }).click();
  await page.getByRole('button', { name: /Inspect evidence.*EV-WSJ/ }).click();
  await page.getByRole('button', { name: /Inspect evidence.*EV-VRK/ }).click();
  await page.getByRole('button', { name: /SHOW CLAIM LEDGER/ }).click();
  await settle(page);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('/linear does not scroll horizontally at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/linear');

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

/**
 * The hero chain.
 *
 * Two properties, and the second is the one that decays quietly: the figure has to be
 * readable as text, and it has to be complete without motion. The direction's own
 * handoff makes the second a structural claim: "CSS keyframes with staggered delays
 * and fill-mode both, so the settled frame is the authored DOM state", which is only
 * true for as long as nobody reaches for JavaScript to sequence it.
 */
test('the hero chain names its five stations in order', async ({ page }) => {
  await page.goto('/linear');
  // Scoped to the figure by its caption: the hero also carries the capabilities list,
  // and "the first list in the hero" is a locator that breaks on any reordering.
  const chain = page.getByRole('figure').filter({ hasText: 'HOW WORK BECOMES EVIDENCE' });

  const stations = await chain.getByRole('listitem').allInnerTexts();
  expect(stations).toHaveLength(5);
  for (const [index, name] of [
    'PRODUCT',
    'CONTEXT',
    'AGENT',
    'DECISION',
    'VERIFIED',
  ].entries()) {
    expect(stations[index]).toContain(name);
  }
});

test('the hero chain is complete with motion disabled', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/linear');

  /*
   * No settling, deliberately. Under reduced motion the figure must be finished on the
   * first frame: the global rule clamps duration but not delay, so a chain that leaned
   * on staggered delays would still stage itself into view here.
   */
  const stations = page
    .getByRole('figure')
    .filter({ hasText: 'HOW WORK BECOMES EVIDENCE' })
    .getByRole('listitem');
  for (let index = 0; index < 5; index += 1) {
    const opacity = await stations.nth(index).evaluate((el) => {
      const style = getComputedStyle(el);
      return { opacity: Number(style.opacity), animation: style.animationName };
    });
    expect(opacity.animation, `station ${index} still animates`).toBe('none');
    expect(opacity.opacity, `station ${index} is not fully drawn`).toBe(1);
  }
});

/**
 * The product-history registers.
 *
 * The section's argument was always that it says what it cannot prove. For most of this
 * project that meant three dashed boxes on the page: the 2016–2019 period, the frontend
 * stack, and per-audience product ownership, each a question the design direction had
 * answered with invented copy and the corpus could not support.
 *
 * All three have since been answered by the record, so `UNVERIFIED` is empty and the
 * page states every register in full. That is the outcome the mechanism was for, and
 * this test now guards the other direction: the answers have to be the *recorded* ones,
 * and answering three questions must not license answering a fourth nobody asked. The
 * unresolved rendering path itself is covered against a fixture in
 * `ProductHistorySection.test.tsx`, so it stays working for the next open question.
 */
test('product history states the record rather than a gap', async ({ page }) => {
  await page.goto('/linear');
  const section = page.locator('#product-history');

  // Nothing is outstanding, so nothing is marked outstanding.
  await expect(section.getByText('NOT YET EVIDENCE')).toHaveCount(0);

  // The three questions that used to be dashed boxes, now answered on the page.
  await expect(section.getByText(/Contact Preference/).first()).toBeVisible();
  await expect(section.getByText(/React/).first()).toBeVisible();
  await expect(section.getByText('Brokers and employers')).toBeVisible();

  // Four stages, covering the chronology the résumé prints.
  await expect(section.getByText(/^STAGE 0[1-4]$/)).toHaveCount(4);

  // And the answers stop where the record does.
  const prose = (await section.innerText()).toLowerCase();
  for (const claim of ['angular', 'vue', 'graphql', 'redux', 'commissions', 'quoting']) {
    expect(prose, `${claim} is not supported by the fact corpus`).not.toContain(claim);
  }
});

/**
 * Team work stays team work on the page as well as on the sheet.
 *
 * The register describing who the products served is the place a portal estate built by
 * fourteen engineers is most likely to quietly become something one person made, because
 * every row is a short line of prose about a product surface.
 */
test('product history attributes the portal estate to the team that owned it', async ({
  page,
}) => {
  await page.goto('/linear');
  const section = page.locator('#product-history');

  await expect(section.getByText(/Services the team owned/)).toBeVisible();
  await expect(
    section.getByText(/shared portal infrastructure the same team owned/),
  ).toBeVisible();

  // And the hands-on work is still stated as hands-on where it was.
  await expect(section.getByText(/built hands-on/)).toBeVisible();
});

/**
 * The receipt tab strip.
 *
 * Keyboard behaviour is the part most likely to be lost in a refactor, because a mouse
 * user never notices it is gone. Selection is also checked for a non-chromatic signal:
 * `aria-selected` is what assistive technology reads, and a strip that carried its
 * state only in an amber edge would pass a visual review and fail a real one.
 */
test('receipt tabs move under the arrow keys', async ({ page }) => {
  await page.goto('/linear');
  const section = page.locator('#linear-in-practice');
  const tabs = section.getByRole('tab');

  await tabs.first().click();
  await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
  await expect(section.getByRole('tabpanel')).toContainText(/Codex through Linear/);

  await page.keyboard.press('ArrowDown');
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.nth(1)).toBeFocused();
  await expect(section.getByRole('tabpanel')).toContainText(/execution surfaces/);

  // End and Home reach the ends, and the strip wraps rather than dead-ending.
  await page.keyboard.press('End');
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
});

/**
 * ── Reading rhythm ───────────────────────────────────────────────────────────
 *
 * The composition pass that produced these had one finding behind all of its changes:
 * a layout can have zero overflow at every width and still be hard to read. What broke
 * was never mechanical. It was that the *entry point* of every section was a two-column
 * negotiation, so a heading's line length was a residue of the viewport rather than a
 * decision about the sentence, and the reader entered each section by looking right
 * and up before going left and down.
 *
 * These tests protect the invariants that fix costs the most to lose, and deliberately
 * not the ones that would pin the page to a font rasterisation. No exact line count is
 * asserted, no wrapping string is asserted, and no screenshot is compared. What is
 * asserted is structural: heads stack, prose stays inside a stated measure, and the end
 * of the argument is separated from the close by a chapter rather than a paragraph.
 */
const READING_WIDTHS = [1440, 1280, 1180, 1024, 900, 768];

/**
 * The reading spine: one column, entered from the top.
 *
 * The head used to be a wrapping flex row. Above roughly 1100px both children fit, so
 * the title took about half the column and the lead beside it started *above* the
 * heading it belongs to. Below that the row wrapped and the same page read completely
 * differently: the two regimes were a width apart and neither was chosen.
 *
 * The invariant is not "the lead is 56 characters wide". It is that a section's
 * orientation paragraph never begins before the heading it orients, which is what makes
 * the page readable downward.
 */
for (const width of READING_WIDTHS) {
  test(`every section head reads downward at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/linear');

    const heads = await page
      .locator('main [data-section-head]:has(h2)')
      .evaluateAll((nodes) =>
        nodes
          .map((head) => {
            const title = head.querySelector('h2')!.getBoundingClientRect();
            const lead = head.querySelector('p');
            if (!lead) return null;
            const box = lead.getBoundingClientRect();
            return {
              id: head.closest('section')?.id ?? '',
              titleBottom: Math.round(title.bottom),
              leadTop: Math.round(box.top),
            };
          })
          .filter((entry) => entry !== null),
      );

    expect(heads.length, 'no section head carries a lead').toBeGreaterThan(0);
    for (const head of heads) {
      expect(
        head.leadTop,
        `${head.id}: the lead starts beside the heading rather than beneath it`,
      ).toBeGreaterThanOrEqual(head.titleBottom);
    }
  });
}

/**
 * A ceiling on the reading measure, not a target.
 *
 * The worst line on this page ran to about 119 characters: a boundary statement set
 * across the full section width under a heading measured at 36. The ceiling here is
 * deliberately generous; it is a guard against a measure being *forgotten*, which is
 * how every one of these appeared, rather than a re-litigation of any particular value.
 *
 * Measured in `ch` resolved against each element's own computed font, so it does not
 * depend on a pixel width, a viewport, or the type scale. Elements whose content is a
 * technical identifier are exempt: a path or a digest has to be allowed to run.
 */
test('no reader-facing paragraph exceeds a usable reading measure', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/linear');

  // Every disclosure open: an unbounded measure is likeliest in copy nobody sees by
  // default, which is exactly where it survived last time.
  for (const control of await page.locator('[aria-expanded="false"]').all()) {
    await control.click({ timeout: 2000 }).catch(() => {});
  }

  const wide = await page.evaluate(() => {
    const probe = document.createElement('canvas').getContext('2d')!;
    const out: { measure: number; text: string }[] = [];

    for (const el of document.querySelectorAll<HTMLElement>('main p')) {
      const text = (el.textContent ?? '').trim();
      // Short strings cannot demonstrate a measure problem, and a run of monospace is
      // a technical identifier rather than prose.
      if (text.length < 120) continue;
      const style = getComputedStyle(el);
      if (style.fontFamily.includes('mono')) continue;
      if (el.getBoundingClientRect().width === 0) continue;

      probe.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const ch = probe.measureText('0').width;
      const measure = Math.round(el.getBoundingClientRect().width / ch);
      if (measure > 90) out.push({ measure, text: text.slice(0, 60) });
    }
    return out;
  });

  expect(wide, 'a paragraph is set wider than it can be read').toEqual([]);
});

/**
 * A chapter boundary is a chapter apart.
 *
 * Section 09 closes on a dense bordered control and the page then changes chapter: the
 * argument ends and the close begins. On the Lit Work Surface that change of ground is
 * a single tonal step (the body sits on the canvas and the close one step up) which
 * is enough to say "a different block" and nowhere near enough to say "the argument
 * ended". With only ordinary section padding between them the closing headline read as
 * section ten.
 *
 * The assertion is a ratio rather than a figure: whatever the rhythm is, the chapter
 * gap has to be visibly more than the gap between two ordinary sections.
 */
test('the close is separated from the argument by a chapter, not a paragraph', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto('/linear');

  const gaps = await page.evaluate(() => {
    const sections = [...document.querySelectorAll<HTMLElement>('main > section')];
    const last = sections.at(-1)!.getBoundingClientRect();
    const closing = document.querySelector<HTMLElement>('main ~ * h2, main ~ * h3');
    // The closing headline is the first heading after the numbered argument ends.
    const heading = [...document.querySelectorAll<HTMLElement>('h2')].find(
      (h) => !h.closest('main') && h.getBoundingClientRect().top > last.bottom,
    );

    // The largest gap between two adjacent numbered sections is the intra-argument
    // rhythm this has to beat.
    let intra = 0;
    for (let i = 1; i < sections.length; i += 1) {
      intra = Math.max(
        intra,
        sections[i].getBoundingClientRect().top -
          sections[i - 1].getBoundingClientRect().bottom,
      );
    }

    return {
      intra: Math.round(intra),
      chapter: Math.round(
        (heading ?? closing!).getBoundingClientRect().top - last.bottom,
      ),
    };
  });

  expect(
    gaps.chapter,
    'the closing chapter starts a paragraph after the argument',
  ).toBeGreaterThan(Math.max(gaps.intra * 2, 120));
});

/**
 * No sideways scroll at the intermediate widths.
 *
 * `responsive.spec.ts` already covers the two ends. The regime this pass changed is the
 * middle (the widths where a multi-column composition still fits mathematically) so
 * those are the ones a layout change is most likely to break without anyone noticing.
 */
for (const width of [1280, 1180, 900, 640]) {
  test(`/linear does not scroll sideways at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/linear');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

/**
 * No width gets a rail nobody designed.
 *
 * The progress rail has two intended forms: a sticky sidebar beside the evidence, and a
 * compact horizontal strip above it. Which one appears is decided in two places: the
 * layout shell wraps the rail onto its own line by flex basis, and the rail restyles
 * itself at a media query, and for a band of widths those two disagreed. Between 900
 * and 943 the wrap had already pushed the rail full-width while it was still laid out
 * as a sidebar: nine steps in two wrapped rows above the evidence, no scroll, no rule.
 *
 * The two thresholds are now derived from the same arithmetic, and this sweeps the seam
 * to keep them that way. It asserts the *disjunction* rather than either threshold, so
 * the rhythm can be retuned without rewriting the test: what may not come back is a
 * width where the rail is neither one thing nor the other.
 */
test('the progress rail is a sidebar or a strip, never the state in between', async ({
  page,
}) => {
  for (const width of [960, 944, 943, 930, 910, 900, 890, 860]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/linear');

    const shape = await page.evaluate(() => {
      const rail = document.querySelector<HTMLElement>(
        'nav[aria-label="Proof progress"]',
      )!;
      const main = document.querySelector<HTMLElement>('main')!;
      const steps = rail.querySelector<HTMLElement>('ol')!;
      const rows = new Set(
        [...steps.children].map((li) => Math.round(li.getBoundingClientRect().top)),
      ).size;
      return {
        beside:
          rail.getBoundingClientRect().right <= main.getBoundingClientRect().left + 2,
        rows,
      };
    });

    // Beside the evidence it is a column and may use as many rows as it has steps.
    // Above the evidence it must be the strip: one row, scrolling within itself.
    expect(
      shape.beside || shape.rows === 1,
      `${width}px: the rail is full-width but still laid out as a sidebar`,
    ).toBe(true);
  }
});

/**
 * A head is separated from what it introduces, and by the same distance every time.
 *
 * Six of the nine heads used to have a gap of exactly zero. The page got away with it
 * because the proof sections render their head *inside* the body's flex column, where
 * it collected that column's gap by accident, while the editorial sections render it as
 * a sibling, where it collected nothing, and a single line of display type leaves
 * enough slack underneath that nobody could see the difference.
 *
 * Stacking the head made the long titles wrap. The slack went with it, and the claim
 * ledger's second line came to rest on the top border of the control below it.
 *
 * So this asserts the property that was missing rather than the symptom: every head is
 * clear of its body, and every section opens at the same distance. Stated as "equal to
 * each other and greater than zero" rather than as a figure, so the rhythm stays free
 * to change and cannot silently go back to being nothing.
 */
for (const width of [1440, 1024, 900, 390]) {
  test(`no section head touches the block it introduces at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/linear');

    const gaps = await page.locator('main [data-section-head]').evaluateAll((heads) =>
      heads
        .map((head) => {
          const next = head.nextElementSibling;
          if (!next) return null;
          return {
            id: head.closest('section')?.id ?? '',
            gap: Math.round(
              next.getBoundingClientRect().top - head.getBoundingClientRect().bottom,
            ),
          };
        })
        .filter((entry) => entry !== null),
    );

    expect(gaps.length).toBeGreaterThanOrEqual(8);
    for (const entry of gaps) {
      expect(entry.gap, `${entry.id}: the head sits on its own body`).toBeGreaterThan(8);
    }
    // One rhythm, not nine. A section that brought its own spacing would show here.
    expect(new Set(gaps.map((entry) => entry.gap)).size).toBe(1);
  });
}

/**
 * The receipts rest closed, and the section makes its case anyway.
 *
 * `/linear` used to serve one receipt already expanded, so that a reader who clicked
 * nothing still saw what a recorded decision contains. The resting state is now closed
 * for all seven, which puts that burden back on the copy above the list, and this
 * checks both halves of the trade, because losing either one is what would make the
 * change a regression rather than a decision.
 *
 * Run with JavaScript genuinely off rather than against the served markup, because
 * "rests collapsed" is a claim about what a reader is looking at, not about what the
 * first response happened to contain. A panel rendered open and then closed on hydration
 * would satisfy a string search and fail the reader.
 */
test('every decision receipt rests collapsed, with the section still stating its case', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/linear');

  const judgment = page.locator('#product-judgment');

  // The summaries are all there: seven questions, every one of them shut.
  const triggers = judgment.getByRole('button', { expanded: false });
  await expect(triggers).toHaveCount(7);
  await expect(judgment.getByRole('button', { expanded: true })).toHaveCount(0);
  await expect(
    judgment.getByRole('button', { name: /What did your experiments fail to prove/ }),
  ).toBeVisible();

  /*
   * And no receipt body with them. Asserted against a receipt's own prose rather than
   * against its field labels: the labels are also printed by the shape strip above the
   * list, which is the thing that must NOT disappear, so an absence check on those would
   * pass only by breaking the other half of this test.
   */
  await expect(judgment.getByText(/Record the negatives at full strength/)).toHaveCount(
    0,
  );
  await expect(
    judgment.getByText(/A preregistered experiment can only report/),
  ).toHaveCount(0);

  // The case the open receipt used to make, made in the open instead.
  await expect(
    judgment.getByRole('heading', { name: /defend a decision/i }),
  ).toBeVisible();
  await expect(judgment.getByText(/recorded at the time it was made/)).toBeVisible();
  for (const part of [
    'CONSTRAINT',
    'ALTERNATIVES CONSIDERED',
    'DECISION',
    'FAILURE MODE / TRADEOFF',
    'EVIDENCE',
    'WHAT WOULD CHANGE THE DECISION NOW',
  ]) {
    await expect(
      judgment.getByText(part, { exact: true }).first(),
      `the receipt shape no longer names ${part}`,
    ).toBeVisible();
  }

  await context.close();
});

/**
 * Closed at rest is only acceptable because opening one is cheap and works.
 */
test('a receipt opens on demand and brings its whole shape with it', async ({ page }) => {
  await page.goto('/linear');

  const judgment = page.locator('#product-judgment');
  const trigger = judgment.getByRole('button', {
    name: /What did your experiments fail to prove/,
  });

  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(judgment.getByText(/Record the negatives at full strength/)).toBeVisible();

  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

/**
 * The hero's right column is the ten-second answer, and it has to end somewhere visible.
 *
 * The order is deliberate and is not what this protects: the index comes first, because
 * a reader should see *what there is to inspect* before being told how the evidence
 * model works. What this protects is that the second half is legible as a continuation
 * rather than as something that fell off the bottom: the reader should be able to see
 * that a system exists under the list without scrolling for it.
 *
 * Asserted at a stated viewport rather than at whatever the project happens to use, and
 * against the caption plus the first station only. Everything past that is a bonus; a
 * test that demanded three would be a test about font metrics.
 */
test('the evidence model reads as a continuation of the index, not as overflow', async ({
  page,
}) => {
  // A common laptop fold, and the shortest of the ones this was tuned against.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/linear');
  await settle(page);

  const visible = await page.evaluate(() => {
    const figure = document.querySelector<HTMLElement>('figure[class*="EvidenceChain"]')!;
    const caption = figure.querySelector<HTMLElement>('[class*="caption"]')!;
    const first = figure.querySelector<HTMLElement>('li')!;
    return {
      caption: Math.round(caption.getBoundingClientRect().bottom),
      firstStation: Math.round(first.getBoundingClientRect().bottom),
      fold: window.innerHeight,
    };
  });

  expect(
    visible.caption,
    'the evidence model is titled below the fold',
  ).toBeLessThanOrEqual(visible.fold);
  expect(
    visible.firstStation,
    'nothing of the evidence model is legible above the fold',
  ).toBeLessThanOrEqual(visible.fold);
});

/**
 * The index is as tall as what is in it.
 *
 * It carried `flex: 1 1 380px`, copied from the width its parent column uses on the
 * *inline* axis, but that parent lays out in a column, so the basis resolved against
 * the block axis and became a floor on height. Nothing showed while the rows were tall
 * enough to clear it. Compressing them dropped the durable page's three-row index to
 * 331px of content inside a 380px bordered box: fifty pixels of empty ground, in the
 * one panel on the page whose entire job is to be dense and scannable.
 *
 * Both surfaces, because the bug is only visible on whichever one currently has fewer
 * rows, and which one that is has changed once already.
 */
for (const path of ['/', '/linear']) {
  test(`the evidence index on ${path} is the height of its content`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(path);

    const box = await page.evaluate(() => {
      const index = document.querySelector<HTMLElement>(
        'nav[aria-label="Evidence index"]',
      )!;
      const content = [...index.children].reduce(
        (total, child) => total + child.getBoundingClientRect().height,
        0,
      );
      return {
        height: Math.round(index.getBoundingClientRect().height),
        content: Math.round(content),
      };
    });

    // Borders and sub-pixel rounding only. A stretched panel shows up as tens of pixels.
    expect(box.height - box.content, 'the index is padded out to a basis').toBeLessThan(
      8,
    );
  });
}
