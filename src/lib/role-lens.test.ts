import { describe, expect, it } from 'vitest';
import { PROOFS } from '@/content/proofs';
import { ROLE_LENSES, athenahealthYoh, defaultRole } from '@/content/roles';
import { prioritiseMapping } from './mapping';
import { getRoleLens, listRoleSlugs, projectProofs } from './role-lens';

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
    for (const lens of [defaultRole, ...ROLE_LENSES]) {
      const projected = projectProofs(lens);
      expect(new Set(projected)).toEqual(new Set(PROOFS));
    }
  });

  it('every lens mapping row exists verbatim in the durable mapping', () => {
    for (const lens of ROLE_LENSES) {
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
