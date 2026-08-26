import { describe, expect, it } from 'vitest';
import { PROOFS } from '@/content/proofs';
import { ROLE_LENSES, athenahealthYoh, defaultRole } from '@/content/roles';
import { APPLICATION_LENSES, linearApplication } from '@/content/applications';
import { ALL_LENSES, PRINTABLE_LENSES } from '@/content/lenses';
import { prioritiseMapping } from './mapping';
import { numberSections } from './page-plan';
import {
  getApplicationLens,
  getPrintableLens,
  getRoleLens,
  listPrintableSlugs,
  listRoleSlugs,
  projectProofs,
} from './role-lens';

describe('getRoleLens', () => {
  it('resolves a known slug', () => {
    expect(getRoleLens('athenahealth-yoh')?.slug).toBe('athenahealth-yoh');
  });

  it('returns undefined for an unknown slug rather than falling back', () => {
    // A silent fallback would serve a different projection under the requested URL.
    expect(getRoleLens('some-company-that-does-not-exist')).toBeUndefined();
  });

  it('does not route the durable default lens', () => {
    expect(getRoleLens('default')).toBeUndefined();
    expect(listRoleSlugs()).not.toContain('default');
  });
});

describe('projectProofs', () => {
  it('returns every durable proof for the default lens', () => {
    expect(projectProofs(defaultRole).map((p) => p.id)).toEqual(PROOFS.map((p) => p.id));
  });

  it('applies the order a lens asks for', () => {
    const lens = { ...defaultRole, proofOrder: ['interlock', 'vreko'] };
    const ordered = projectProofs(lens).map((p) => p.id);
    expect(ordered.slice(0, 2)).toEqual(['interlock', 'vreko']);
  });

  it('appends proofs a lens omits, so a projection cannot silently drop evidence', () => {
    const lens = { ...defaultRole, proofOrder: ['interlock'] };
    const ordered = projectProofs(lens).map((p) => p.id);
    expect(ordered).toHaveLength(PROOFS.length);
    expect(ordered).toContain('vreko');
    expect(ordered).toContain('repository-intelligence');
  });

  it('ignores unknown proof ids instead of rendering a hole', () => {
    const lens = { ...defaultRole, proofOrder: ['nope', 'vreko'] };
    const ordered = projectProofs(lens).map((p) => p.id);
    expect(ordered[0]).toBe('vreko');
    expect(ordered).toHaveLength(PROOFS.length);
  });
});

/**
 * The central architectural guarantee: a lens is a projection, not a fork. If one could
 * change what a proof claims, comparing two lenses would tell an evaluator nothing.
 */
describe('lenses project rather than fork', () => {
  it('every lens shows the same proof objects as the durable set', () => {
    for (const lens of ALL_LENSES) {
      const projected = projectProofs(lens);
      expect(new Set(projected)).toEqual(new Set(PROOFS));
    }
  });

  it('every lens mapping row exists verbatim in the durable mapping', () => {
    // Application lenses included. An application surface is the place a tailored copy
    // would be most tempting and most damaging, so it is held to the same rule: it may
    // promote a durable row, never write one.
    for (const lens of ALL_LENSES) {
      for (const row of lens.mapping) {
        expect(defaultRole.mapping).toContainEqual(row);
      }
    }
  });

  it('a role lens reorders the mapping without adding or losing rows', () => {
    expect(athenahealthYoh.mapping).toHaveLength(defaultRole.mapping.length);
    expect(athenahealthYoh.mapping[0].problem).toBe(
      'Build MCP servers and tool surfaces',
    );
  });
});

describe('prioritiseMapping', () => {
  const mapping = [
    { problem: 'a', evidence: 'A', discuss: '' },
    { problem: 'b', evidence: 'B', discuss: '' },
    { problem: 'c', evidence: 'C', discuss: '' },
  ];

  it('promotes named rows and preserves the order of the rest', () => {
    expect(prioritiseMapping(mapping, ['c']).map((r) => r.problem)).toEqual([
      'c',
      'a',
      'b',
    ]);
  });

  it('ignores names that match nothing, degrading to the durable order', () => {
    expect(prioritiseMapping(mapping, ['zzz']).map((r) => r.problem)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('never duplicates or drops a row', () => {
    const result = prioritiseMapping(mapping, ['b', 'b', 'a']);
    expect(result).toHaveLength(3);
    expect(new Set(result)).toEqual(new Set(mapping));
  });
});

/**
 * Application lenses.
 *
 * The routing property matters as much as the content one. `/linear` must exist and
 * `/role/linear` must not, because two public addresses for one application surface is
 * exactly the duplication the lens architecture exists to prevent.
 */
describe('application lenses', () => {
  it('resolves an application slug, and keeps it out of the role routes', () => {
    expect(getApplicationLens('linear')?.slug).toBe('linear');
    expect(getRoleLens('linear')).toBeUndefined();
    expect(listRoleSlugs()).not.toContain('linear');
  });

  it('owns a public path of its own rather than a /role/ address', () => {
    for (const lens of APPLICATION_LENSES) {
      expect(lens.publicPath).toBe(`/${lens.slug}`);
      expect(lens.publicPath.startsWith('/role/')).toBe(false);
    }
  });

  it('gives every lens a unique slug across both registries', () => {
    const slugs = ALL_LENSES.map((lens) => lens.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('makes every non-default lens printable exactly once', () => {
    expect(PRINTABLE_LENSES.some((lens) => lens.isDefault)).toBe(false);
    expect(listPrintableSlugs()).toContain('linear');
    expect(getPrintableLens('linear')?.slug).toBe('linear');
    expect(listPrintableSlugs().filter((slug) => slug === 'linear')).toHaveLength(1);
  });

  it('names a résumé projection that is registered', () => {
    for (const lens of ALL_LENSES) {
      expect(['default', 'linear']).toContain(lens.resumeProjection);
    }
  });

  it('leaves generic role lenses on the durable résumé', () => {
    // A role lens changes the masthead title and nothing else. Only an application lens
    // may reorder a career, and only because it is addressed to one reader who has told
    // us what they are hiring for.
    for (const lens of [defaultRole, ...ROLE_LENSES]) {
      expect(lens.resumeProjection).toBe('default');
    }
  });

  it('carries receipts that hold no proof content of their own', () => {
    /*
     * A receipt is a stated claim with a boundary, not a Proof. It has no evidence rows,
     * no summary rows and no claims, which is what keeps it outside the evidence model
     * rather than a weaker member of it.
     *
     * The check used to be `not.toHaveProperty('evidence')`, which stopped meaning that
     * when receipts gained an `evidence` field of their own. The two are different
     * things sharing a word: a Proof's `evidence` is an array of rows a reader can open,
     * a receipt's is a single state saying how far this row can be checked at all. So
     * the assertion is now about shape rather than about the absence of a name.
     */
    for (const receipt of linearApplication.receipts) {
      expect(Array.isArray(receipt.evidence)).toBe(false);
      expect(typeof receipt.evidence.state).toBe('string');
      expect(receipt).not.toHaveProperty('summary');
      expect(receipt).not.toHaveProperty('claims');
      expect(receipt.boundary.length).toBeGreaterThan(0);
    }
  });

  it('plans a page whose every stage is a section the surface renders', () => {
    const known = new Set([
      ...PROOFS.map((proof) => proof.sectionId),
      'product-history',
      'linear-in-practice',
      'product-judgment',
      'never-ask-twice',
      'career',
      'claim-ledger',
    ]);

    for (const lens of APPLICATION_LENSES) {
      expect(lens.pagePlan.length).toBeGreaterThan(0);
      for (const step of lens.pagePlan) expect(known).toContain(step.id);

      const ids = lens.pagePlan.map((step) => step.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('numbers the page by position, so the map cannot disagree with the page', () => {
    // The defect this replaced: the plan authored its own numbers, the proof sections
    // printed the stage they hold on `/`, and the rail counted a third way. Numbering is
    // derived here, so a section moved in the plan is renumbered everywhere at once.
    for (const lens of APPLICATION_LENSES) {
      const steps = numberSections(lens.pagePlan);

      expect(steps.map((step) => step.n)).toEqual(
        lens.pagePlan.map((_, index) => String(index + 1).padStart(2, '0')),
      );
      expect(steps.map((step) => step.id)).toEqual(lens.pagePlan.map((step) => step.id));
    }
  });

  it('states each section identity once, in the plan', () => {
    for (const lens of APPLICATION_LENSES) {
      for (const step of lens.pagePlan) {
        expect(step.eyebrow.length).toBeGreaterThan(0);
        expect(step.label.length).toBeGreaterThan(0);
      }

      /*
       * Identity is `id` and `label`; the eyebrow names a *kind* and may repeat.
       *
       * Three sections share `AI PRODUCT PROOF` on purpose; that is what they are, and
       * the eyebrow saying so is the point. What was wrong before was the eyebrow
       * carrying `· 01`, `· 02`, `· 03`: a second ordinal system running under the
       * page's own, disagreeing with the hero's third one about which system was `01`.
       * Uniqueness belongs to the things that address a section, not to the label that
       * classifies it.
       */
      const labels = lens.pagePlan.map((step) => step.label);
      expect(new Set(labels).size).toBe(labels.length);
    }
  });

  it('leaves the page plan as the only ordinal system on the surface', () => {
    /*
     * A visible number must mean position in the reading order and nothing else.
     *
     * The regression guarded against is the one that shipped: eyebrows reading
     * `AI PRODUCT PROOF · 01` while the plan numbered the same section `03`, so the
     * page asserted two different numbers for one place. Section-level copy states no
     * ordinal of its own; `numberSections` stamps the only one there is.
     */
    for (const lens of APPLICATION_LENSES) {
      for (const step of lens.pagePlan) {
        expect(
          step.eyebrow,
          `"${step.eyebrow}" carries an ordinal: the plan owns the numbering`,
        ).not.toMatch(/\b\d{1,2}\b/);
        expect(step.label).not.toMatch(/\b\d{1,2}\b/);
      }
    }
  });

  it('plans the same proofs it projects, in the same order', () => {
    // `proofOrder` drives the evidence projection and the plan drives the page. They are
    // two lists, so they are asserted equal rather than assumed to be.
    for (const lens of APPLICATION_LENSES) {
      const planned = lens.pagePlan
        .map((step) => step.proof)
        .filter((id): id is string => Boolean(id));

      expect(planned).toEqual(lens.proofOrder);
      expect(projectProofs(lens).map((proof) => proof.id)).toEqual(planned);
    }
  });

  it('places every proof section the plan names at that plan position', () => {
    // A proof carries a durable stage: the position it holds on `/`. On an application
    // surface that reorders them, that stage is a fact about a different page, and the
    // section may not print it. This is the assertion that says the two are allowed to
    // differ, and that it is the plan the reader is shown.
    const steps = numberSections(linearApplication.pagePlan);
    const vreko = steps.find((step) => step.proof === 'vreko');

    expect(vreko?.n).toBe('06');
    expect(PROOFS.find((proof) => proof.id === 'vreko')?.stage).toBe('02');
  });
});
