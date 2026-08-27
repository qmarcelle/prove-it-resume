import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { LinearReceipt } from '@/lib/types';
import { ReceiptTabs } from './ReceiptTabs';

/**
 * The three evidence states, rendered.
 *
 * This is where the model earns its keep or quietly stops meaning anything. The states
 * are only useful if a reader can tell them apart *without being told the rule*, and the
 * failure that matters is directional: `private-verified` drifting toward looking like
 * `public-verified` turns an attestation into a guarantee, and the reader has no way to
 * detect it.
 *
 * So the assertions are about what a reader can act on rather than about class names. A
 * private row must offer nothing to click. A public row must. An unresolved row must keep
 * the mark every unverified row on this site carries.
 *
 * `public-verified` is currently unused by the real receipts, which is exactly why it is
 * tested here: an unexercised branch is one that breaks silently on the day it is finally
 * needed, and that day is the day someone is about to publish a link.
 */

const base = {
  title: 'A decision',
  question: 'A question?',
  finding: 'A finding.',
  status: 'Decided',
  boundary: 'What this does not establish.',
};

const receipts: readonly LinearReceipt[] = [
  {
    ...base,
    identifier: 'AAA-1',
    evidence: { state: 'unresolved' },
  },
  {
    ...base,
    identifier: 'BBB-2',
    evidence: { state: 'private-verified', checkedAt: '2026-08-26' },
  },
  {
    ...base,
    identifier: 'CCC-3',
    evidence: {
      state: 'public-verified',
      checkedAt: '2026-08-26',
      href: 'https://example.dev/artifact',
      label: 'INSPECT THE IMPLEMENTATION',
    },
  },
];

/**
 * Testing Library hydrates, so this renders the tab strip rather than the stacked list
 * and only the open receipt's panel is on screen. That is the right surface to assert
 * against: it is what a reader with JavaScript actually meets, and it means each state
 * has to be reached the way a reader reaches it.
 */
async function openReceipt(identifier: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole('tab', { name: new RegExp(identifier) }));
  return screen.getByRole('tabpanel');
}

describe('ReceiptTabs evidence states', () => {
  it('marks an unresolved receipt as unverified', async () => {
    render(<ReceiptTabs receipts={receipts} />);
    const panel = await openReceipt('AAA-1');
    expect(panel).toHaveTextContent('[VERIFY BEFORE PUBLISHING]');
  });

  it('marks a private receipt as checked, without offering anything to click', async () => {
    render(<ReceiptTabs receipts={receipts} />);
    const panel = await openReceipt('BBB-2');

    expect(panel).toHaveTextContent('PRIVATE SOURCE');

    // The words have to name what was checked and say the reader cannot repeat the
    // check. "Verified" standing alone would read as the guarantee the public row
    // carries, which is the one misreading this state must not permit.
    expect(panel).toHaveTextContent(/checked against the issue/i);
    expect(panel).toHaveTextContent(/not independently verifiable/i);

    // And it offers nothing to press.
    expect(panel.querySelector('a')).toBeNull();
    expect(panel).not.toHaveTextContent('[VERIFY BEFORE PUBLISHING]');
  });

  it('gives a public receipt the only destination on the block', async () => {
    render(<ReceiptTabs receipts={receipts} />);
    const panel = await openReceipt('CCC-3');

    const links = panel.querySelectorAll('a[href]');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', 'https://example.dev/artifact');
    expect(links[0]).toHaveTextContent('INSPECT THE IMPLEMENTATION');
    expect(panel).not.toHaveTextContent('[VERIFY BEFORE PUBLISHING]');
  });

  it('never renders the unverified mark on a receipt that was checked', async () => {
    /*
     * The regression that motivated the whole change: every receipt carried
     * `[VERIFY BEFORE PUBLISHING]` regardless of whether anyone had checked it, so a
     * finished application surface read as unfinished.
     */
    render(<ReceiptTabs receipts={[receipts[1], receipts[2]]} />);
    expect(screen.queryByText('[VERIFY BEFORE PUBLISHING]')).toBeNull();
  });

  it('states a boundary on every receipt, whichever state it is in', async () => {
    // The layout may change between states. The disclosure may not.
    render(<ReceiptTabs receipts={receipts} />);
    for (const identifier of ['AAA-1', 'BBB-2', 'CCC-3']) {
      const panel = await openReceipt(identifier);
      expect(panel).toHaveTextContent('What this does not establish.');
    }
  });
});
