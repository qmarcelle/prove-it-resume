import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DecisionReceiptItem } from './DecisionReceipt';

describe('DecisionReceipt', () => {
  it('shows the receipt shape, marked awaiting, when no answer exists', async () => {
    const user = userEvent.setup();
    render(
      <DecisionReceiptItem
        receipt={{ id: 'x', question: 'Why MCP instead of another surface?' }}
      />,
    );

    await user.click(screen.getByRole('button'));

    expect(screen.getByText(/has not been written yet/i)).toBeVisible();
    expect(screen.getByText('CONSTRAINT')).toBeVisible();
    expect(screen.getByText('WHAT WOULD CHANGE THE DECISION NOW')).toBeVisible();
    expect(screen.getAllByText('AWAITING')).toHaveLength(6);
  });

  it('renders the answer when one is supplied', async () => {
    const user = userEvent.setup();
    render(
      <DecisionReceiptItem
        receipt={{
          id: 'x',
          question: 'Where should agent state live?',
          constraint: 'Sessions outlive a single process.',
          alternatives: ['In-process memory', 'Client-held context'],
          decision: 'Server-side session store behind the tool contract.',
          tradeoff: 'Adds an operational dependency.',
          wouldChangeIf: 'If sessions became single-process.',
        }}
      />,
    );

    await user.click(screen.getByRole('button'));

    expect(
      screen.getByText('Server-side session store behind the tool contract.'),
    ).toBeVisible();
    expect(screen.getByText('In-process memory')).toBeVisible();
    expect(screen.queryByText(/has not been written yet/i)).toBeNull();
    expect(screen.queryByText('AWAITING')).toBeNull();
  });

  it('reports expanded state and is keyboard operable', async () => {
    const user = userEvent.setup();
    render(<DecisionReceiptItem receipt={{ id: 'x', question: 'A question?' }} />);

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.tab();
    expect(trigger).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
