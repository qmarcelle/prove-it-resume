import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { RepositoryDecisionDiffData } from '@/lib/interactions';
import { repositoryDecision } from '@/content/experiments/repository-decision';
import { RepositoryDecisionDiff } from './RepositoryDecisionDiff';

/**
 * The tests that matter here are the ones that would fail if the component started
 * inventing things: an unresolved artifact must not produce a link, and the evidence
 * model must not be constrained to the taxonomy the design draft assumed.
 */

/**
 * A fixture in a shape the design storyboard did not anticipate: no co-change, no
 * fragility, an evidence `kind` that exists in neither vocabulary. If the component
 * renders this, the model genuinely follows the evidence.
 */
const foreignShape: RepositoryDecisionDiffData = {
  experiment: 'FIXTURE-1',
  question: 'Does the model render an evidence kind it has never seen?',
  controls: { varied: 'The context envelope.', heldFixed: ['Task', 'Model'] },
  baselineLabel: 'Without',
  informedLabel: 'With',
  baselineSteps: ['refuse the task'],
  informedSteps: ['do the task at the resolved location'],
  diff: [
    {
      id: 'row-1',
      change: 'added',
      text: 'use the resolved location',
      attributedTo: ['ev-1'],
      reason: 'Only the informed context carried it.',
    },
  ],
  evidence: [
    {
      id: 'ev-1',
      label: 'Deployment topology record',
      kind: 'service-mesh-observation',
      observation: 'Two services share one config surface.',
      provenance: { source: 'a topology export' },
    },
  ],
  boundary: 'One fixture.',
  artifact: {
    id: 'fixture-artifact',
    kind: 'experiment',
    title: 'Fixture',
    verified: false,
  },
};

describe('RepositoryDecisionDiff', () => {
  it('states the gap and links nothing when no run is bound', () => {
    render(<RepositoryDecisionDiff />);

    expect(screen.getByText(/VERIFY BEFORE PUBLISHING/)).toBeVisible();
    expect(screen.getByText(/would fabricate the result/i)).toBeVisible();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders an unresolved artifact as a stated gap rather than a link', () => {
    render(<RepositoryDecisionDiff data={foreignShape} />);
    expect(screen.queryByRole('link', { name: /INSPECT/i })).toBeNull();
    expect(screen.getByText(/VERIFY BEFORE PUBLISHING/)).toBeVisible();
  });

  it('does not constrain evidence to co-change or fragility', async () => {
    const user = userEvent.setup();
    render(<RepositoryDecisionDiff data={foreignShape} />);

    await user.click(screen.getByRole('button', { name: /Add evidence$/ }));

    expect(screen.getByText('service-mesh-observation')).toBeVisible();
    expect(screen.getByText('Deployment topology record')).toBeVisible();
    expect(screen.queryByText(/co-change/i)).toBeNull();
    expect(screen.queryByText(/fragility/i)).toBeNull();
  });

  it('shows the controls before any stage is advanced', () => {
    render(<RepositoryDecisionDiff data={repositoryDecision} />);

    // "What was held fixed" is the reason the comparison is worth reading, so it is
    // never something the reader has to unlock.
    expect(screen.getByText('VARIED')).toBeVisible();
    expect(screen.getByText('HELD FIXED')).toBeVisible();
    expect(screen.getByText(/Model: qwen-plus/)).toBeVisible();
  });

  it('discloses evidence, then the diff, then attribution, in that order', async () => {
    const user = userEvent.setup();
    render(<RepositoryDecisionDiff data={repositoryDecision} />);

    // Stage 1: the baseline plan only.
    expect(screen.getByText(/refuse to add the dbt quality check/)).toBeVisible();
    expect(screen.queryByText('Exact producing source')).toBeNull();
    expect(screen.queryByText('ADDED')).toBeNull();

    await user.click(screen.getByRole('button', { name: /Add evidence$/ }));
    expect(screen.getByText('Exact producing source')).toBeVisible();
    expect(screen.queryByText('ADDED')).toBeNull();

    await user.click(screen.getByRole('button', { name: /Compare$/ }));
    expect(screen.getByText('ADDED')).toBeVisible();
    expect(screen.getByText('REMOVED')).toBeVisible();
    expect(screen.getByText('CONSTRAINED')).toBeVisible();
    // Attribution is still withheld at the comparison stage.
    expect(screen.queryByText(/BECAUSE OF/)).toBeNull();

    await user.click(screen.getByRole('button', { name: /Attribute$/ }));
    expect(screen.getAllByText(/BECAUSE OF/).length).toBe(3);
  });

  it('folds the evidence bodies into a receipt once the comparison is the question', async () => {
    const user = userEvent.setup();
    render(<RepositoryDecisionDiff data={repositoryDecision} />);

    await user.click(screen.getByRole('button', { name: /Add evidence$/ }));
    expect(
      screen.getByText(/Artifact repository, revision, and repository-relative/),
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: /Compare$/ }));

    // The bodies fold away.
    expect(
      screen.queryByText(/Artifact repository, revision, and repository-relative/),
    ).toBeNull();

    // What they leave behind still names every piece of evidence and its kind, so
    // BECAUSE OF E1 + E2 stays resolvable without expanding anything.
    expect(screen.getByText('Repository evidence (3)')).toBeVisible();
    for (const label of [
      'Exact producing source',
      'Source location absent from the catalog',
      'No co-change evidence available',
    ]) {
      expect(screen.getByText(label)).toBeVisible();
    }
    expect(screen.getByText('E1')).toBeVisible();
  });

  it('re-expands folded evidence on request, and keeps it expanded', async () => {
    const user = userEvent.setup();
    render(<RepositoryDecisionDiff data={repositoryDecision} />);

    await user.click(screen.getByRole('button', { name: /Compare$/ }));

    const restore = screen.getByRole('button', { name: /Show evidence detail/ });
    expect(restore).toHaveAttribute('aria-expanded', 'false');
    await user.click(restore);

    expect(screen.getByText(/Artifact repository, revision/)).toBeVisible();

    /*
     * The stage supplies a default, not a verdict. A reader who has asked for the
     * evidence back should not have to ask again on the next stage, and the provenance
     * the next stage adds has to land inside the block they just opened.
     */
    await user.click(screen.getByRole('button', { name: /Attribute$/ }));
    expect(screen.getByText(/Artifact repository, revision/)).toBeVisible();
    expect(screen.getByText('@workspacejson/cli')).toBeVisible();
  });

  it('folds the plan pair into a changed decision once attribution is the question', async () => {
    const user = userEvent.setup();
    render(<RepositoryDecisionDiff data={repositoryDecision} />);

    await user.click(screen.getByRole('button', { name: /Compare$/ }));
    expect(screen.getByText(/^Add a dbt quality check for game_events/)).toBeVisible();

    await user.click(screen.getByRole('button', { name: /Attribute$/ }));

    // The plans fold; the decision they changed does not.
    expect(screen.queryByText(/^Add a dbt quality check for game_events/)).toBeNull();
    expect(screen.getByText('CHANGED DECISION')).toBeVisible();
    expect(screen.getByText('Catalog projection only')).toBeVisible();
    expect(screen.getByText('Catalog projection + repository evidence')).toBeVisible();

    // Counted from the artifact's own delta rows, in its own vocabulary.
    expect(screen.getByText('1 removed, 1 added, 1 constrained')).toBeVisible();

    // The attributed rows are what the space went to.
    expect(screen.getAllByText(/BECAUSE OF/).length).toBe(3);

    await user.click(screen.getByRole('button', { name: /Show both plans/ }));
    expect(screen.getByText(/^Add a dbt quality check for game_events/)).toBeVisible();
  });

  it('keeps the baseline plan above the evidence that changed it', async () => {
    const user = userEvent.setup();
    const { container } = render(<RepositoryDecisionDiff data={repositoryDecision} />);

    await user.click(screen.getByRole('button', { name: /Compare$/ }));

    /*
     * Folding must not reorder the argument. The plan pair is one collapsible unit with
     * two positions precisely so the evidence stays between the plan made without it
     * and the plan made with it; rendering both plans adjacently would put the changed
     * plan above its own cause.
     */
    const order = [
      screen.getByText('Catalog projection only'),
      screen.getByText('Repository evidence (3)'),
      screen.getByText('Catalog projection + repository evidence'),
      screen.getByText('What changed'),
    ];
    const positions = order.map((node) => {
      const all = [...container.querySelectorAll('*')];
      return all.indexOf(node);
    });
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('carries the recorded absence of co-change evidence rather than hiding it', async () => {
    const user = userEvent.setup();
    render(<RepositoryDecisionDiff data={repositoryDecision} />);

    await user.click(screen.getByRole('button', { name: /Add evidence$/ }));

    expect(screen.getByText('No co-change evidence available')).toBeVisible();
    expect(screen.getByText(/no partners are asserted/)).toBeVisible();
  });

  it('marks each changed row with a word, not colour alone', async () => {
    const user = userEvent.setup();
    render(<RepositoryDecisionDiff data={repositoryDecision} />);

    await user.click(screen.getByRole('button', { name: /Compare$/ }));

    for (const label of ['ADDED', 'REMOVED', 'CONSTRAINED']) {
      expect(screen.getByText(label)).toBeVisible();
    }
  });

  it('links the bound run and states what it does not show', () => {
    render(<RepositoryDecisionDiff data={repositoryDecision} />);

    const link = screen.getByRole('link', { name: /INSPECT FROZEN RUN/ });
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('live-qwen-judge-run-bundle.json'),
    );
    expect(screen.getByText(/WHAT THIS DOES NOT SHOW/)).toBeVisible();
    expect(screen.getByText(/One recorded run, on one dataset/)).toBeVisible();
  });

  it('steps between stages with the arrow keys from one tab stop', async () => {
    const user = userEvent.setup();
    render(<RepositoryDecisionDiff data={repositoryDecision} />);

    const first = screen.getByRole('button', { name: /Baseline$/ });
    first.focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('button', { name: /Add evidence$/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('Exact producing source')).toBeVisible();
  });

  it('keeps Previous and Next operable so nothing depends on a gesture', async () => {
    const user = userEvent.setup();
    render(<RepositoryDecisionDiff data={repositoryDecision} />);

    expect(screen.getByRole('button', { name: /Previous/ })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /Next/ }));
    expect(screen.getByRole('button', { name: /Add evidence$/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: /Previous/ }));
    expect(screen.getByRole('button', { name: /Baseline$/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
