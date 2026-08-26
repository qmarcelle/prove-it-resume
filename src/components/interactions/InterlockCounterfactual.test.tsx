import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { interlockHac330 } from '@/content/experiments/interlock-hac330';
import { InterlockCounterfactual } from './InterlockCounterfactual';

/**
 * These tests exist to catch the two ways this interaction could quietly start lying:
 * by drifting from the frozen packet's numbers, and by letting the perturbation control
 * become decoration instead of a real re-decision.
 */
describe('InterlockCounterfactual', () => {
  const render330 = () => render(<InterlockCounterfactual data={interlockHac330} />);

  it('maps the frozen bound and base state', () => {
    render330();

    expect(screen.getByText(/BOUND 130/)).toBeVisible();
    // The bound and the invariant it expresses now read as one line above the axis.
    expect(
      screen.getByText(/sum\(services\[\]\.reserved\) <= budget\.totalReservable/),
    ).toBeVisible();
    // Both arms rest on the same base total.
    expect(screen.getAllByText(/TOTAL 100/)).toHaveLength(2);
  });

  it('draws both arms against one scale with one shared constraint marker', () => {
    const { container } = render330();

    // One marker for the whole track, not one per arm: the constraint is literally the
    // same line for both, which is the layout's entire argument.
    const markers = container.querySelectorAll('[class^="_marker_"]');
    expect(markers).toHaveLength(1);

    // And it is positioned by the bound over the shared scale — 130 of 160.
    expect((markers[0] as HTMLElement).style.left).toBe('81.25%');

    // Two arms, both bars, both on that one track.
    expect(container.querySelectorAll('[class^="_arm_"]')).toHaveLength(2);
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('advances both arms through the stages and lands on the frozen outcomes', async () => {
    const user = userEvent.setup();
    render330();

    await user.click(screen.getByRole('button', { name: /Resulting state/ }));

    // The two figures the packet records: 140 breaches, 120 holds.
    expect(screen.getByText(/TOTAL 140/)).toBeVisible();
    expect(screen.getByText(/TOTAL 120/)).toBeVisible();
    expect(screen.getByText('INVALID JOINT STATE')).toBeVisible();
    expect(screen.getByText('CONSTRAINT HELD')).toBeVisible();
  });

  it('shows the decision only at and after the decision stage', async () => {
    const user = userEvent.setup();
    render330();

    expect(screen.queryByText('WITHHOLD_SERIALIZE')).toBeNull();

    await user.click(screen.getByRole('button', { name: /Decision point/ }));
    /*
     * Matched as a set, not a single node: the decision now reads as one badge on the
     * arm ("WITHHOLD_SERIALIZE · COUPLING_OBSERVED") and again in the decision trace
     * below. The guarantee is that it is absent before this stage and present after,
     * not that exactly one element carries it.
     */
    expect(screen.getAllByText(/WITHHOLD_SERIALIZE/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/COUPLING_OBSERVED/).length).toBeGreaterThan(0);
  });

  it('flips the decision and the outcome when the evidence is perturbed', async () => {
    const user = userEvent.setup();
    render330();

    await user.click(screen.getByRole('button', { name: /Resulting state/ }));
    expect(screen.getByText('CONSTRAINT HELD')).toBeVisible();

    await user.click(screen.getByRole('button', { name: /Perturb the evidence/ }));

    // Same decision function, opposite decision, and the joint state now breaches.
    expect(screen.getByText(/ALLOW_PARALLEL/)).toBeVisible();
    expect(screen.getByText(/NO_QUALIFYING_COUPLING/)).toBeVisible();
    expect(screen.queryByText('CONSTRAINT HELD')).toBeNull();
    expect(screen.getAllByText('INVALID JOINT STATE')).toHaveLength(2);
  });

  it('restores the original decision when the perturbation is undone', async () => {
    const user = userEvent.setup();
    render330();

    const perturb = screen.getByRole('button', { name: /Perturb the evidence/ });
    await user.click(perturb);
    expect(perturb).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: /Restore evidence/ }));
    await user.click(screen.getByRole('button', { name: /Resulting state/ }));
    expect(screen.getByText('CONSTRAINT HELD')).toBeVisible();
  });

  it('does not perturb anything on its own', () => {
    render330();
    expect(screen.getByRole('button', { name: /Perturb the evidence/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByText(/COUPLING EVIDENCE · OBSERVED/)).toBeVisible();
  });

  it('names the controlled variable in the experiment’s own terms', () => {
    render330();

    expect(screen.getByText(/The mined co-change evidence, and only that/)).toBeVisible();
    // No model participates in HAC-330, so no model language may appear.
    expect(screen.queryByText(/same prompt/i)).toBeNull();
    expect(screen.queryByText(/temperature/i)).toBeNull();
  });

  it('keeps the claim boundary and the distinctions visible', async () => {
    const user = userEvent.setup();
    render330();

    expect(screen.getByText(/not establish behaviour at repository scale/)).toBeVisible();

    await user.click(screen.getByRole('button', { name: /Frozen evidence/ }));
    expect(screen.getByText('ALLOW is not VERIFIED')).toBeVisible();
    expect(screen.getByText('OBSERVED is not SAFE')).toBeVisible();
  });

  it('links the frozen packet', () => {
    render330();
    expect(
      screen.getByRole('link', { name: /INSPECT FROZEN EXPERIMENT/ }),
    ).toHaveAttribute('href', expect.stringContaining('hac-330/evidence/arms.json'));
  });

  it('describes each bar in text for readers who cannot see it', () => {
    render330();
    const bars = screen.getAllByRole('img');
    const arm = within(bars[0].parentElement as HTMLElement);

    /*
     * Two visible copies of the value, by design: the label inside the segment, and the
     * legend entry beneath the bar. Only one is ever shown — a container query picks
     * whichever fits the axis's width — and neither is announced, because the bar is a
     * single `role="img"` whose description carries every name and value once.
     */
    expect(arm.getAllByText(/alpha 40/)).toHaveLength(2);
    for (const copy of arm.getAllByText(/alpha 40/)) expect(copy).toBeVisible();

    expect(bars[0]).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Joint total 100 against a bound of 130'),
    );
  });
});
