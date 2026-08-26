import { expect, test } from '@playwright/test';

const VIEWPORTS = [
  { name: '320', width: 320, height: 720 },
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1440', width: 1440, height: 900 },
];

for (const viewport of VIEWPORTS) {
  test(`no horizontal page overflow at ${viewport.name}px`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');

    // Open everything: revealed wide content is the usual source of overflow.
    await page.getByRole('button', { name: /SHOW CLAIM LEDGER/ }).click();
    await page.getByRole('button', { name: /Inspect evidence.*EV-WSJ/ }).click();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test('the proof rail stays compact on a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');

  const rail = page.getByRole('navigation', { name: 'Proof progress' });
  const box = await rail.boundingBox();

  expect(box).not.toBeNull();
  // The rail must not consume a large share of a small viewport.
  expect(box!.height).toBeLessThan(720 * 0.25);
});

test('wide tables scroll inside their own container, not the page', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  await page.getByRole('button', { name: /SHOW CLAIM LEDGER/ }).click();

  const scrollable = await page.locator('#ledger').evaluate((el) => {
    const wrap = el.querySelector('table')?.parentElement;
    if (!wrap) return null;
    return {
      scrolls: wrap.scrollWidth > wrap.clientWidth,
      overflowX: getComputedStyle(wrap).overflowX,
    };
  });

  expect(scrollable?.overflowX).toBe('auto');
});

test('body copy stays legible on a small screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');

  const smallest = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('p, li, span, a, h1, h2, h3, h4')];
    const sizes = nodes
      .filter((el) => (el.textContent ?? '').trim().length > 0)
      .filter((el) => {
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      })
      .map((el) => parseFloat(getComputedStyle(el).fontSize));
    return Math.min(...sizes);
  });

  // The design's microtype floor was raised so metadata reads as information.
  expect(smallest).toBeGreaterThanOrEqual(11.5);
});

/**
 * The application surface's responsive gates.
 *
 * A recruiter opens this from a phone — from email, from LinkedIn, from an applicant
 * tracking system — and a page arguing for product-engineering judgement that arrives as
 * a desktop document squeezed into 390px has undermined its own claim before it is read.
 *
 * The standard these encode:
 *
 * > Mobile is not desktop stacked vertically. Mobile preserves the decision hierarchy
 * > and recomposes any visualisation whose meaning depends on spatial comparison.
 *
 * So they check both halves. The prohibitions below are the mechanical half — nothing
 * clipped, nothing under a thumb's width, nothing scrolling sideways. The two tests
 * after them are the other half: the hero chain and the bound axis have to still make
 * their comparison at 390px, not merely fit in it.
 */
const SURFACE_VIEWPORTS = [
  { name: '390 · contemporary phone', width: 390, height: 844 },
  { name: '320 · stress floor', width: 320, height: 568 },
  { name: '768 · tablet', width: 768, height: 1024 },
  { name: '1440 · desktop', width: 1440, height: 900 },
];

/** The direction's figure, and this page's own rule for controls at mobile. */
const TOUCH_TARGET_MIN = 40;

for (const viewport of SURFACE_VIEWPORTS) {
  test(`/linear survives ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/linear');

    // Every disclosure open: revealed content is where these regressions hide.
    for (const name of [
      /Inspect evidence.*EV-ILK/,
      /Inspect evidence.*EV-WSJ/,
      /Inspect evidence.*EV-VRK/,
      /SHOW CLAIM LEDGER/,
    ]) {
      const control = page.getByRole('button', { name }).first();
      if (await control.count()) await control.click();
    }

    // And the counterfactual at the stage that draws the bars.
    await page
      .locator('#sec-04')
      .getByRole('button', { name: /Resulting state/ })
      .click();

    const report = await page.evaluate((min) => {
      const clipped = [...document.querySelectorAll<HTMLElement>('*')]
        .filter((el) => {
          if (el.children.length || !el.textContent?.trim()) return false;
          if (el.classList.contains('visually-hidden')) return false;
          const style = getComputedStyle(el);
          if (style.overflow === 'visible' || style.overflowX === 'auto') return false;
          return el.scrollWidth > el.clientWidth + 1;
        })
        .map((el) => `"${el.textContent!.trim().slice(0, 30)}"`);

      const smallTargets = [...document.querySelectorAll<HTMLElement>('a, button')]
        .filter((el) => {
          const box = el.getBoundingClientRect();
          return box.width > 0 && box.height > 0 && box.height < min;
        })
        .map(
          (el) =>
            `"${el.textContent?.trim().slice(0, 30)}" ${Math.round(el.getBoundingClientRect().height)}px`,
        );

      const root = document.documentElement;
      return {
        pageOverflow: root.scrollWidth - root.clientWidth,
        clipped: [...new Set(clipped)],
        smallTargets: [...new Set(smallTargets)],
      };
    }, TOUCH_TARGET_MIN);

    expect(report.pageOverflow, 'the page scrolls sideways').toBeLessThanOrEqual(1);
    expect(report.clipped, 'evidence is clipped').toEqual([]);

    /*
     * Touch targets are a mobile rule. At 1440 a 24px inline citation is a mouse target
     * and correct as it is, so the floor applies where a thumb is the input.
     */
    if (viewport.width <= 700) {
      expect(report.smallTargets, 'a control is under the thumb floor').toEqual([]);
    }
  });
}

test('the bound axis moves its labels out of the bar rather than clipping them', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/linear');
  await page
    .locator('#sec-04')
    .getByRole('button', { name: /Resulting state/ })
    .click();

  /*
   * The narrowest segment is an eighth of the axis. Inside the bar at this width its
   * label rendered as "gamm" — the number the whole comparison turns on, lost silently,
   * because a bar clips rather than overflows. Every value has to be readable, and the
   * bar has to still be one shared scale with one shared bound.
   */
  // Scoped to the legend: the in-bar label is the same words, and at this width it is
  // the one that has been switched off.
  const axis = page.locator('#sec-04 [class*="BoundAxis"][class*="axis"]').first();
  await expect(
    axis.locator('[class*="legendItem"]').filter({ hasText: 'gamma 20' }).first(),
  ).toBeVisible();

  const legible = await axis.evaluate((el) =>
    [...el.querySelectorAll<HTMLElement>('[class*="legendItem"]')].every(
      (item) => item.scrollWidth <= item.clientWidth + 1,
    ),
  );
  expect(legible, 'a legend entry is cut off').toBe(true);

  // One bound marker for both arms: the comparison is what must survive recomposition.
  await expect(axis.locator('[class*="marker"]')).toHaveCount(1);
});

test('the hero chain recomposes vertically rather than shrinking', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/linear');

  const stations = page
    .getByRole('figure')
    .filter({ hasText: 'HOW WORK BECOMES EVIDENCE' })
    .getByRole('listitem');

  await expect(stations).toHaveCount(5);

  // Turned, not shrunk: every station occupies its own row and keeps its sentence.
  const boxes = await stations.evaluateAll((els) =>
    els.map((el) => el.getBoundingClientRect().top),
  );
  for (let i = 1; i < boxes.length; i += 1) {
    expect(boxes[i], 'stations are still side by side').toBeGreaterThan(boxes[i - 1]);
  }

  await expect(stations.last()).toContainText('frozen artifact');
});
