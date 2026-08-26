import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ProductHistory, SurfaceStep } from '@/lib/types';
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
 */

const step: SurfaceStep = {
  id: 'product-history',
  n: '01',
  eyebrow: 'PRODUCT ENGINEERING RECORD',
  frame: 'standard',
  label: 'Career',
};

const copy = {
  heading: 'A heading.',
  body: 'A lead.',
  boundary: 'A boundary.',
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

describe('ProductHistorySection', () => {
  it('renders an unresolved record as a stated gap, never as evidence', () => {
    render(
      <ProductHistorySection
        copy={copy}
        history={fixture}
        nextId="next-section"
        step={step}
      />,
    );

    // The mark, once per unresolved record and not once per register.
    expect(screen.getAllByText('NOT YET EVIDENCE')).toHaveLength(2);

    // And the question itself, in full. A mark with the question truncated behind it
    // tells the reader that something is missing without telling them what.
    expect(
      screen.getByText(/What was built in this period, beyond the titles held\./),
    ).toBeVisible();
    expect(
      screen.getByText(/Which framework, if any, these surfaces were built in\./),
    ).toBeVisible();
  });

  it('offers nothing to click on an unresolved record', () => {
    render(
      <ProductHistorySection
        copy={copy}
        history={fixture}
        nextId="next-section"
        step={step}
      />,
    );

    // The section's own call to action is the only link. An unresolved row that carried
    // one would be the exact failure the evidence rule exists to prevent: a destination
    // that looks like a receipt and is not.
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '#next-section');
  });

  it('states a supported record as ordinary prose', () => {
    render(
      <ProductHistorySection
        copy={copy}
        history={fixture}
        nextId="next-section"
        step={step}
      />,
    );

    const supported = screen.getByText('Something the record supports.');
    expect(supported).toBeVisible();
    expect(supported.textContent).not.toContain('NOT YET EVIDENCE');
  });
});
