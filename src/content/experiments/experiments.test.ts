import { describe, expect, it } from 'vitest';
import { repositoryDecision } from './repository-decision';
import { interlockHac330 } from './interlock-hac330';
import { vrekoArchitecture } from './vreko-architecture';
import { PROOFS } from '@/content/proofs';
import { DECISION_RECEIPTS } from '@/content/decisions';
import { isResolved } from '@/lib/evidence';

/**
 * Integrity tests for the three bound experiments.
 *
 * These are not tests of the components. They guard the properties that make the
 * interactions honest, and each one would have caught a specific mistake that was
 * genuinely available while this was written.
 */

const GITHUB_BLOB = /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[0-9a-f]{40}\//;

/**
 * Receipts cite directories as well as files, so they take the same rule over `/tree/`.
 * The proof rows deliberately do not: two of them point at `/tree/main/packages/spec`
 * because the claim there is "a published machine-checkable contract exists", which is
 * a claim about the living standard rather than about one revision of it.
 */
const GITHUB_PINNED =
  /^https:\/\/github\.com\/[^/]+\/[^/]+\/(?:blob|tree)\/[0-9a-f]{40}\//;

describe('evidence links', () => {
  it('pins every GitHub evidence link to a full commit sha, never a branch', () => {
    const hrefs = [
      repositoryDecision.artifact.href,
      interlockHac330.artifact.href,
      ...vrekoArchitecture.sources.map((s) => s.href),
      ...PROOFS.flatMap((p) => [
        ...p.evidence.map((e) => e.href),
        ...p.summary.map((e) => e.href),
      ]),
    ].filter((href): href is string => Boolean(href));

    for (const href of hrefs) {
      if (!href.includes('github.com') || !href.includes('/blob/')) continue;
      // A /blob/main/... link silently changes meaning when main moves.
      expect(href, `${href} is not pinned to an immutable revision`).toMatch(GITHUB_BLOB);
    }
  });

  it('pins every receipt evidence link, directories included', () => {
    // A receipt argues about a decision at a point in time. A link that follows main
    // would quietly restate that argument against code the decision never saw, so a
    // receipt citing an evidence tree has to name the revision the tree was read at.
    const hrefs = DECISION_RECEIPTS.flatMap((receipt) =>
      (receipt.evidence ?? []).map((reference) => reference.href),
    ).filter((href): href is string => Boolean(href));

    for (const href of hrefs) {
      if (!href.includes('/blob/') && !href.includes('/tree/')) continue;
      expect(href, `${href} is not pinned to an immutable revision`).toMatch(
        GITHUB_PINNED,
      );
    }
  });

  it('never resolves an evidence row to a bare GitHub profile', () => {
    const hrefs = PROOFS.flatMap((p) => [
      ...p.evidence.map((e) => e.href),
      ...p.summary.map((e) => e.href),
    ]).filter((href): href is string => Boolean(href));

    for (const href of hrefs) {
      expect(href).not.toBe('https://github.com/qmarcelle');
      expect(href.startsWith('#')).toBe(false);
    }
  });
});

describe('repository decision run', () => {
  it('is bound to an inspectable artifact', () => {
    expect(isResolved(repositoryDecision.artifact)).toBe(true);
  });

  it('attributes every changed row to evidence that exists', () => {
    const ids = new Set(repositoryDecision.evidence.map((e) => e.id));
    for (const row of repositoryDecision.diff) {
      expect(row.attributedTo.length).toBeGreaterThan(0);
      for (const id of row.attributedTo) {
        expect(ids.has(id), `${row.id} cites unknown evidence ${id}`).toBe(true);
      }
    }
  });

  it('does not force the evidence into a co-change taxonomy', () => {
    // The run contains no co-change at all, and one row records that. If a future
    // edit "tidies" that row away, the interaction starts implying a finding the
    // artifact does not contain.
    const kinds = repositoryDecision.evidence.map((e) => e.kind);
    expect(kinds).toContain('indeterminate');
    expect(
      repositoryDecision.evidence.some((e) =>
        e.observation.includes('no behavioral co-change evidence'),
      ),
    ).toBe(true);
  });

  it('states what was held fixed, including the model', () => {
    // This run does involve a model, and the artifact records prompt and settings
    // digests, so naming them is supported here: unlike in HAC-330.
    expect(repositoryDecision.controls.heldFixed.join(' ')).toMatch(/qwen-plus/);
    expect(repositoryDecision.controls.heldFixed.join(' ')).toMatch(/Prompt digest/);
  });

  it('keeps a stated boundary', () => {
    expect(repositoryDecision.boundary).toMatch(/One recorded run/);
  });
});

describe('interlock HAC-330', () => {
  it('matches the frozen packet’s bound and totals', () => {
    expect(interlockHac330.bound).toBe(130);

    const outcome = interlockHac330.stages.find((s) => s.id === 'outcome');
    expect(outcome?.frames.uncoordinated.total).toBe(140);
    expect(outcome?.frames.uncoordinated.holds).toBe(false);
    expect(outcome?.frames.interlocked.total).toBe(120);
    expect(outcome?.frames.interlocked.holds).toBe(true);
  });

  it('keeps every stage’s segments summing to its stated total', () => {
    const check = (stages: readonly (typeof interlockHac330.stages)[number][]) => {
      for (const stage of stages) {
        for (const armId of ['uncoordinated', 'interlocked'] as const) {
          const frame = stage.frames[armId];
          const sum = frame.segments.reduce((total, s) => total + s.value, 0);
          expect(sum, `${stage.id}/${armId} segments do not sum to total`).toBe(
            frame.total,
          );
        }
      }
    };
    check(interlockHac330.stages);
    check(interlockHac330.perturbedStages);
  });

  it('never exceeds the shared scale', () => {
    for (const stage of [...interlockHac330.stages, ...interlockHac330.perturbedStages]) {
      for (const armId of ['uncoordinated', 'interlocked'] as const) {
        expect(stage.frames[armId].total).toBeLessThanOrEqual(interlockHac330.scaleMax);
      }
    }
  });

  it('flips the decision under perturbation, using the same decision function', () => {
    const treated = interlockHac330.stages.find((s) => s.id === 'decision');
    const perturbed = interlockHac330.perturbedStages.find((s) => s.id === 'decision');

    expect(treated?.frames.interlocked.decision).toBe('WITHHOLD_SERIALIZE');
    expect(perturbed?.frames.interlocked.decision).toBe('ALLOW_PARALLEL');

    // The untreated arm has no decision point, so perturbation must not invent one.
    expect(perturbed?.frames.uncoordinated.decision).toBeUndefined();
  });

  it('does not borrow model-experiment language for a run with no model', () => {
    const text = [
      interlockHac330.controls.varied,
      ...interlockHac330.controls.heldFixed,
      interlockHac330.question,
    ]
      .join(' ')
      .toLowerCase();

    expect(text).not.toMatch(/same prompt/);
    expect(text).not.toMatch(/same model/);
    expect(text).not.toMatch(/temperature/);
    expect(interlockHac330.controls.varied).toMatch(/evidence/i);
  });

  it('preserves the distinctions the source repository insists on', () => {
    expect(interlockHac330.distinctions).toContain('ALLOW is not VERIFIED');
    expect(interlockHac330.distinctions).toContain('OBSERVED is not SAFE');
  });

  it('keeps HAC-330, HAC-340 and HAC-343 distinct', () => {
    expect(interlockHac330.experiment).toBe('HAC-330');
    // The counterfactual's own artifact must be the local packet, not a cloud run.
    expect(interlockHac330.artifact.href).toContain('hac-330');
    expect(interlockHac330.artifact.href).not.toContain('hac-342');
    expect(interlockHac330.artifact.href).not.toContain('hac-343');
  });
});

describe('vreko public architecture', () => {
  it('marks the proprietary core as not published', () => {
    const platform = vrekoArchitecture.containers.find((c) => c.id === 'platform');
    expect(platform?.publication).toBe('declared-not-published');
    for (const component of platform?.components ?? []) {
      expect(component.publication).toBe('declared-not-published');
    }
  });

  it('does not list a private package as published', () => {
    const publicNames = new Set(vrekoArchitecture.publicPackages.map((p) => p.name));
    for (const name of vrekoArchitecture.privatePackages) {
      expect(publicNames.has(name), `${name} is in both lists`).toBe(false);
    }
  });

  it('publishes a command that re-derives the boundary', () => {
    expect(vrekoArchitecture.boundaryVerification.command).toMatch(/npm view/);
  });

  it('records discrepancies rather than reconciling them', () => {
    expect(vrekoArchitecture.discrepancies.length).toBeGreaterThan(0);
    const detail = vrekoArchitecture.discrepancies.map((d) => d.detail).join(' ');
    expect(detail).toMatch(/no reconciliation is invented/i);
  });

  it('routes every trace hop to a container that exists, or explicitly outside', () => {
    const ids = new Set<string | null>([
      null,
      vrekoArchitecture.external.upstream.id,
      vrekoArchitecture.external.downstream.id,
      ...vrekoArchitecture.containers.map((c) => c.id),
    ]);
    for (const hop of vrekoArchitecture.trace) {
      expect(ids.has(hop.atContainerId), `${hop.id} points nowhere`).toBe(true);
    }
  });

  it('states that the implementation is not inspectable in the proof boundary', () => {
    const vreko = PROOFS.find((p) => p.id === 'vreko');

    // Asserted as a property rather than as a phrase, so a rewrite of the boundary does
    // not fail this while a *withdrawal* of the caveat does.
    expect(vreko?.boundary).toMatch(/not published|not open to inspection|proprietary/i);

    // The withdrawn claim must not come back: the public repositories are distribution
    // and documentation surfaces, and none of them carry the implementation.
    expect(JSON.stringify(vreko)).not.toMatch(
      /repository containing the server implementation/i,
    );
  });
});
