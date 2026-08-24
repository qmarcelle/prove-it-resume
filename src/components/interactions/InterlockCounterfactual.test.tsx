import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { InterlockCounterfactual } from './InterlockCounterfactual';
import { RepositoryDecisionDiff } from './RepositoryDecisionDiff';

describe('InterlockCounterfactual', () => {
  it('starts on the without-coordination arm', () => {
    render(<InterlockCounterfactual />);

    expect(screen.getByRole('button', { name: /WITHOUT COORDINATION/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('140 > 130')).toBeVisible();
    expect(screen.getByText('INVALID JOINT OUTCOME')).toBeVisible();
  });

  it('switches arms and shows the coordination decision', async () => {
    const user = userEvent.setup();
    render(<InterlockCounterfactual />);

    await user.click(screen.getByRole('button', { name: /WITH INTERLOCK/ }));

    expect(screen.getByText('WITHHOLD_SERIALIZE')).toBeVisible();
    expect(screen.getByText('120 ≤ 130')).toBeVisible();
    expect(screen.getByText('CONSTRAINT SATISFIED')).toBeVisible();
    expect(screen.queryByText('140 > 130')).toBeNull();
  });

  it('labels the figures as unverified prototype values', () => {
    render(<InterlockCounterfactual />);
    expect(screen.getByText(/PROTOTYPE VALUES/)).toBeVisible();
    expect(
      screen.getByText(/not yet bound to the published evidence packet/i),
    ).toBeVisible();
  });
});

describe('RepositoryDecisionDiff', () => {
  it('shows an explicit awaiting state and disables the switch with no data', () => {
    render(<RepositoryDecisionDiff />);

    expect(
      screen.getByRole('button', { name: /WITHOUT REPOSITORY EVIDENCE/ }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /WITH REPOSITORY EVIDENCE/ }),
    ).toBeDisabled();
    expect(screen.getByText(/VERIFY BEFORE PUBLISHING/)).toBeVisible();
    expect(screen.getByText(/not yet populated/i)).toBeVisible();
  });

  it('diffs two plans and names the evidence responsible when data is supplied', async () => {
    const user = userEvent.setup();
    render(
      <RepositoryDecisionDiff
        data={{
          baseline: { label: 'PLAN A', steps: ['Edit the module', 'Run the suite'] },
          informed: {
            label: 'PLAN B',
            steps: ['Read the fragility note', 'Edit the module', 'Run the suite'],
            changedSteps: [0],
          },
          changedBecause: 'A co-change record on the target file.',
        }}
      />,
    );

    expect(screen.getByText('PLAN A')).toBeVisible();

    await user.click(screen.getByRole('button', { name: /WITH REPOSITORY EVIDENCE/ }));

    expect(screen.getByText('PLAN B')).toBeVisible();
    expect(screen.getByText(/A co-change record on the target file./)).toBeVisible();
    // The changed step is marked for assistive technology, not only with a border.
    expect(screen.getByText(/Changed step:/)).toBeInTheDocument();
  });
});
