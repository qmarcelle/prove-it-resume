import type { Proof } from '@/lib/types';

/**
 * Interlock publishes its evidence pinned to a commit rather than a branch, so the
 * packet a reader opens is the packet the claim was made against. Those URLs are
 * reproduced here at the same pin; a branch link would silently drift.
 *
 * **The rows for the controlled experiment point at HAC-330's own artifacts.** They
 * briefly pointed at HAC-342 — the public republication of the *cloud* run — which
 * meant a row labelled "frozen evidence packet", sitting directly under "controlled
 * experiment", opened a different experiment's packet. The repository is explicit that
 * HAC-330, HAC-340 and HAC-343 are three separate results and are never combined, so a
 * row that quietly merges two of them is exactly the failure the evidence rule exists
 * to prevent. The cloud row keeps the cloud artifacts and says it is a separate run.
 *
 * The counterfactual figures themselves are read from the packet, in
 * `src/content/experiments/interlock-hac330.ts`.
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
      detail: 'HAC-330 · 24/24 acceptance checks',
      href: `${ILK_REPO}/blob/${ILK_PIN}/experiments/hac-330/README.md`,
      verified: true,
      cta: 'INSPECT EXPERIMENT',
    },
    {
      id: 'ilk-packet',
      label: 'Frozen evidence packet',
      detail: 'three arms, decisions, invariant reports',
      href: `${ILK_REPO}/blob/${ILK_PIN}/experiments/hac-330/evidence/arms.json`,
      verified: true,
      cta: 'INSPECT PACKET',
    },
    {
      id: 'ilk-verifier',
      label: 'Independent verifier',
      detail: 'pnpm check:packet',
      detailIsCode: true,
      href: `${ILK_REPO}/blob/${ILK_PIN}/experiments/hac-330/bin/verify-packet.mjs`,
      verified: true,
      cta: 'INSPECT VERIFIER',
    },
    {
      id: 'ilk-cloud',
      // A separate recorded run, labelled as one. HAC-340 does not reproduce the
      // counterfactual above, and the repository is explicit that the two are never
      // combined — so this row must not borrow the controlled experiment's artifacts.
      label: 'Cloud traversal · separate run',
      detail: 'Google ADK + Vertex AI + Cloud Run + MCP proxy',
      detailIsCode: true,
      href: `${ILK_REPO}/blob/${ILK_PIN}/experiments/hac-342/evidence/cloud-run.public.json`,
      verified: true,
      cta: 'INSPECT CLOUD PACKET',
    },
  ],
  evidence: [
    {
      id: 'ilk-ev-experiment',
      kind: 'experiment',
      title: 'Controlled counterfactual comparison',
      description:
        'Paired arms with and without evidence-bound coordination before shared-state mutation. Re-runnable: pnpm hac330.',
      href: `${ILK_REPO}/blob/${ILK_PIN}/experiments/hac-330/README.md`,
      verified: true,
    },
    {
      id: 'ilk-ev-packet',
      kind: 'observed',
      title: 'Frozen evidence packet',
      description:
        'Recorded run artifacts held fixed so the comparison can be re-checked after the fact. Published at a pinned commit, not a branch, and the packet digest is recomputable with shasum.',
      href: `${ILK_REPO}/blob/${ILK_PIN}/experiments/hac-330/evidence/arms.json`,
      verified: true,
    },
    {
      id: 'ilk-ev-verifier',
      kind: 'observed',
      title: 'Independent verifier',
      description:
        'Verification separated from execution so the checking path does not share the decision path.',
      href: `${ILK_REPO}/blob/${ILK_PIN}/experiments/hac-330/bin/verify-packet.mjs`,
      verified: true,
    },
    {
      id: 'ilk-ev-cloud',
      kind: 'deployed',
      title: 'Google Cloud participation (HAC-340) — a separate run',
      description:
        'One recorded traversal through an authenticated decision/execution boundary, with the mutation and an independently authenticated read-back kept as separate facts. Published for logged-out inspection as HAC-342, with its own verifier. It does not reproduce the counterfactual above.',
      href: `${ILK_REPO}/blob/${ILK_PIN}/experiments/hac-342/bin/verify-public-packet.mjs`,
      verified: true,
    },
  ],
  boundary:
    'A bounded experiment under stated conditions. The controlled counterfactual ran locally; the Google Cloud traversal is a separate recorded run, and neither is evidence for the other. It is not a universal safety proof, and it does not establish behavior outside the constraint and environment described in the evidence packet. The repository states the full not-claimed list in DISCLOSURE.md.',
};

/** Why this experiment belongs in a résumé at all. */
export const INTERLOCK_RELEVANCE =
  'Interlock demonstrates how I approach systems where an AI/agent component is only one part of the engineering problem:';
