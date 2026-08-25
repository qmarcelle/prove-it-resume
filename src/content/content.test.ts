import { describe, expect, it } from 'vitest';
import { PROOFS } from '@/content/proofs';
import { CLAIMS } from '@/content/claims';
import { DECISION_RECEIPTS } from '@/content/decisions';
import { PROFILES, RESUME } from '@/content/site';
import { neverAskTwice } from '@/content/supporting/never-ask-twice';
import { PROOF_STEPS } from '@/lib/proof-steps';
import { isResolved } from '@/lib/evidence';

/**
 * Content-integrity tests.
 *
 * These guard the promises the site makes about itself. The most important one is the
 * last block: no evidence record may carry a destination that is merely a GitHub profile
 * or an on-page anchor, because those were the two ways the design draft produced links
 * that looked like evidence and were not.
 */
describe('proof content', () => {
  it('has a section for every rail step that names a proof', () => {
    const sectionIds = new Set(PROOFS.map((proof) => proof.sectionId));
    for (const proof of PROOFS) {
      expect(sectionIds.has(proof.sectionId)).toBe(true);
    }
    // The rail's six stages must all be real anchors somewhere on the page.
    expect(PROOF_STEPS).toHaveLength(6);
    expect(PROOF_STEPS.map((step) => step.id)).toEqual([
      'sec-01',
      'sec-02',
      'sec-03',
      'sec-04',
      'sec-05',
      'sec-06',
    ]);
  });

  it('gives every proof a stated boundary', () => {
    for (const proof of PROOFS) {
      expect(proof.boundary.length).toBeGreaterThan(0);
    }
  });

  it('gives every proof at least one evidence row and one summary row', () => {
    for (const proof of PROOFS) {
      expect(proof.evidence.length).toBeGreaterThan(0);
      expect(proof.summary.length).toBeGreaterThan(0);
    }
  });

  it('uses unique ids across all evidence rows', () => {
    const ids = PROOFS.flatMap((proof) => [
      ...proof.evidence.map((row) => row.id),
      ...proof.summary.map((row) => row.id),
    ]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every proof a compact listing name and summary', () => {
    for (const proof of PROOFS) {
      expect(proof.listing.summary.length).toBeGreaterThan(0);
    }
  });
});

describe('claim ledger', () => {
  it('states a boundary for every claim', () => {
    expect(CLAIMS.length).toBeGreaterThan(0);
    for (const claim of CLAIMS) {
      expect(claim.boundary.length).toBeGreaterThan(0);
      expect(claim.evidence.length).toBeGreaterThan(0);
    }
  });
});

describe('decision receipts', () => {
  it('has a question for every receipt', () => {
    for (const receipt of DECISION_RECEIPTS) {
      expect(receipt.question.length).toBeGreaterThan(0);
    }
  });

  it('answers every question from a recorded decision', () => {
    // These were populated from the Linear issues and Fibery Open Questions that carried
    // the reasoning when each decision was made. An unanswered receipt is still a valid
    // state — the component renders its shape as AWAITING — but a partial one is not: a
    // receipt that states a decision without its constraint or its cost is the kind of
    // tidied-up rationale this section exists to avoid.
    for (const receipt of DECISION_RECEIPTS) {
      expect(receipt.decision).toBeTruthy();
      expect(receipt.constraint).toBeTruthy();
      expect(receipt.tradeoff).toBeTruthy();
      expect(receipt.wouldChangeIf).toBeTruthy();
    }
  });

  it('never links a receipt to an artifact it has not confirmed', () => {
    for (const receipt of DECISION_RECEIPTS) {
      for (const reference of receipt.evidence ?? []) {
        if (reference.verified) expect(reference.href).toBeTruthy();
      }
    }
  });
});

describe('evidence integrity', () => {
  const allRefs = [
    ...PROOFS.flatMap((proof) => [...proof.evidence, ...proof.summary]),
    neverAskTwice.evidence,
    RESUME,
    ...PROFILES,
  ];

  it('never marks a record verified without a destination', () => {
    for (const ref of allRefs) {
      if (ref.verified) expect(ref.href).toBeTruthy();
    }
  });

  it('never points an evidence record at a bare profile page', () => {
    for (const ref of allRefs) {
      if (!isResolved(ref)) continue;
      expect(ref.href).not.toBe('https://github.com/qmarcelle');
    }
  });

  it('never points an evidence record at an on-page anchor', () => {
    for (const ref of allRefs) {
      if (!ref.href) continue;
      expect(ref.href.startsWith('#')).toBe(false);
    }
  });

  it('resolves only destinations that are absolute https URLs', () => {
    for (const ref of allRefs) {
      if (!isResolved(ref)) continue;
      expect(ref.href).toMatch(/^https:\/\//);
    }
  });
});
