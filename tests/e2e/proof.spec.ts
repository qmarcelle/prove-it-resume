import { expect, test } from '@playwright/test';

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

    for (const id of ['sec-01', 'sec-02', 'sec-03', 'sec-04', 'sec-05', 'sec-06']) {
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

    await page.getByRole('button', { name: 'Walk the proof →' }).click();

    const dock = page.getByRole('group', { name: 'Guided proof navigation' });
    await expect(dock).toBeVisible();
    await expect(dock).toContainText('01 / 06');

    await dock.getByRole('button', { name: 'NEXT →' }).click();
    await expect(dock).toContainText('02 / 06');

    await dock.getByRole('button', { name: 'NEXT →' }).click();
    await expect(dock).toContainText('03 / 06');

    await dock.getByRole('button', { name: '← PREV' }).click();
    await expect(dock).toContainText('02 / 06');

    await dock.getByRole('button', { name: 'Exit guided mode' }).click();
    await expect(dock).toBeHidden();
  });

  test('the proof rail tracks the section in view', async ({ page }) => {
    await page.goto('/');

    const rail = page.getByRole('navigation', { name: 'Proof progress' });
    await expect(rail).toBeVisible();

    await page.locator('#sec-04').scrollIntoViewIfNeeded();
    await expect(rail.getByRole('button', { name: /Interlock/ })).toHaveAttribute(
      'aria-current',
      'step',
    );
  });

  test('ordinary scrolling works without entering guided mode', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /Show me what you built/ }).click();
    await expect(page).toHaveURL(/#sec-02$/);
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

  /*
   * This test used to assert that the Interlock drawer had *no* verified artifact.
   * Interlock is now bound to the frozen HAC-330 packet, so that assertion was
   * deliberately inverted rather than deleted — the two halves of the evidence rule
   * both still need a guard, so the unresolved half moved to a section that genuinely
   * still has gaps.
   */
  test('unresolved evidence renders no link', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /Inspect evidence.*EV-WSJ/ }).click();

    // The specification, schema, CLI and integrations rows have no exact artifact yet.
    const drawer = page.locator('#sec-03');
    await expect(drawer.getByText('VERIFY BEFORE PUBLISHING').first()).toBeVisible();
  });

  test('Interlock evidence now resolves to the frozen packet', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /Inspect evidence.*EV-ILK/ }).click();

    const drawer = page.locator('#sec-04');
    const packet = drawer.getByRole('link', { name: /INSPECT/ }).first();
    await expect(packet).toBeVisible();
    await expect(packet).toHaveAttribute(
      'href',
      /Marcelle-Labs\/interlock\/blob\/[0-9a-f]{40}\/experiments\/hac-330/,
    );
    // And the drawer must not claim a gap it no longer has.
    await expect(drawer.getByText('VERIFY BEFORE PUBLISHING')).toHaveCount(0);
  });

  test('the one verified artifact is a real outbound link', async ({ page }) => {
    await page.goto('/');

    const tally = page
      .locator('#sec-03')
      .getByRole('link', { name: /READ THE TALLY CASE/ });
    await expect(tally).toHaveAttribute(
      'href',
      'https://www.workspacejson.dev/showcase/tally',
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
  test('open into the receipt shape rather than collecting selections', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /Why MCP instead of another/ }).click();

    await expect(page.getByText(/has not been written yet/i)).toBeVisible();
    await expect(page.getByText('WHAT WOULD CHANGE THE DECISION NOW')).toBeVisible();
  });
});

test.describe('role lens', () => {
  test('projects the same evidence with role-specific framing', async ({ page }) => {
    await page.goto('/role/athenahealth-yoh');

    await expect(page.getByText('ROLE LENS: SENIOR AI PLATFORM ENGINEER')).toBeVisible();
    await expect(page.getByText('ATHENAHEALTH / YOH')).toBeVisible();

    // The proofs themselves are unchanged.
    await expect(page.locator('#sec-02')).toContainText('Vreko');
    await expect(page.locator('#sec-04')).toContainText('Interlock');
  });

  test('an unknown lens 404s rather than serving a different projection', async ({
    page,
  }) => {
    const response = await page.goto('/role/not-a-real-role');
    expect(response?.status()).toBe(404);
  });
});
