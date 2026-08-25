import { describe, expect, it } from 'vitest';
import { numberSections, requireStep, stepsById } from './page-plan';
import type { SurfaceSection } from './types';

const PLAN: readonly SurfaceSection[] = [
  { id: 'a', label: 'A', eyebrow: 'FIRST', frame: 'standard' },
  { id: 'b', label: 'B', eyebrow: 'SECOND', frame: 'band', proof: 'p' },
  { id: 'c', label: 'C', eyebrow: 'THIRD', frame: 'inline' },
];

describe('numberSections', () => {
  it('stamps two-digit numbers from position', () => {
    expect(numberSections(PLAN).map((step) => step.n)).toEqual(['01', '02', '03']);
  });

  it('renumbers the whole plan when one section moves', () => {
    // The property the surface depends on. A section cannot keep a stale number after a
    // reorder, because it never held one — the number is a function of the list.
    const moved = [PLAN[2], PLAN[0], PLAN[1]];
    expect(numberSections(moved).map((step) => [step.id, step.n])).toEqual([
      ['c', '01'],
      ['a', '02'],
      ['b', '03'],
    ]);
  });

  it('carries identity and frame through untouched', () => {
    const [first, second] = numberSections(PLAN);
    expect(first.eyebrow).toBe('FIRST');
    expect(second.frame).toBe('band');
    expect(second.proof).toBe('p');
  });
});

describe('requireStep', () => {
  it('returns the step a section was planned as', () => {
    expect(requireStep(stepsById(numberSections(PLAN)), 'b').n).toBe('02');
  });

  it('throws when a section is rendered that the plan does not list', () => {
    // Deliberately fatal. Returning undefined would let the section render unnumbered,
    // which is the defect rather than the fallback.
    expect(() => requireStep(stepsById(numberSections(PLAN)), 'missing')).toThrow(
      /absent from the page plan/,
    );
  });
});
