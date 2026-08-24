import type { Proof } from '@/lib/types';

/**
 * Counterfactual arms for the Interlock section.
 *
 * These values come from the design export (`140 > 130`, `WITHHOLD_SERIALIZE`,
 * `120 ≤ 130`). They are carried over rather than invented, but they are *not* bound to
 * a published evidence packet, so the component labels them as prototype values. When
 * the packet is published, set `verified: true` on the evidence rows below and the
 * label changes with it.
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
      verified: false,
      cta: 'INSPECT',
    },
    {
      id: 'ilk-packet',
      label: 'Frozen evidence packet',
      verified: false,
      cta: 'INSPECT',
    },
    {
      id: 'ilk-verifier',
      label: 'Independent verifier',
      verified: false,
      cta: 'INSPECT',
    },
    {
      id: 'ilk-cloud',
      label: 'Cloud traversal',
      detail: 'Google ADK + Vertex AI + Cloud Run + MCP proxy',
      detailIsCode: true,
      verified: false,
      cta: 'INSPECT',
    },
  ],
  evidence: [
    {
      id: 'ilk-ev-experiment',
      kind: 'experiment',
      title: 'Controlled counterfactual comparison',
      description:
        'Paired arms with and without evidence-bound coordination before shared-state mutation.',
      verified: false,
    },
    {
      id: 'ilk-ev-packet',
      kind: 'observed',
      title: 'Frozen evidence packet',
      description:
        'Recorded run artifacts held fixed so the comparison can be re-checked after the fact.',
      verified: false,
    },
    {
      id: 'ilk-ev-verifier',
      kind: 'observed',
      title: 'Independent verifier',
      description:
        'Verification separated from execution so the checking path does not share the decision path.',
      verified: false,
    },
    {
      id: 'ilk-ev-cloud',
      kind: 'deployed',
      title: 'Google ADK + Vertex AI + Cloud Run + MCP proxy',
      description:
        'Cloud traversal exercised through an authenticated decision/execution boundary.',
      verified: false,
    },
  ],
  boundary:
    'A bounded experiment under stated conditions. It is not a universal safety proof, and it does not establish behavior outside the constraint and environment described in the evidence packet.',
};

/** Why this experiment belongs in a résumé at all. */
export const INTERLOCK_RELEVANCE =
  'Interlock demonstrates how I approach systems where an AI/agent component is only one part of the engineering problem:';
