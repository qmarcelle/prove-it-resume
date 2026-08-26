import { expect, test, type Page } from '@playwright/test';

/**
 * Résumé geometry and the download path.
 *
 * The résumé is a fixed 8.5in × 11in document with `overflow: hidden`: unlike the rest
 * of the site it cannot reflow, so anything that grows a block pushes content past the
 * bottom edge, where it is silently clipped rather than wrapped. That failure is
 * invisible in a unit test and invisible on screen until you look at the PDF, so the
 * page box and the bottom-anchored elements are asserted directly.
 *
 * This caught a real regression during the port: the site body's `line-height: 1.6`
 * cascaded into the document and pushed page two's footer off the sheet.
 */

/** 8.5in × 11in at CSS's fixed 96dpi. */
const PAGE_W = 816;
const PAGE_H = 1056;

/*
 * Vertical room every sheet must keep between its content and the bottom of its box.
 *
 * Not a style preference, a tolerance. The sheets are fixed-height with `overflow:
 * hidden`, and text metrics differ between the machine a layout is tuned on and the one
 * that renders it: the same durable sheet that fit exactly here was clipped by 7px on a
 * CI runner. The reserve is what stops that being discovered in a print dialog.
 *
 * ## What the number does not tell you
 *
 * This is the floor the *runner* has to clear, and it is not the target to tune against
 * locally. The gap between the two platforms scales with how much text a page carries,
 * because the difference accumulates per line rather than per page. A later pass tuned
 * two dense sheets to 40px and 31px of local headroom on macOS, which read as
 * comfortable, and Linux turned them into 5px and **-4px**: the Linear sheet clipped its
 * own section head, and the failure surfaced only in CI.
 *
 * Measured delta on a page holding a paragraph plus nine bullets: **about 35px**. A
 * sparse page costs far less. So when adding content, budget local headroom of roughly
 * `PAGE_RESERVE + 35` on a dense page before believing it fits, and treat a local
 * reading under 60px on a full sheet as untested rather than as passing.
 */
const PAGE_RESERVE = 12;

const ROUTES = [
  { route: '/resume/print', title: 'STAFF / PRINCIPAL AI PLATFORM ENGINEER' },
  { route: '/resume/print/athenahealth-yoh', title: 'SENIOR AI PLATFORM ENGINEER' },
  { route: '/resume/print/end-to-end-delivery', title: 'END-TO-END DELIVERY ENGINEER' },
  { route: '/resume/print/linear', title: 'STAFF AI PRODUCT & PLATFORM ENGINEER' },
];

async function printPage(page: Page, route: string) {
  await page.emulateMedia({ media: 'print' });
  await page.goto(route);
  await page.evaluate(() => document.fonts.ready);
}

for (const { route, title } of ROUTES) {
  test(`${route} renders two letter-sized pages`, async ({ page }) => {
    await printPage(page, route);

    const pages = page.locator('[id^="resume-page-"]');
    await expect(pages).toHaveCount(2);

    for (const id of ['#resume-page-1', '#resume-page-2']) {
      const box = await page.locator(id).boundingBox();
      expect(box?.width).toBeCloseTo(PAGE_W, 0);
      expect(box?.height).toBeCloseTo(PAGE_H, 0);
    }
  });

  test(`${route} keeps its masthead title on one line, with room to spare`, async ({
    page,
  }) => {
    await printPage(page, route);

    await expect(page.getByText(title, { exact: true })).toBeVisible();

    // Two mono lines would be ~41px. A wrap here shifts the whole document down and, on
    // a fixed page box, clips the footer off the bottom of page two.
    const row = await page.locator('#resume-page-1 header > div').nth(1).boundingBox();
    expect(row?.height).toBeLessThan(32);

    /*
     * Headroom, not just line count. The title and the domains string share one fixed
     * measure, and the export's own tuning left 1.3px of slack, which fit on macOS and
     * wrapped on Linux, because font metrics differ between Chromium builds. Asserting
     * the margin is what makes this catch a too-long title here rather than on whatever
     * platform someone else runs.
     */
    const slack = await page.evaluate(() => {
      const el = document.querySelectorAll('#resume-page-1 header > div')[1];
      if (!el) return -1;
      const used = [...el.children].reduce(
        (total, child) => total + child.getBoundingClientRect().width,
        0,
      );
      const GAP = 18;
      return el.clientWidth - used - GAP;
    });

    expect(slack, 'masthead must not sit within a hair of wrapping').toBeGreaterThan(12);
  });

  /*
   * The contact row holds the location and three links, and they fit on one line at
   * this measure. Wrapping is not a layout failure here: the row is authored with
   * `flex-wrap: wrap` and a row gap, so a second line costs ~19px on a page that cannot
   * reflow, but it is a legibility one, because the row is scanned rather than read
   * and a wrapped entry reads as belonging to whatever sits above it.
   *
   * One line is also what keeps a fourth entry from being added without anyone
   * noticing. That is how `qwynn.marcellelabs.io` ended up in this row beside
   * `qwynn@marcellelabs.io`, one character apart, and read as a duplicate address.
   */
  /*
   * The identity line carries the name, the place, and the page meta on one row. It has
   * the same failure mode the target row does: font metrics differ between Chromium
   * builds, so a line that fits on macOS can wrap on Linux, and the same consequence:
   * a wrap here shifts the whole fixed-height document down. Asserted as headroom
   * rather than line count so a longer name fails here rather than on someone else's
   * machine.
   */
  test(`${route} keeps the identity line on one line, with room to spare`, async ({
    page,
  }) => {
    await printPage(page, route);

    const slack = await page.evaluate(() => {
      const el = document.querySelectorAll('#resume-page-1 header > div')[0];
      if (!el) return -1;
      const used = [...el.children].reduce(
        (total, child) => total + child.getBoundingClientRect().width,
        0,
      );
      const GAP = 24;
      return el.clientWidth - used - GAP;
    });

    expect(slack, 'identity line must not sit within a hair of wrapping').toBeGreaterThan(
      12,
    );
  });

  test(`${route} keeps the contact row on one line`, async ({ page }) => {
    await printPage(page, route);

    // One line is ~23px here; two would be ~42px.
    const row = await page.locator('#resume-page-1 header > div').nth(2).boundingBox();
    expect(row?.height, 'contact row must not wrap').toBeLessThan(32);
  });

  /*
   * The check that actually catches a clipped sheet.
   *
   * The bottom-anchored assertions below test the two elements that were clipped once
   * before, which made them a regression test for one failure rather than a test of the
   * property. A page box is `overflow: hidden`, so *any* block that outgrows it is
   * silently cut, and a second layout, tuned by hand, is exactly where that happens
   * next. Comparing each page's scroll height to its client height catches all of it,
   * including content that overflows a flex child rather than the page itself.
   */
  /*
   * A page that fits *exactly* is not a layout, it is a coincidence.
   *
   * Both sheets used to sum to 1056px of content in a 1056px box. It held until a CI
   * runner rasterised a few glyphs differently and the last block was clipped: by a
   * page reporting no overflow, because the block grows to fill and clips inside itself.
   *
   * So the property under test is a stated reserve, not the absence of overflow. The
   * page is let size to its content, measured, and restored; the number is reported
   * either way, so a sheet drifting toward the edge is visible in CI long before it
   * crosses it.
   */
  test(`${route} keeps a reserve inside both page boxes`, async ({ page }) => {
    await printPage(page, route);

    const reserve = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[id^="resume-page-"]')].map((sheet) => {
        const box = sheet.clientHeight;
        const height = sheet.style.height;
        const overflow = sheet.style.overflow;

        sheet.style.height = 'auto';
        sheet.style.overflow = 'visible';
        const wanted = sheet.scrollHeight;
        sheet.style.height = height;
        sheet.style.overflow = overflow;

        return { id: sheet.id, box, wanted, headroom: box - wanted };
      }),
    );

    /*
     * Reported on every run, not only on failure. Text metrics differ between machines,
     * so the number that matters is the one CI measures, and a sheet drifting toward
     * the edge should be readable in a green run rather than discovered by a red one.
     */
    console.log(
      `${route} headroom: ` +
        reserve.map((sheet) => `${sheet.id} ${sheet.headroom}px`).join(' · '),
    );

    for (const sheet of reserve) {
      expect(
        sheet.headroom,
        `${sheet.id} has ${sheet.headroom}px of headroom; content wants ${sheet.wanted} of ${sheet.box}`,
      ).toBeGreaterThanOrEqual(PAGE_RESERVE);
    }
  });

  test(`${route} fits its content inside both page boxes`, async ({ page }) => {
    await printPage(page, route);

    const overflow = await page.evaluate(() =>
      [...document.querySelectorAll('[id^="resume-page-"]')].map((sheet) => ({
        id: sheet.id,
        over: sheet.scrollHeight - sheet.clientHeight,
        // A block that outgrew its own box clips its last child even when the page
        // itself reports no overflow.
        blocks: [...sheet.children].map((block) => ({
          text: (block.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40),
          over: block.scrollHeight - Math.round(block.getBoundingClientRect().height),
        })),
      })),
    );

    for (const sheet of overflow) {
      expect(sheet.over, `${sheet.id} overflows its page box`).toBeLessThanOrEqual(0);
      for (const block of sheet.blocks) {
        expect(
          block.over,
          `${sheet.id}: "${block.text}" is clipped by its own box`,
        ).toBeLessThanOrEqual(0);
      }
    }
  });

  test(`${route} keeps bottom-anchored content inside the page`, async ({ page }) => {
    await printPage(page, route);

    /*
     * Both are pinned to the foot of their page with `margin-top: auto`; if anything
     * above them grows, these are the first things clipped.
     *
     * The two layouts close page one on different blocks: the durable sheet on the
     * systems boundary, the Linear sheet on the employment boundary, because they put
     * different material there. Page two ends on the document footer in both.
     */
    const pageOneAnchor = route.endsWith('/linear')
      ? 'Titles, dates and scope are stated as held'
      : 'Public source and recorded evidence';

    for (const [id, text] of [
      ['#resume-page-1', pageOneAnchor],
      ['#resume-page-2', 'FULL EVIDENCE SYSTEM'],
    ]) {
      const pageBox = await page.locator(id as string).boundingBox();
      const el = await page
        .locator(id as string)
        .getByText(text as string, { exact: false })
        .first()
        .boundingBox();

      expect(el).not.toBeNull();
      const bottom = (el?.y ?? 0) + (el?.height ?? 0);
      expect(bottom).toBeLessThanOrEqual((pageBox?.y ?? 0) + PAGE_H);
    }
  });
}

test('the résumé links out to the published sites, not to bare profiles', async ({
  page,
}) => {
  await printPage(page, '/resume/print');

  const verify = page.getByRole('link', { name: 'VERIFY ↗' });
  await expect(verify).toHaveCount(3);

  expect(
    await verify.evaluateAll((links) => links.map((l) => l.getAttribute('href'))),
  ).toEqual([
    'https://vreko.dev/',
    'https://www.workspacejson.dev',
    'https://interlock.marcellelabs.io/',
  ]);
});

test('every résumé call to action downloads the lens it belongs to', async ({ page }) => {
  await page.goto('/');
  const neutral = page.locator('a[href^="/qwynn-marcelle-resume"]');
  await expect(neutral.first()).toHaveAttribute('href', '/qwynn-marcelle-resume.pdf');

  await page.goto('/role/athenahealth-yoh');
  const lensed = page.locator('a[href^="/qwynn-marcelle-resume"]');
  expect(await lensed.count()).toBeGreaterThan(0);
  for (const href of await lensed.evaluateAll((links) =>
    links.map((l) => l.getAttribute('href')),
  )) {
    expect(href).toBe('/qwynn-marcelle-resume-athenahealth-yoh.pdf');
  }
});

test('the generated PDF is served and is a real PDF', async ({ request }) => {
  const response = await request.get('/qwynn-marcelle-resume.pdf');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');

  const body = await response.body();
  expect(body.subarray(0, 5).toString('latin1')).toBe('%PDF-');
});

/**
 * The Linear résumé is a content projection, not just a retitled one.
 *
 * These assert the three things that make it a different document: what leads the
 * enterprise record, which system is promoted out of the footnote, and where the footer
 * sends the reader. If a future refactor collapses the projection back into a title
 * swap, this is what notices.
 */
test('the Linear résumé projects different content, from the same facts', async ({
  page,
}) => {
  await printPage(page, '/resume/print/linear');

  await expect(
    page.getByText('AI PRODUCTS · AGENT SYSTEMS · FULL-STACK PRODUCT ENGINEERING'),
  ).toBeVisible();

  // Page one leads on the customer-facing product surface rather than on platform
  // modernization, and the sentence is the durable one, promoted.
  const firstBullet = page.locator('#resume-page-1 article ul li').first();
  await expect(firstBullet).toContainText('Consumer Portals');

  /*
   * And the frontend half of it is printed rather than left to inference. This sheet
   * exists for a reader who needs to know the product surface was built and not only
   * led, so the record has to carry both shapes of fact and keep them apart: React and
   * two named applications with a single author in the earliest role, the portal estate
   * attributed to the team that owned it in the latest.
   */
  const record = page
    .locator('#resume-page-1 [class*="block"]')
    .filter({ hasText: 'BlueCross BlueShield of Tennessee' })
    .last();
  await expect(record).toContainText('React');
  await expect(record).toContainText('Sitecore');
  await expect(record).toContainText('Contact Preference');
  await expect(record).toContainText('Fee Schedule');
  await expect(record).toContainText('team owned');

  // Never Ask Twice is a full entry here; on the durable sheet it is the ALSO footnote.
  await expect(page.locator('#resume-page-2 h3').first()).toHaveText('Never Ask Twice');

  // The agent-platform receipts are on the sheet, by identifier.
  for (const id of ['META-268', 'META-331', 'INFRA-11']) {
    await expect(page.getByText(id, { exact: true })).toBeVisible();
  }

  // And the footer sends a Linear reader to the surface written for them.
  await expect(
    page.getByRole('link', { name: /qwynn\.marcellelabs\.io\/linear/ }),
  ).toHaveAttribute('href', 'https://qwynn.marcellelabs.io/linear');
});

test('the durable résumé still leads on the durable record', async ({ page }) => {
  await printPage(page, '/resume/print');

  await expect(
    page.getByText('AI PLATFORM · DEVELOPER SYSTEMS · SOFTWARE ARCHITECTURE'),
  ).toBeVisible();
  await expect(page.locator('#resume-page-1 article h3').first()).toHaveText('Vreko');
  await expect(page.getByText('META-268')).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: /qwynn\.marcellelabs\.io ↗/ }),
  ).toHaveAttribute('href', 'https://qwynn.marcellelabs.io/');
});

test('the résumé manifest lists every variant exactly once', async ({ request }) => {
  const response = await request.get('/resume/manifest.json');
  expect(response.status()).toBe(200);

  const { variants } = (await response.json()) as {
    variants: { slug: string; route: string; pdfPath: string; downloadName: string }[];
  };

  const slugs = variants.map((variant) => variant.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
  expect(slugs).toContain('linear');
  expect(slugs.filter((slug) => slug === 'linear')).toHaveLength(1);

  const linear = variants.find((variant) => variant.slug === 'linear');
  expect(linear?.route).toBe('/resume/print/linear');
  expect(linear?.pdfPath).toBe('/qwynn-marcelle-resume-linear.pdf');
  expect(linear?.downloadName).toBe('Qwynn Marcelle - Resume (Linear).pdf');
});

test('every résumé call to action on /linear downloads the Linear PDF', async ({
  page,
}) => {
  await page.goto('/linear');

  const links = page.locator('a[href^="/qwynn-marcelle-resume"]');
  expect(await links.count()).toBeGreaterThan(0);

  for (const href of await links.evaluateAll((all) =>
    all.map((link) => link.getAttribute('href')),
  )) {
    expect(href).toBe('/qwynn-marcelle-resume-linear.pdf');
  }

  await expect(links.first()).toHaveAttribute(
    'download',
    'Qwynn Marcelle - Resume (Linear).pdf',
  );
});

test('the Linear PDF is served and is a real PDF', async ({ request }) => {
  const response = await request.get('/qwynn-marcelle-resume-linear.pdf');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
  expect((await response.body()).subarray(0, 5).toString('latin1')).toBe('%PDF-');
});
