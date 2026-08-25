import type { InterlockCounterfactualData } from '@/lib/interactions';

/**
 * HAC-330 — the frozen controlled counterfactual behind the Interlock interaction.
 *
 * Every number is read from the committed packet, not from the design draft. The draft
 * happened to carry `140 > 130`, `WITHHOLD_SERIALIZE` and `120 <= 130`, and those three
 * do match the frozen evidence — but they are used here because `evidence/arms.json`
 * says so, and they would have been replaced if it had said otherwise.
 *
 * Source:
 *   Marcelle-Labs/interlock @ 4239474a
 *   experiments/hac-330/evidence/{arms,results,fixtures,pins}.json
 *
 * Deliberately *not* merged with its neighbours. HAC-330 is the controlled local
 * causal experiment; HAC-340 is a separate recorded Google Cloud traversal; HAC-343 is
 * a broader bounded operational comparison. The repository states plainly that HAC-330
 * did not run on Google Cloud and that HAC-340 does not reproduce this counterfactual,
 * so presenting them as one result would misrepresent all three.
 *
 * Note on language: no model participates in HAC-330 at all. The decision function is
 * pure and deterministic. So the controlled variable is the mined evidence — never
 * "same prompt" or "same model", which would be borrowed from a different experiment.
 */

const REPO = 'https://github.com/Marcelle-Labs/interlock';
const REV = '4239474ace02ccb1492cc67cd768e2c4ef43c9db';
const HAC330 = `${REPO}/blob/${REV}/experiments/hac-330`;

const BASELINE_BASIS = 'eb67a6f56b3bf7e71846e7324d21af44565c0b70';
const PERTURBED_BASIS = 'db8a63ec9405191bdd40d0ed0fc69684fca5d17b';

/** Base reservations before either intent is applied: 40 + 40 + 20 = 100 against a bound of 130. */
const BASE = [
  { id: 'alpha', label: 'alpha', value: 40 },
  { id: 'beta', label: 'beta', value: 40 },
  { id: 'gamma', label: 'gamma', value: 20 },
] as const;

/** Base plus both claims still pending: the projected 140 that neither arm has committed yet. */
const BASE_WITH_PENDING = [
  ...BASE,
  { id: 'intent-a', label: 'A claims +20', value: 20, pending: true },
  { id: 'intent-b', label: 'B claims +20', value: 20, pending: true },
] as const;

/** The uncoordinated end state: both intents applied. */
const APPLIED_BOTH = [
  { id: 'alpha', label: 'alpha', value: 60 },
  { id: 'beta', label: 'beta', value: 60 },
  { id: 'gamma', label: 'gamma', value: 20 },
] as const;

/** The treated end state: A admitted, B rejected on revalidation. */
const APPLIED_A_ONLY = [
  { id: 'alpha', label: 'alpha', value: 60 },
  { id: 'beta', label: 'beta', value: 40 },
  { id: 'gamma', label: 'gamma', value: 20 },
] as const;

export const interlockHac330: InterlockCounterfactualData = {
  experiment: 'HAC-330',
  question:
    'Does revision-bound repository evidence change a coordination decision before shared state is mutated?',

  controls: {
    varied:
      'The mined co-change evidence, and only that. Two synthetic histories land on a byte-identical tree, so the difference cannot be the target state.',
    heldFixed: [
      'Decision function — one pure implementation, unchanged between arms',
      'Intents — A raises alpha 40→60, B raises beta 40→60, in both arms',
      'Broker and apply path — one protected mutation broker',
      'Final tree — fc015c39… in both histories',
      'Commit count — 17 in both histories',
      'Control pair — docs/runbook.md ↔ tests/smoke.test.mjs, support 6 in both',
    ],
  },

  bound: 130,
  invariant: 'sum(services[].reserved) <= budget.totalReservable',
  scaleMax: 160,

  armLabels: {
    uncoordinated: 'Without coordination',
    interlocked: 'With Interlock',
  },

  stages: [
    {
      id: 'resting',
      label: 'Shared state',
      caption:
        'Three services hold reservations against one pool. Total 100, bound 130, headroom 30.',
      frames: {
        uncoordinated: {
          segments: BASE,
          total: 100,
          note: 'Starting reservations, before either agent acts.',
        },
        interlocked: {
          segments: BASE,
          total: 100,
          note: 'Identical starting reservations. The arms differ only in what happens next.',
        },
      },
    },
    {
      id: 'intent',
      label: 'Two intents',
      caption:
        'Each agent claims +20 against 30 of headroom. Either fits on its own; both do not.',
      frames: {
        uncoordinated: {
          segments: BASE_WITH_PENDING,
          total: 140,
          note: 'capacity-planner claims alpha 40→60. traffic-shaper claims beta 40→60. Each precondition is true when it is checked.',
        },
        interlocked: {
          segments: BASE_WITH_PENDING,
          total: 140,
          note: 'The same two claims arrive, and neither has been written to shared state yet.',
        },
      },
    },
    {
      id: 'decision',
      label: 'Decision point',
      caption:
        'This is the only place the arms differ: one arm takes a coordination decision before any write lands.',
      frames: {
        uncoordinated: {
          segments: BASE_WITH_PENDING,
          total: 140,
          note: 'No decision point exists. Both intents proceed because each was individually valid at the moment it was checked.',
        },
        interlocked: {
          segments: BASE_WITH_PENDING,
          total: 140,
          decision: 'WITHHOLD_SERIALIZE',
          decisionReason: 'COUPLING_OBSERVED',
          note: `Evidence cites services/alpha ↔ services/beta, support 8 across 10 occurrences, at basis ${BASELINE_BASIS.slice(0, 8)}…. The composition is withheld and the intents are serialized with revalidation.`,
        },
      },
    },
    {
      id: 'outcome',
      label: 'Resulting state',
      caption:
        'The invariant is checked by a separate process. The verdict is an exit code.',
      frames: {
        uncoordinated: {
          segments: APPLIED_BOTH,
          total: 140,
          holds: false,
          verdict: 'INVALID JOINT STATE',
          note: 'Both applied. Each precondition was true when checked and false by the time the last write landed. verify.mjs exits 1.',
        },
        interlocked: {
          segments: APPLIED_A_ONLY,
          total: 120,
          holds: true,
          verdict: 'CONSTRAINT HELD',
          decision: 'WITHHOLD_SERIALIZE',
          decisionReason: 'COUPLING_OBSERVED',
          note: 'A admitted after revalidation. B rejected, because revalidating against the post-admission state breaches the invariant. verify.mjs exits 0.',
        },
      },
    },
    {
      id: 'evidence',
      label: 'Frozen evidence',
      caption:
        'The packet is committed, digest-bound, and re-checkable without the sibling checkout.',
      frames: {
        uncoordinated: {
          segments: APPLIED_BOTH,
          total: 140,
          holds: false,
          verdict: 'INVALID JOINT STATE',
          note: 'Recorded as the incident the mechanism exists to prevent, not as a failure to be dressed up.',
        },
        interlocked: {
          segments: APPLIED_A_ONLY,
          total: 120,
          holds: true,
          verdict: 'CONSTRAINT HELD',
          note: '24 of 24 acceptance checks pass, evaluated mechanically by the experiment runner.',
        },
      },
    },
  ],

  evidenceConditions: {
    baseline: {
      present: true,
      summary:
        'History at the pinned basis was mined and shows a qualifying coupling between the two files the intents touch.',
      files: ['services/alpha/reservation.json', 'services/beta/reservation.json'],
      support: 8,
      occurrences: 10,
      basisRevision: BASELINE_BASIS,
      digest: 'sha256 2c021d0c…b894eb21d6',
    },
    perturbed: {
      present: false,
      summary:
        'An alternate synthetic history in which alpha and beta are never edited in the same commit. Same tree, same commit count, same control pair — the coupling simply never appears.',
      basisRevision: PERTURBED_BASIS,
      digest: 'sha256 ec9bd673…4bdc48120d08d5',
    },
  },

  /*
   * The perturbed control arm. Same decision function, same intents, same policy,
   * identical tree — and the opposite decision, because the evidence changed. Only the
   * interlocked arm is affected; the uncoordinated arm has no decision point to flip.
   */
  perturbedStages: [
    {
      id: 'decision',
      label: 'Decision point',
      caption: 'Same code, same intents, evidence mined from the alternate history.',
      frames: {
        uncoordinated: {
          segments: BASE_WITH_PENDING,
          total: 140,
          note: 'Unchanged. This arm never had a decision point to flip.',
        },
        interlocked: {
          segments: BASE_WITH_PENDING,
          total: 140,
          decision: 'ALLOW_PARALLEL',
          decisionReason: 'NO_QUALIFYING_COUPLING',
          note: `History at basis ${PERTURBED_BASIS.slice(0, 8)}… was mined and shows no pair between the pending intents at support >= 3. Three pairs were considered.`,
        },
      },
    },
    {
      id: 'outcome',
      label: 'Resulting state',
      caption: 'The composition proceeds, and the joint state goes over the bound.',
      frames: {
        uncoordinated: {
          segments: APPLIED_BOTH,
          total: 140,
          holds: false,
          verdict: 'INVALID JOINT STATE',
          note: 'Unchanged from the untreated arm.',
        },
        interlocked: {
          segments: APPLIED_BOTH,
          total: 140,
          holds: false,
          verdict: 'INVALID JOINT STATE',
          note: 'The mechanism ran and permitted the composition. In this world alpha and beta are still coupled — the history simply never showed it.',
        },
      },
    },
    {
      id: 'evidence',
      label: 'Frozen evidence',
      caption:
        'The control arm is part of the packet, recorded as a finding rather than hidden.',
      frames: {
        uncoordinated: {
          segments: APPLIED_BOTH,
          total: 140,
          holds: false,
          verdict: 'INVALID JOINT STATE',
          note: 'Recorded alongside the treated arm.',
        },
        interlocked: {
          segments: APPLIED_BOTH,
          total: 140,
          holds: false,
          verdict: 'INVALID JOINT STATE',
          note: 'This is the packet’s own negative finding: co-change evidence is a detector with false negatives, not a proof of independence.',
        },
      },
    },
  ],

  boundary:
    'One constraint, one environment, one pair of intents, on synthetic commit histories. It shows that this evidence changed this decision; it does not establish behaviour at repository scale, a false-positive rate for withholding, or safety outside the stated conditions. A coupling that has never been exercised in commit history is invisible to this mechanism.',

  distinctions: [
    'ALLOW is not VERIFIED',
    'OBSERVED is not SAFE',
    'WITHHOLD_SERIALIZE is not human approval',
    'A bounded experiment is not production readiness',
  ],

  artifact: {
    id: 'ilk-artifact',
    kind: 'experiment',
    title: 'HAC-330 frozen evidence packet',
    description:
      'The three arms, their decisions, their resulting states, and the invariant report for each.',
    href: `${HAC330}/evidence/arms.json`,
    verified: true,
  },

  verification: {
    method:
      'Re-verify the committed packet against itself; no sibling checkout required. The full gate additionally re-mines both histories.',
    command: 'pnpm check:packet',
  },
};

/** The decision function itself — the code whose behaviour the arms compare. */
export const INTERLOCK_DECISION_SOURCE = {
  id: 'ilk-decide',
  kind: 'source' as const,
  title: 'Interlock decision function',
  description:
    'Pure and deterministic. Every early return is INSUFFICIENT_EVIDENCE; ALLOW_PARALLEL is reachable only after all six guards pass.',
  href: `${HAC330}/lib/decide.mjs`,
  verified: true,
};

/** The independent verifier, kept on a separate path from execution. */
export const INTERLOCK_VERIFIER = {
  id: 'ilk-verify',
  kind: 'observed' as const,
  title: 'Packet verifier',
  description:
    'Re-checks the committed packet without the pinned sibling checkout, so verification does not share the decision path.',
  href: `${HAC330}/bin/verify-packet.mjs`,
  verified: true,
};

/** The full acceptance record: 24 checks, evaluated mechanically. */
export const INTERLOCK_RESULTS = {
  id: 'ilk-results',
  kind: 'experiment' as const,
  title: 'HAC-330 acceptance record',
  description: '24 of 24 checks, plus 11 degraded-evidence guards, with their outcomes.',
  href: `${HAC330}/evidence/results.json`,
  verified: true,
};

/**
 * The broader bounded comparison. A *sibling* of HAC-330, never a merge with it:
 * sixteen scenarios across four coordination strategies, exhaustively enumerated.
 */
export const INTERLOCK_BROADER_EVALUATION = {
  id: 'ilk-hac343',
  kind: 'experiment' as const,
  title: 'HAC-343 bounded operational comparison',
  description:
    'Sixteen scenarios run through four coordination strategies. Interlock missed 0 of 2 cross-target hazards and parallelised 2 of 2 independent opportunities; per-target locking, which is correct for the hazard it addresses, missed 2 of 2.',
  href: `${REPO}/blob/${REV}/experiments/hac-343/evidence/judge-export.json`,
  verified: true,
};
