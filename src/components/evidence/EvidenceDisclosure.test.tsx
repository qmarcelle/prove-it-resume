import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { EvidenceRef } from '@/lib/types';
import { EvidenceDisclosure } from './EvidenceDisclosure';

const rows: EvidenceRef[] = [
  {
    id: 'a',
    kind: 'specification',
    title: 'Canonical specification',
    description: 'A descriptive standard.',
    verified: false,
  },
  {
    id: 'b',
    kind: 'observed',
    title: 'Tally case',
    href: 'https://example.com/tally',
    verified: true,
  },
];

describe('EvidenceDisclosure', () => {
  it('starts closed and reports its state to assistive technology', () => {
    render(<EvidenceDisclosure code="EV-WSJ" rows={rows} boundary="Bounded." />);

    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Canonical specification')).toBeNull();
  });

  it('opens and closes from the keyboard', async () => {
    const user = userEvent.setup();
    render(<EvidenceDisclosure code="EV-WSJ" rows={rows} boundary="Bounded." />);

    const toggle = screen.getByRole('button');
    toggle.focus();

    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Canonical specification')).toBeVisible();

    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('associates the toggle with the panel it controls', async () => {
    const user = userEvent.setup();
    render(<EvidenceDisclosure code="EV-WSJ" rows={rows} boundary="Bounded." />);

    const toggle = screen.getByRole('button');
    await user.click(toggle);

    const controlled = toggle.getAttribute('aria-controls');
    expect(controlled).toBeTruthy();
    expect(document.getElementById(controlled as string)).toBeInTheDocument();
  });

  it('always shows the boundary alongside the evidence', async () => {
    const user = userEvent.setup();
    render(
      <EvidenceDisclosure
        code="EV-WSJ"
        rows={rows}
        boundary="Does not establish adoption."
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Does not establish adoption.')).toBeVisible();
  });

  it('links only the verified row', async () => {
    const user = userEvent.setup();
    render(<EvidenceDisclosure code="EV-WSJ" rows={rows} boundary="Bounded." />);

    await user.click(screen.getByRole('button'));

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', 'https://example.com/tally');
  });
});
