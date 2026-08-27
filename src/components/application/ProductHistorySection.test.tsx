import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { ApplicationLens, ProductHistory, SurfaceStep } from '@/lib/types';
import { ProductHistorySection } from './ProductHistorySection';

/**
 * The unresolved rendering path, kept alive on purpose.
 *
 * As of the final fact pass `UNVERIFIED` is empty: every question this section used to
 * refuse to answer has been answered by the record, so nothing on the real page takes
 * the unresolved branch. That is the right outcome and a hazard at the same time. A
 * rendering path with no instance is one nobody notices breaking, and this one is the
 * mechanism the whole section is built around: the next time the corpus cannot support
 * a row, the row has to render as a stated gap rather than disappear.
 *
 * So the branch is exercised against a fixture rather than against the page. What is
 * asserted is the part that carries the meaning: the mark is present, the question is
 * printed in full, and the row is not a link. A gap that reads as evidence, or a gap
 * that quietly offers somewhere to click, would both be worse than no row at all.
 *
 * ## What progressive disclosure changed here, and what it must not
 *
 * The discipline register now sits behind the "what did I actually build?" invitation
 * rather than in the opening layer, so a gap in it is one deliberate interaction deeper
 * than a gap in the stage progression. That is a change to *when* the reader meets it.
 *
 * It is emphatically not licence to stop rendering it, so these tests now assert both
 * halves: that the opening layer states the gaps it carries, and that opening the path
 * reaches the rest of them, still marked and still unlinked. Asserting only the default
 * state would let a register quietly stop rendering and the suite stay green.
 */

const step: SurfaceStep = {
  id: 'product-history',
  n: '01',
  eyebrow: 'PRODUCT ENGINEERING RECORD',
  frame: 'standard',
  label: 'Career',
};

const copy: ApplicationLens['sections']['history'] = {
  heading: 'A heading.',
  body: 'A lead.',
  boundary: 'A boundary.',
  paths: [
    { id: 'built', invitation: 'What did I actually build?', label: 'WHAT WAS BUILT' },
    {
      id: 'leadership',
      invitation: 'What changed as I moved from builder to lead?',
      label: 'FROM BUILDER TO LEAD',
      paragraphs: ['A lesson the record supports.'],
    },
  ],
};

const fixture: ProductHistory = {
  stages: [
    {
      id: 'stage-x',
      roleId: 'developer',
      ordinal: 'STAGE 01',
      title: 'A period nobody documented',
      span: '2016 – 2019',
      unresolved: {
        wants: 'What was built in this period, beyond the titles held.',
        unverifiedId: 'a-recorded-gap',
      },
    },
  ],
  audiencesHeading: 'WHO THE PRODUCTS SERVED',
  audiences: [{ id: 'aud-x', label: 'Someone', body: 'Something the record supports.' }],
  disciplinesHeading: 'WHAT THE WORK SPANNED',
  disciplines: [
    {
      id: 'disc-x',
      label: 'Something unknown',
      unresolved: {
        wants: 'Which framework, if any, these surfaces were built in.',
        unverifiedId: 'another-recorded-gap',
      },
    },
  ],
};

function renderSection() {
  return render(
    <ProductHistorySection
      copy={copy}
      history={fixture}
      nextId="next-section"
      step={step}
    />,
  );
}

/** Opens a curiosity path the way a reader does, and returns the panel it revealed. */
async function open(invitation: string) {
  await userEvent.click(screen.getByRole('button', { name: new RegExp(invitation) }));
  return screen.getByRole('group');
}

describe('ProductHistorySection', () => {
  it('renders an unresolved record as a stated gap, never as evidence', async () => {
    renderSection();

    // The stage gap is in the opening layer and needs no interaction to be seen.
    expect(screen.getAllByText('NOT YET EVIDENCE')).toHaveLength(1);
    expect(
      screen.getByText(/What was built in this period, beyond the titles held\./),
    ).toBeVisible();

    // The register gap is behind the invitation that asks for it, and is marked the
    // same way once the reader has asked.
    const panel = await open('What did I actually build');
    expect(within(panel).getAllByText('NOT YET EVIDENCE')).toHaveLength(1);
    expect(
      within(panel).getByText(/Which framework, if any, these surfaces were built in\./),
    ).toBeVisible();
  });

  it('offers nothing to click on an unresolved record', async () => {
    renderSection();

    // The section's own call to action is the only link. An unresolved row that carried
    // one would be the exact failure the evidence rule exists to prevent: a destination
    // that looks like a receipt and is not.
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getAllByRole('link')[0]).toHaveAttribute('href', '#next-section');

    // And opening the deep layer must not introduce one either.
    const panel = await open('What did I actually build');
    expect(within(panel).queryAllByRole('link')).toHaveLength(0);
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('states a supported record as ordinary prose', async () => {
    renderSection();

    const panel = await open('What did I actually build');
    const supported = within(panel).getByText('Something the record supports.');
    expect(supported).toBeVisible();
    expect(supported.textContent).not.toContain('NOT YET EVIDENCE');
  });

  it('is fully readable before any interaction', () => {
    renderSection();

    // The orientation layer is the twenty-second answer, and it is ordinary document
    // content: heading, lead, and the progression. None of it may depend on a click.
    expect(screen.getByRole('heading', { name: 'A heading.' })).toBeVisible();
    expect(screen.getByText('A lead.')).toBeVisible();
    expect(screen.getByText('A period nobody documented')).toBeVisible();

    // And nothing deeper is in the document until it is asked for, so a reader is not
    // paying for it in scroll length.
    expect(screen.queryByRole('group')).toBeNull();
    expect(screen.queryByText('WHO THE PRODUCTS SERVED')).toBeNull();
  });

  it('states no more than two curiosity paths', () => {
    renderSection();

    // The ceiling is editorial rather than technical: a third invitation stops reading
    // as a conversation and starts reading as a menu.
    const invitations = screen.getByRole('list', {
      name: /Questions this history can answer/,
    });
    expect(within(invitations).getAllByRole('button')).toHaveLength(2);
  });

  it('names the question each path answers rather than offering a bare label', () => {
    renderSection();

    for (const path of copy.paths) {
      expect(
        screen.getByRole('button', { name: new RegExp(path.invitation) }),
      ).toBeVisible();
    }
    expect(
      screen.queryByRole('button', { name: /^(Learn more|View details)$/i }),
    ).toBeNull();
  });
});
