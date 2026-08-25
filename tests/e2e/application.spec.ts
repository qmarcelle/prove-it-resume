import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

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
    'sec-04',
    'sec-03',
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
  // One stated-gap marker per receipt, in the place a call to action would sit.
  await expect(section.getByText('[VERIFY BEFORE PUBLISHING]')).toHaveCount(3);
  await expect(section.getByText(/stated claims, not verified evidence/)).toBeVisible();
});

test('/linear projects the durable proofs rather than forking them', async ({ page }) => {
  await page.goto('/linear');

  // Interlock leads on this surface; Vreko is demoted. The sections are the same
  // modules the durable page renders, so their boundaries come along unchanged.
  const order = await page
    .locator('section[id^="sec-0"]')
    .evaluateAll((sections) => sections.map((section) => section.id));
  expect(order.filter((id) => ['sec-02', 'sec-03', 'sec-04'].includes(id))).toEqual([
    'sec-04',
    'sec-03',
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
