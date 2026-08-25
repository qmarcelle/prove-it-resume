import type { Proof } from '@/lib/types';

/**
 * Interlock evidence, bound to the frozen HAC-330 packet.
 *
 * The counterfactual figures that used to live here (`140 > 130`, `WITHHOLD_SERIALIZE`,
 * `120 <= 130`) were carried over from the design draft and labelled in the UI as
 * unverified prototype values. They are now read from `experiments/hac-330/evidence/`
 * instead — see `src/content/experiments/interlock-hac330.ts`. The three figures turned
 * out to match the frozen packet exactly, but they are used because the packet says so,
 * not because the draft did.
 *
 * The three experiments stay distinct, as the source repository insists:
 * HAC-330 is the controlled local causal experiment, HAC-340 is a separate recorded
 * Google Cloud traversal (published for logged-out inspection as HAC-342), and HAC-343
 * is a broader bounded operational comparison.
 */
const INTERLOCK_REPO = 'https://github.com/Marcelle-Labs/interlock';
const INTERLOCK_REV = '4239474ace02ccb1492cc67cd768e2c4ef43c9db';
const HAC330 = `${INTERLOCK_REPO}/blob/${INTERLOCK_REV}/experiments/hac-330`;
const HAC342 = `${INTERLOCK_REPO}/blob/${INTERLOCK_REV}/experiments/hac-342`;

export const interlock: Proof = {
  id: 'interlock',
  sectionId: 'sec-04',
  stage: '04',
  eyebrow: '04 / PROOF THREE',
  railLabel: 'Interlock',
  listing: { summary: 'Agent coordination' },
  title: 'Interlock',
  thesis:
    'Can environment evidence change a coordination decision before shared-state mutation?',
  status: { label: 'CONTROLLED EVIDENCE', tone: 'controlled' },
  evidenceCode: 'EV-ILK',
  fields: [],
  demonstrates: [
    'define the decision boundary',
    'bind decisions to evidence',
    'test counterfactuals',
    'separate execution from observation',
    'distinguish provenance layers',
    'preserve negative findings',
    'state explicitly what the experiment does not prove',
  ],
  summary: [
    {
      id: 'ilk-experiment',
      label: 'Controlled experiment',
      detail: 'HAC-330 · 24/24 acceptance checks',
      href: `${HAC330}/README.md`,
      verified: true,
      cta: 'INSPECT EXPERIMENT',
    },
    {
      id: 'ilk-packet',
      label: 'Frozen evidence packet',
      detail: 'three arms, decisions, invariant reports',
      href: `${HAC330}/evidence/arms.json`,
      verified: true,
      cta: 'INSPECT PACKET',
    },
    {
      id: 'ilk-verifier',
      label: 'Independent verifier',
      detail: 'pnpm check:packet',
      detailIsCode: true,
      href: `${HAC330}/bin/verify-packet.mjs`,
      verified: true,
      cta: 'INSPECT VERIFIER',
    },
    {
      id: 'ilk-cloud',
      // A *separate* run from the counterfactual above, and labelled as such. HAC-340
      // did not reproduce the 140/120 comparison in Google Cloud.
      label: 'Cloud traversal · separate run',
      detail: 'HAC-340, published for inspection as HAC-342',
      href: `${HAC342}/README.md`,
      verified: true,
      cta: 'INSPECT CLOUD EVIDENCE',
    },
  ],
  evidence: [
    {
      id: 'ilk-ev-experiment',
      kind: 'experiment',
      title: 'HAC-330 controlled counterfactual',
      description:
        'Three arms over one decision function: uncoordinated, treated with real mined evidence, and a perturbed-evidence control. Identical final tree and identical code across arms, so the difference is attributable to the evidence.',
      href: `${HAC330}/README.md`,
      verified: true,
    },
    {
      id: 'ilk-ev-packet',
      kind: 'observed',
      title: 'Frozen evidence packet',
      description:
        'Committed run artifacts, digest-bound and byte-reproducible, so the comparison can be re-checked after the fact without rerunning it.',
      href: `${HAC330}/evidence/arms.json`,
      verified: true,
    },
    {
      id: 'ilk-ev-verifier',
      kind: 'observed',
      title: 'Independent verifier',
      description:
        'Re-checks the committed packet without the pinned sibling checkout, so the checking path does not share the decision path.',
      href: `${HAC330}/bin/verify-packet.mjs`,
      verified: true,
    },
    {
      id: 'ilk-ev-cloud',
      kind: 'deployed',
      title: 'Google Cloud participation (HAC-340), published as HAC-342',
      description:
        'One recorded Gemini + Google ADK + Cloud Run traversal through the Interlock MCP proxy, with a receipt-bound mutation read back by a separately authenticated principal. A separate run: it does not reproduce the counterfactual above, and Agent Runtime and Agent Gateway did not participate.',
      href: `${HAC342}/README.md`,
      verified: true,
    },
  ],
  boundary:
    'A bounded experiment under stated conditions: one constraint, one environment, one pair of intents, on synthetic commit histories. It is not a universal safety proof. Co-change evidence is a detector with false negatives — the packet’s own control arm shows a real coupling going undetected because history never exercised it — and behaviour at repository scale is explicitly not measured. ALLOW is not VERIFIED; OBSERVED is not SAFE.',
};

/** Why this experiment belongs in a résumé at all. */
export const INTERLOCK_RELEVANCE =
  'Interlock demonstrates how I approach systems where an AI/agent component is only one part of the engineering problem:';
