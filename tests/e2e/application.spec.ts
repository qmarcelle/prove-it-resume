import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Let every running animation finish before anything is measured.
 *
 * The hero chain arrives over three seconds with staggered delays. Axe samples computed
 * styles, so a station caught mid-rise reports a blended foreground colour and a
 * contrast failure no reader ever sees. Asserting the settled state is the honest
 * check — it is the state a reader is left with, and the one that has to pass.
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
 *    ledger are the durable ones — reordered, never rewritten.
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
    'lin-history',
    'lin-practice',
    'more-evidence',
    'sec-03',
    'sec-04',
    'sec-02',
    'lin-judgement',
    'sec-06',
    'ledger',
  ]) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
});

test('/linear is not indexed, and is canonical to the durable page', async ({ page }) => {
  await page.goto('/linear');

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /follow/);
  expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toMatch(/\/$/);
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

  const section = page.locator('#lin-practice');

  /*
   * One stated-gap marker per receipt, in the place a call to action would sit — but
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
    .locator('section[id^="sec-0"]')
    .evaluateAll((sections) => sections.map((section) => section.id));
  expect(order.filter((id) => ['sec-02', 'sec-03', 'sec-04'].includes(id))).toEqual([
    'sec-03',
    'sec-04',
    'sec-02',
  ]);

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
 * stage they hold on `/` — so the section a reader reached by clicking "05" introduced
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

  const head = page.locator('#sec-02 > div').first();
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
 * handoff makes the second a structural claim — "CSS keyframes with staggered delays
 * and fill-mode both, so the settled frame is the authored DOM state" — which is only
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
   * first frame — the global rule clamps duration but not delay, so a chain that leaned
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
 * The section's whole argument is that it says what it cannot prove. Three questions
 * the design direction answered with invented copy are open on the page, and each one
 * is marked as not evidence rather than dropped — a page that silently omits what it
 * cannot support reads as complete, which is the failure mode being guarded against.
 */
test('product history states its gaps instead of filling them', async ({ page }) => {
  await page.goto('/linear');
  const section = page.locator('#lin-history');

  await expect(section.getByText('NOT YET EVIDENCE')).toHaveCount(3);
  await expect(section.getByText(/Which frontend framework/)).toBeVisible();
  await expect(
    section.getByText(/member, broker and employer product surfaces/),
  ).toBeVisible();

  // Four stages, covering the chronology the résumé prints.
  await expect(section.getByText(/^STAGE 0[1-4]$/)).toHaveCount(4);

  // And it must not answer the question it just refused.
  const prose = (await section.innerText()).toLowerCase();
  for (const framework of ['react', 'angular', 'vue']) {
    expect(prose, `${framework} is not supported by the fact corpus`).not.toContain(
      framework,
    );
  }
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
  const section = page.locator('#lin-practice');
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
