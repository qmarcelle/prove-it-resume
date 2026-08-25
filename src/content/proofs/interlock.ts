import type { Proof } from '@/lib/types';

/**
 * Counterfactual arms for the Interlock section.
 *
 * These values come from the design export (`140 > 130`, `WITHHOLD_SERIALIZE`,
 * `120 ≤ 130`). They match the published HAC-330 counterfactual, which is now linked
 * from the evidence rows below, but this component still renders from these local
 * constants rather than reading the packet, so it continues to label them as
 * prototype values. The packet itself is the artifact of record.
 */
export type CounterfactualArm = {
  id: 'without' | 'with';
  heading: string;
  lines: string[];
  /** The bounded-constraint comparison, shown at display size. */
  figure: string;
  /** The coordination decision, when there is one. */
  decision?: string;
  outcome: string;
  satisfied: boolean;
};

export const interlockArms: readonly CounterfactualArm[] = [
  {
    id: 'without',
    heading: 'WITHOUT COORDINATION',
    lines: ['Two locally valid intents', 'Joint state exceeds bounded constraint'],
    figure: '140 > 130',
    outcome: 'INVALID JOINT OUTCOME',
    satisfied: false,
  },
  {
    id: 'with',
    heading: 'WITH INTERLOCK',
    lines: ['Evidence-bound decision', 'Observed bounded result'],
    decision: 'WITHHOLD_SERIALIZE',
    figure: '120 ≤ 130',
    outcome: 'CONSTRAINT SATISFIED',
    satisfied: true,
  },
] as const;

/**
 * Interlock publishes its cloud evidence pinned to a commit rather than a branch, so
 * the packet a reader opens is the packet the claim was made against. Those URLs are
 * reproduced here at the same pin; a branch link would silently drift.
 */
const ILK_REPO = 'https://github.com/Marcelle-Labs/interlock';
const ILK_PIN = '75253e38791e69f7e2a4bb3a041044a9114c32f0';

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
      href: `${ILK_REPO}/tree/main/experiments/hac-330`,
      verified: true,
      cta: 'INSPECT',
    },
    {
      id: 'ilk-packet',
      label: 'Frozen evidence packet',
      href: `${ILK_REPO}/blob/${ILK_PIN}/experiments/hac-342/evidence/cloud-run.public.json`,
      verified: true,
      cta: 'INSPECT',
    },
    {
      id: 'ilk-verifier',
      label: 'Independent verifier',
      href: `${ILK_REPO}/blob/${ILK_PIN}/experiments/hac-342/bin/verify-public-packet.mjs`,
      verified: true,
      cta: 'INSPECT',
    },
    {
      id: 'ilk-cloud',
      label: 'Cloud traversal',
      detail: 'Google ADK + Vertex AI + Cloud Run + MCP proxy',
      detailIsCode: true,
      href: `${ILK_REPO}#google-cloud-participation`,
      verified: true,
      cta: 'INSPECT',
    },
  ],
  evidence: [
    {
      id: 'ilk-ev-experiment',
      kind: 'experiment',
      title: 'Controlled counterfactual comparison',
      description:
        'Paired arms with and without evidence-bound coordination before shared-state mutation. Re-runnable: pnpm hac330.',
      href: `${ILK_REPO}/tree/main/experiments/hac-330`,
      verified: true,
    },
    {
      id: 'ilk-ev-packet',
      kind: 'observed',
      title: 'Frozen evidence packet',
      description:
        'Recorded run artifacts held fixed so the comparison can be re-checked after the fact. Published at a pinned commit, not a branch, and the packet digest is recomputable with shasum.',
      href: `${ILK_REPO}/blob/${ILK_PIN}/experiments/hac-342/evidence/cloud-run.public.json`,
      verified: true,
    },
    {
      id: 'ilk-ev-verifier',
      kind: 'observed',
      title: 'Independent verifier',
      description:
        'Verification separated from execution so the checking path does not share the decision path.',
      href: `${ILK_REPO}/blob/${ILK_PIN}/experiments/hac-342/bin/verify-public-packet.mjs`,
      verified: true,
    },
    {
      id: 'ilk-ev-cloud',
      kind: 'deployed',
      title: 'Google ADK + Vertex AI + Cloud Run + MCP proxy',
      description:
        'One recorded traversal through an authenticated decision/execution boundary, with the mutation and an independently authenticated read-back kept as separate facts.',
      href: `${ILK_REPO}#google-cloud-participation`,
      verified: true,
    },
  ],
  boundary:
    'A bounded experiment under stated conditions. The controlled counterfactual ran locally; the Google Cloud traversal is a separate recorded run, and neither is evidence for the other. It is not a universal safety proof, and it does not establish behavior outside the constraint and environment described in the evidence packet. The repository states the full not-claimed list in DISCLOSURE.md.',
};

/** Why this experiment belongs in a résumé at all. */
export const INTERLOCK_RELEVANCE =
  'Interlock demonstrates how I approach systems where an AI/agent component is only one part of the engineering problem:';
