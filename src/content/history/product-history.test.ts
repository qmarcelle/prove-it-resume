import { describe, expect, it } from 'vitest';
import { RESUME_ROLES, UNVERIFIED } from '../resume/facts';
import { PRODUCT_ENGINEERING_HISTORY } from './product-engineering';

/**
 * The product-history section's two obligations.
 *
 * The design direction supplied this section with details no source in this repository
 * supports — per-audience product surfaces, screens built in the 2016–2019 period, a
 * browser stack. The section keeps the direction's structure and answers those entries
 * with the recorded gap instead of the direction's copy.
 *
 * That arrangement only holds if two things stay true, and neither is self-enforcing:
 * an unresolved entry must point at a gap the fact corpus still records, and a stated
 * entry must not quietly become the place an unverified fact gets asserted after all.
 */
const ALL_ENTRIES = [
  ...PRODUCT_ENGINEERING_HISTORY.stages,
  ...PRODUCT_ENGINEERING_HISTORY.audiences,
  ...PRODUCT_ENGINEERING_HISTORY.disciplines,
];

describe('product engineering history', () => {
  it('gives every entry exactly one of a body and a gap', () => {
    expect(ALL_ENTRIES.length).toBeGreaterThan(0);
    for (const entry of ALL_ENTRIES) {
      expect(
        Boolean(entry.body) !== Boolean(entry.unresolved),
        `${entry.id} states both or neither`,
      ).toBe(true);
    }
  });

  it('resolves every gap against the recorded unverified facts', () => {
    const recorded = new Set(UNVERIFIED.map((fact) => fact.id));
    const gaps = ALL_ENTRIES.filter((entry) => entry.unresolved);

    // If this ever reaches zero the section has stopped asking, and the honest reading
    // is that someone deleted the questions rather than answered them.
    expect(gaps.length).toBeGreaterThan(0);

    for (const entry of gaps) {
      expect(recorded, `${entry.id} points at an unrecorded gap`).toContain(
        entry.unresolved!.unverifiedId,
      );
    }
  });

  it('renders every recorded gap that belongs to this section', () => {
    /*
     * The three gaps the direction tried to fill with invented copy. Each one is a
     * question a product-engineering reader will actually ask, so each has to appear on
     * the page rather than only in the fact corpus — which is exactly what was wrong
     * before: `UNVERIFIED` existed, and nothing rendered it.
     */
    const asked = new Set(
      ALL_ENTRIES.flatMap((entry) =>
        entry.unresolved ? [entry.unresolved.unverifiedId] : [],
      ),
    );

    for (const id of [
      'frontend-framework',
      'member-broker-employer-products',
      'early-developer-detail',
    ]) {
      expect(asked, `${id} is recorded but never shown`).toContain(id);
    }
  });

  it('pins every stage to a role the chronology still has', () => {
    const roles = new Set(RESUME_ROLES.map((role) => role.id));
    for (const stage of PRODUCT_ENGINEERING_HISTORY.stages) {
      expect(roles, `${stage.id} names a role that no longer exists`).toContain(
        stage.roleId,
      );
    }
  });

  it('covers the chronology once, in order', () => {
    expect(PRODUCT_ENGINEERING_HISTORY.stages.map((stage) => stage.roleId)).toEqual(
      [...RESUME_ROLES].reverse().map((role) => role.id),
    );
  });

  it('never states a fact the corpus records as unverified', () => {
    /*
     * A weak but load-bearing check: the stated entries must not name a frontend
     * framework, which is the single most likely thing for a later edit to slip in —
     * it is the one question this section visibly refuses, and the one a reader most
     * wants answered.
     */
    const stated = ALL_ENTRIES.filter((entry) => entry.body)
      .map((entry) => entry.body!)
      .join(' ');

    for (const framework of ['React', 'Angular', 'Vue', 'Svelte', 'jQuery']) {
      expect(stated, `${framework} is not supported by the fact corpus`).not.toContain(
        framework,
      );
    }
  });
});
