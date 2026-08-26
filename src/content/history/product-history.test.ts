import { describe, expect, it } from 'vitest';
import { RESUME_ROLES, UNVERIFIED } from '../resume/facts';
import { PRODUCT_ENGINEERING_HISTORY } from './product-engineering';

/**
 * The product-history section's two obligations.
 *
 * The design direction supplied this section with details no source in this repository
 * supports: per-audience product surfaces, screens built in the 2016–2019 period, a
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
    /*
     * This used to assert that at least one gap existed, on the reasoning that a
     * register reaching zero probably had its questions deleted rather than answered.
     * That was the right guard while the questions were open and is the wrong one now:
     * the owner supplied the 2016–2019 record, the frontend stack and the per-audience
     * ownership, so `UNVERIFIED` is legitimately empty and holding the page to a
     * decorative dashed box would be its own dishonesty.
     *
     * What survives is the invariant that matters in both directions. Every gap this
     * section shows has to be a gap the corpus records, and every gap the corpus
     * records has to be shown. Zero and zero satisfies it; one and zero does not.
     */
    const recorded = new Set(UNVERIFIED.map((fact) => fact.id));
    const gaps = ALL_ENTRIES.filter((entry) => entry.unresolved);

    for (const entry of gaps) {
      expect(recorded, `${entry.id} points at an unrecorded gap`).toContain(
        entry.unresolved!.unverifiedId,
      );
    }
  });

  it('renders every recorded gap that belongs to this section', () => {
    /*
     * Every gap the corpus still records is a question a product-engineering reader
     * will actually ask, so each has to appear on the page rather than only in the fact
     * corpus, which is exactly what was wrong before: `UNVERIFIED` existed, and nothing
     * rendered it.
     *
     * Asserted against `UNVERIFIED` itself rather than a hand-written list. The list
     * has already shrunk once: the frontend framework and the per-audience surfaces
     * were both answered by a later record, and a hardcoded copy of it here would have
     * had to be edited by hand at exactly the moment carelessness is most likely.
     */
    const asked = new Set(
      ALL_ENTRIES.flatMap((entry) =>
        entry.unresolved ? [entry.unresolved.unverifiedId] : [],
      ),
    );

    for (const fact of UNVERIFIED) {
      expect(asked, `${fact.id} is recorded but never shown`).toContain(fact.id);
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
     * The frontend row used to be the thing this check guarded, because it was the one
     * question the section visibly refused and the one a reader most wants answered.
     * The record has since answered it, so the guard moved rather than went away: what
     * a stated entry must not do now is invent broker or employer capabilities that
     * nobody supplied, or name a technology alongside the ones that are established.
     *
     * `enrollment` left the list because enrollment *data* is now established: it is
     * one of the things the team's services supplied. "Enrollment administration" as a
     * broker capability is a different claim and is still forbidden.
     */
    const stated = ALL_ENTRIES.filter((entry) => entry.body)
      .map((entry) => entry.body!)
      .join(' ');

    for (const claim of [
      'Angular',
      'Vue',
      'Svelte',
      'jQuery',
      'Redux',
      'GraphQL',
      'quoting',
      'group administration',
      'group billing',
      'enrollment administration',
      'commissions',
      'eligibility',
    ]) {
      expect(stated, `${claim} is not supported by the fact corpus`).not.toContain(claim);
    }
  });

  it('answers the 2016–2019 stage with the applications that were built', () => {
    /*
     * The inverse of the assertion it replaces. This stage was the last dashed box on
     * the page and stayed one for as long as the record was title-only. It is now the
     * opening of the progression the section exists to show, so the check is that it
     * carries the two applications with a single named author rather than a question.
     */
    const first = PRODUCT_ENGINEERING_HISTORY.stages[0];
    expect(first.span).toContain('2016');
    expect(first.unresolved).toBeUndefined();
    expect(first.body).toContain('Contact Preference');
    expect(first.body).toContain('Fee Schedule');
    expect(first.body).toContain('production support');
  });

  it('reads as a progression from building to leading', () => {
    /*
     * The section's whole argument in one assertion: the leadership grew out of the
     * building rather than replacing it. That only holds if the early stages speak in
     * the voice of someone with their hands on the code and the later ones speak about
     * a team, so the two ends are checked for exactly that.
     */
    const [first, , , last] = PRODUCT_ENGINEERING_HISTORY.stages;
    expect(first.body).toMatch(/\bbuilt\b/i);
    expect(last.body).toMatch(/\bteam\b/i);
    expect(last.body).toMatch(/^Led\b/);
  });

  it('never turns team-owned surfaces into personally authored ones', () => {
    /*
     * The register describing who the products served is team ownership throughout, and
     * the failure mode is a later edit rewriting "the team owned" into "built". Each row
     * that describes the portal estate has to keep saying whose work it was.
     */
    const owned = PRODUCT_ENGINEERING_HISTORY.audiences.filter(
      (entry) => entry.id !== 'audience-provider',
    );
    expect(owned.length).toBeGreaterThan(0);
    for (const entry of owned) {
      expect(entry.body, `${entry.id} claims a surface without naming its owner`).toMatch(
        /\bteam\b/i,
      );
    }
  });
});
