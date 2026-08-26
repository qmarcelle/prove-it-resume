import { expect, test, type Page } from '@playwright/test';

test.describe('durable evidence surface', () => {
  test('loads with the candidate-first hero and the evidence index', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /I build the infrastructure between AI agents and production software/,
      }),
    ).toBeVisible();

    const index = page.getByRole('navigation', { name: 'Evidence index' });
    await expect(index).toBeVisible();
    await expect(index.getByRole('link', { name: /Vreko/ })).toBeVisible();
    await expect(
      index.getByRole('link', { name: /Repository Intelligence/ }),
    ).toBeVisible();
    await expect(index.getByRole('link', { name: /Interlock/ })).toBeVisible();
  });

  test('renders all six proof stages', async ({ page }) => {
    await page.goto('/');

    for (const id of [
      'operating-thesis',
      'vreko',
      'repository-intelligence',
      'interlock',
      'role-fit',
      'career',
    ]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test('the root page is organisation-neutral', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText(/ROLE LENS: STAFF \/ PRINCIPAL/)).toBeVisible();
    await expect(page.getByText('ATHENAHEALTH / YOH')).toHaveCount(0);
  });

  test('walking the proof opens guided mode and moves through stages', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Walk the proof', exact: true }).click();

    const dock = page.getByRole('group', { name: 'Guided proof navigation' });
    await expect(dock).toBeVisible();
    await expect(dock).toContainText('01 / 06');

    await dock.getByRole('button', { name: 'NEXT' }).click();
    await expect(dock).toContainText('02 / 06');

    await dock.getByRole('button', { name: 'NEXT' }).click();
    await expect(dock).toContainText('03 / 06');

    await dock.getByRole('button', { name: 'PREV' }).click();
    await expect(dock).toContainText('02 / 06');

    await dock.getByRole('button', { name: 'Exit guided mode' }).click();
    await expect(dock).toBeHidden();
  });

  test('the proof rail tracks the section in view', async ({ page }) => {
    await page.goto('/');

    const rail = page.getByRole('navigation', { name: 'Proof progress' });
    await expect(rail).toBeVisible();

    await page.locator('#interlock').scrollIntoViewIfNeeded();
    await expect(rail.getByRole('button', { name: /Interlock/ })).toHaveAttribute(
      'aria-current',
      'step',
    );
  });

  test('ordinary scrolling works without entering guided mode', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /Show me what you built/ }).click();
    await expect(page).toHaveURL(/#vreko$/);
    await expect(
      page.getByRole('group', { name: 'Guided proof navigation' }),
    ).toBeHidden();
  });
});

test.describe('evidence disclosures', () => {
  test('open and close, reporting state', async ({ page }) => {
    await page.goto('/');

    const toggle = page.getByRole('button', { name: /Inspect evidence.*EV-VRK/ });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(
      page.getByRole('button', { name: /Close evidence.*EV-VRK/ }),
    ).toHaveAttribute('aria-expanded', 'true');
    await expect(
      page.getByText('Agent lifecycle: brief → pulse → learn → end'),
    ).toBeVisible();

    await page.getByRole('button', { name: /Close evidence.*EV-VRK/ }).click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  // This used to assert that the Interlock drawer had no artifact and said so. It
  // does now, so the assertion is inverted rather than deleted: the property worth
  // holding was never "Interlock is unresolved", it was "a CTA never points somewhere
  // that isn't the artifact". `evidence.test.ts` and `EvidenceLink.test.tsx` cover the
  // unresolved branch directly; this covers the rendered page.
  test('every evidence CTA is a real outbound artifact link', async ({ page }) => {
    await page.goto('/');

    for (const code of ['EV-VRK', 'EV-WSJ', 'EV-ILK']) {
      await page
        .getByRole('button', { name: new RegExp(`Inspect evidence.*${code}`) })
        .click();
    }

    const links = page
      .locator('main section[id]')
      .getByRole('link', { name: /INSPECT|OPEN GITHUB|VIEW REPOSITORY|READ CASE/ });
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i += 1) {
      const href = await links.nth(i).getAttribute('href');
      // Not an on-page anchor: landing back on the section you are already reading
      // teaches the reader nothing.
      expect(href, 'evidence CTA must not be an on-page anchor').not.toMatch(/^#/);
      // Not the bare profile: a profile page is not the artifact a row names.
      expect(href, 'evidence CTA must not be the bare GitHub profile').not.toBe(
        'https://github.com/qmarcelle',
      );
      expect(href).toMatch(/^https:\/\//);
    }
  });

  /*
   * Interlock's row must stay pinned to the local controlled experiment. The repository
   * publishes HAC-330, HAC-340 and HAC-343 as three separate results and says so
   * explicitly, so a row drifting to the cloud packet would quietly merge two of them.
   *
   * The row now has two destinations: the published cockpit as the call to action and
   * the commit-pinned packet as the citation, so both are checked. Either one drifting
   * to the cloud run is the failure this guards against.
   */
  test('the Interlock counterfactual row points at HAC-330, not the cloud run', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Inspect evidence.*EV-ILK/ }).click();

    const section = page.locator('#interlock');

    const packet = section.getByRole('link', { name: /INSPECT PACKET/ }).first();
    await expect(packet).toHaveAttribute(
      'href',
      /interlock\.marcellelabs\.io\/\?run=hac330-local&proof=local&state=run\.local\./,
    );

    const pinned = section
      .getByRole('link', { name: /source: interlock@[0-9a-f]+ · hac-330\/arms\.json/ })
      .first();
    await expect(pinned).toHaveAttribute(
      'href',
      /Marcelle-Labs\/interlock\/blob\/[0-9a-f]{40}\/experiments\/hac-330/,
    );
  });

  test('a verified artifact is a real outbound link', async ({ page }) => {
    await page.goto('/');

    const tally = page
      .locator('#repository-intelligence')
      .getByRole('link', { name: /READ THE TALLY CASE/ });
    await expect(tally).toHaveAttribute(
      'href',
      'https://www.workspacejson.dev/showcase/tally',
    );
  });

  /*
   * This test used to assert the opposite: no résumé file had been supplied, so the
   * bridge stated the gap where a download button would be. A résumé is now generated
   * from `/resume/print`, so the assertion is inverted rather than deleted: the
   * property worth holding was never "there is no résumé", it was "the bridge tells the
   * truth about whether there is one". `ResumeBridge` still renders the gap when the
   * `RESUME` record is unresolved, which `EvidenceLink.test.tsx` covers directly.
   */
  test('the resume bridge offers the generated download', async ({ page }) => {
    await page.goto('/');

    const bridge = page.locator('#resume');
    await expect(bridge.getByText('RÉSUMÉ PDF, NOT YET PUBLISHED')).toBeHidden();

    const download = bridge.getByRole('link', { name: /RÉSUMÉ · PDF/ });
    await expect(download).toHaveAttribute('href', '/qwynn-marcelle-resume.pdf');
    await expect(download).toHaveAttribute('download', /\.pdf$/);

    // The completion state says how long the artifact is, from the document's own page
    // count rather than a number typed into the call to action.
    await expect(download).toContainText('2 PP');

    // LinkedIn is reachable here as the quiet second line, not only from the footer.
    await expect(bridge.getByRole('link', { name: /View LinkedIn/ })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/qmarcelle',
    );
  });
});

test.describe('claim ledger', () => {
  test('is collapsed by default and opens on demand', async ({ page }) => {
    await page.goto('/');

    const toggle = page.getByRole('button', { name: /SHOW CLAIM LEDGER/ });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(
      page.getByRole('table', { name: /Every claim made on this page/ }),
    ).toBeVisible();
  });
});

test.describe('decision receipts', () => {
  test('open into the answered receipt rather than collecting selections', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /Why MCP instead of another/ }).click();

    const receipt = page.locator('#role-fit');
    await expect(receipt.getByText('CONSTRAINT', { exact: true })).toBeVisible();
    await expect(
      receipt.getByText('ALTERNATIVES CONSIDERED', { exact: true }),
    ).toBeVisible();
    await expect(receipt.getByText('DECISION', { exact: true })).toBeVisible();
    await expect(
      receipt.getByText('FAILURE MODE / TRADEOFF', { exact: true }),
    ).toBeVisible();
    await expect(receipt.getByText('EVIDENCE', { exact: true })).toBeVisible();
    await expect(
      receipt.getByText('WHAT WOULD CHANGE THE DECISION NOW', { exact: true }),
    ).toBeVisible();
  });

  test('reaches an inspectable artifact pinned to a revision', async ({ page }) => {
    await page.goto('/');

    await page
      .getByRole('button', { name: /What did your experiments fail to prove/ })
      .click();

    // The receipt's whole argument is that the negative result is inspectable. If the
    // evidence row degraded to the unresolved state, this receipt would be an assertion.
    const link = page
      .locator('#role-fit')
      .getByRole('link', { name: /INSPECT/ })
      .first();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', /\/(?:blob|tree)\/[0-9a-f]{40}\//);
  });
});

test.describe('role lens', () => {
  test('projects the same evidence with role-specific framing', async ({ page }) => {
    await page.goto('/role/athenahealth-yoh');

    await expect(page.getByText('ROLE LENS: SENIOR AI PLATFORM ENGINEER')).toBeVisible();
    await expect(page.getByText('ATHENAHEALTH / YOH')).toBeVisible();

    // The proofs themselves are unchanged.
    await expect(page.locator('#vreko')).toContainText('Vreko');
    await expect(page.locator('#interlock')).toContainText('Interlock');
  });

  test('an unknown lens 404s rather than serving a different projection', async ({
    page,
  }) => {
    const response = await page.goto('/role/not-a-real-role');
    expect(response?.status()).toBe(404);
  });
});

/**
 * ── Guided navigation: who owns the active stage ─────────────────────────────
 *
 * `goTo` used to set the index optimistically and then let the IntersectionObserver
 * overwrite it with every section the page glided past on the way to the target. Since
 * NEXT and PREV are `goTo(activeIndex ± 1)`, the second click in a sequence computed its
 * target from a section the reader was only travelling through: NEXT, NEXT, PREV landed
 * on stage one instead of stage two: 10 times out of 10 under default smooth scrolling,
 * and 0 times out of 10 under reduced motion, which is what identified the cause.
 *
 * The suite caught it only intermittently because it asserted immediately after the
 * click, while the optimistic value was still standing. So these assert *after the
 * scroll settles*, which is the window the defect lived in.
 *
 * Settling is waited on as a condition (the position stops changing) never as a sleep.
 * A duration here would be a guess about animation length and would rot the moment the
 * page got taller.
 */
const scrollSettled = (page: Page) =>
  page.waitForFunction(
    () =>
      new Promise<boolean>((resolve) => {
        const before = window.scrollY;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => resolve(window.scrollY === before)),
        );
      }),
    undefined,
    { timeout: 5000 },
  );

const walkTo = async (page: Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Walk the proof', exact: true }).click();
  const dock = page.getByRole('group', { name: 'Guided proof navigation' });
  await expect(dock).toContainText('01 / 06');
  return dock;
};

test.describe('guided navigation ownership', () => {
  test('NEXT, NEXT, PREV lands on the previous stage under smooth scrolling', async ({
    page,
  }) => {
    const dock = await walkTo(page);

    await dock.getByRole('button', { name: 'NEXT' }).click();
    await dock.getByRole('button', { name: 'NEXT' }).click();
    await dock.getByRole('button', { name: 'PREV' }).click();

    // The assertion that matters: it is still 02 once the page has stopped moving.
    // Before the ownership rule this read 01, because the sections crossed on the way
    // back were recorded as arrivals.
    await scrollSettled(page);
    await expect(dock).toContainText('02 / 06');
  });

  test('the same sequence behaves identically under reduced motion', async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    const dock = await walkTo(page);

    await dock.getByRole('button', { name: 'NEXT' }).click();
    await dock.getByRole('button', { name: 'NEXT' }).click();
    await dock.getByRole('button', { name: 'PREV' }).click();

    await scrollSettled(page);
    await expect(dock).toContainText('02 / 06');
    await context.close();
  });

  /*
   * Ownership is held for one scroll, not for the session. A reader who scrolls the page
   * themselves after using the dock must still see the rail follow them, or the fix has
   * traded a wrong stage for a frozen one.
   */
  test('ordinary scrolling still moves the active stage after a guided jump', async ({
    page,
  }) => {
    const dock = await walkTo(page);
    await dock.getByRole('button', { name: 'NEXT' }).click();
    await scrollSettled(page);

    // No guided control involved: the reader scrolls to a different section.
    await page.evaluate(() => {
      const target = document.getElementById('interlock')!;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 92,
        behavior: 'auto',
      });
    });
    await scrollSettled(page);

    await expect(dock).toContainText('04 / 06');
    await expect(
      page
        .getByRole('navigation', { name: 'Proof progress' })
        .getByRole('button', { name: /Interlock/ }),
    ).toHaveAttribute('aria-current', 'step');
  });

  /*
   * Two clicks inside one glide. The second has to chain from the stage the first one
   * claimed, not from whatever is passing through the reading band at that instant,
   * which is also why the arithmetic reads a ref rather than rendered state.
   */
  test('rapid guided navigation chains from the logical stage', async ({ page }) => {
    const dock = await walkTo(page);

    const nextButton = dock.getByRole('button', { name: 'NEXT' });
    await nextButton.click();
    await nextButton.click();
    await nextButton.click();

    await scrollSettled(page);
    await expect(dock).toContainText('04 / 06');
  });
});
