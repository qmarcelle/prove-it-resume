/**
 * Types for the three progressive-disclosure interactions.
 *
 * The organising constraint here is the same one that governs the rest of the content
 * model: **the data model follows the evidence.** These shapes were written after the
 * frozen experiments were read, not before, and deliberately carry no vocabulary from
 * the design storyboard's illustrative examples.
 *
 * The storyboard's Repository Decision Diff frame showed two evidence cards labelled
 * `EV-1 · CO-CHANGE` and `EV-2 · FRAGILITY`. The experiment this interaction is
 * actually bound to contains *neither*: its evidence is an exact source-path
 * resolution, and its own artifact records that no co-change evidence was available
 * (`partners: indeterminate, observedCount: 0`). Had `DecisionEvidence` been typed
 * around co-change and fragility, the real result would not have fitted the model that
 * exists to display it. `kind` is therefore a free string carried from the source
 * artifact rather than a union invented in advance.
 */

import type { EvidenceRef } from './types';

/* ------------------------------------------------------------------ *
 * Shared
 * ------------------------------------------------------------------ */

/**
 * Where a value came from and how a reader can re-derive it.
 *
 * Separate from `EvidenceRef` because that type answers "may this row render a link?",
 * while this one answers "which artifact, at which revision, produced this number?".
 * An interaction can be fully provenance-bound and still have an unresolved CTA.
 */
export type Provenance = {
  /** The artifact or system that produced the observation. */
  source: string;
  /** Immutable revision the artifact was read at, where one exists. */
  revision?: string;
  /** Producer package/tool, where the artifact names one. */
  producer?: string;
};

/** How a reader re-checks a claim for themselves. */
export type Verification = {
  /** Prose description of the check. */
  method: string;
  /** Exact command, run from the artifact's directory. */
  command?: string;
};

/* ------------------------------------------------------------------ *
 * Interaction 1 — Repository Decision Diff
 * ------------------------------------------------------------------ */

/**
 * One piece of evidence that was available at decision time.
 *
 * `kind` is an open string on purpose — see the module comment. `observation` is what
 * the artifact recorded, quoted rather than paraphrased wherever practical.
 */
export type DecisionEvidence = {
  id: string;
  /** Short human label, e.g. "Exact producing source". */
  label: string;
  /** The evidence category *as the source artifact names it*. Not a fixed union. */
  kind: string;
  /** What was actually observed. */
  observation: string;
  provenance: Provenance;
  verification?: Verification;
  /** What this evidence does not establish. */
  boundary?: string;
};

/** How one plan step relates to the baseline plan. */
export type PlanStepChange = 'unchanged' | 'added' | 'removed' | 'constrained';

/**
 * One row of the unified plan diff.
 *
 * Rows are a single ordered list rather than two plans the reader must reconcile: the
 * comparison is the content, so it gets one vertical axis.
 */
export type PlanDiffRow = {
  id: string;
  change: PlanStepChange;
  /** The step text, as recorded in the source plan. */
  text: string;
  /** Which evidence ids account for this row. Empty for unchanged rows. */
  attributedTo: readonly string[];
  /** Why the evidence produced this change, from the artifact's own delta record. */
  reason?: string;
};

/**
 * The controlled variable and what was held fixed.
 *
 * Rendered verbatim so the interaction cannot imply more control than the experiment
 * established. Whether "same model" is even a meaningful statement depends entirely on
 * whether a model participated, which differs between the two experiments on this page.
 */
export type ExperimentControls = {
  /** What differed between the two conditions. Exactly one thing, stated plainly. */
  varied: string;
  /** What was held fixed, each item as the artifact records it. */
  heldFixed: readonly string[];
};

export type RepositoryDecisionDiffData = {
  /** Internal experiment identifier, e.g. "HAC-152". Shown as provenance, not as a control. */
  experiment: string;
  /** One-line statement of the question the run answers. */
  question: string;
  controls: ExperimentControls;
  /** Label for the condition without repository evidence. */
  baselineLabel: string;
  /** Label for the condition with repository evidence. */
  informedLabel: string;
  /** The plan produced without repository evidence. */
  baselineSteps: readonly string[];
  /** The plan produced once repository evidence was available. */
  informedSteps: readonly string[];
  /**
   * The unified diff, taken from the source artifact's own delta records rather than
   * derived here. Deriving a diff would mean this component deciding what changed; the
   * experiment already recorded that, with its own attribution.
   */
  diff: readonly PlanDiffRow[];
  evidence: readonly DecisionEvidence[];
  /** What the run does not establish. Always rendered. */
  boundary: string;
  /** The exact inspectable run. */
  artifact: EvidenceRef;
  /** Digest of the artifact bytes, where the source publishes one. */
  artifactDigest?: string;
  verification?: Verification;
};

/* ------------------------------------------------------------------ *
 * Interaction 2 — Interlock counterfactual
 * ------------------------------------------------------------------ */

/** A named quantity contributing to the joint shared state. */
export type StateSegment = {
  id: string;
  label: string;
  value: number;
  /** True for a claim that has not yet been applied to shared state. */
  pending?: boolean;
};

/** One arm of the counterfactual at one point on the shared clock. */
export type ArmFrame = {
  segments: readonly StateSegment[];
  /** Joint total across `segments`. Stated rather than derived so it matches the artifact. */
  total: number;
  /** The coordination decision, once one has been taken. */
  decision?: string;
  /** The artifact's reason code for that decision. */
  decisionReason?: string;
  /** One-line description of what the arm is doing at this stage. */
  note: string;
  /** Verdict against the bound, once the state is resolved. Undefined while pending. */
  holds?: boolean;
  /** Verdict label, e.g. "INVALID JOINT STATE". */
  verdict?: string;
};

export type InterlockArmId = 'uncoordinated' | 'interlocked';

export type InterlockStageId = 'resting' | 'intent' | 'decision' | 'outcome' | 'evidence';

export type InterlockStage = {
  id: InterlockStageId;
  /** The production control label. Stage ids are never rendered. */
  label: string;
  /** Short line describing what this stage establishes. */
  caption: string;
  frames: Record<InterlockArmId, ArmFrame>;
};

/** The evidence whose presence or absence flips the coordination decision. */
export type CouplingEvidence = {
  present: boolean;
  /** Human summary of what the mined history did or did not show. */
  summary: string;
  /** The files the coupling relates, when there is one. */
  files?: readonly string[];
  support?: number;
  occurrences?: number;
  /** The revision the history was mined at. */
  basisRevision: string;
  /** Digest of the evidence artifact bytes. */
  digest: string;
};

export type InterlockCounterfactualData = {
  experiment: string;
  question: string;
  controls: ExperimentControls;
  /** The bounded constraint, e.g. 130. */
  bound: number;
  /** Human statement of the invariant. */
  invariant: string;
  /** Upper limit of the shared axis. Both arms are drawn against this one scale. */
  scaleMax: number;
  armLabels: Record<InterlockArmId, string>;
  stages: readonly InterlockStage[];
  /** Stages under the unperturbed evidence and under the perturbed control. */
  evidenceConditions: {
    baseline: CouplingEvidence;
    perturbed: CouplingEvidence;
  };
  /** Stage overrides applied to the interlocked arm when evidence is perturbed. */
  perturbedStages: readonly InterlockStage[];
  boundary: string;
  /** Distinctions the experiment insists on, e.g. "ALLOW is not VERIFIED". */
  distinctions: readonly string[];
  artifact: EvidenceRef;
  verification?: Verification;
};

/* ------------------------------------------------------------------ *
 * Interaction 3 — Vreko architecture trace
 * ------------------------------------------------------------------ */

/** Whether an evaluator can read the implementation of a node. */
export type PublicationState =
  /** Source or published package is inspectable. */
  | 'public'
  /** Declared in a public manifest, but the implementation is not published. */
  | 'declared-not-published'
  /** Outside the system; owned by someone else. */
  | 'external';

/** A component inside a container. */
export type ArchitectureComponent = {
  id: string;
  name: string;
  /** Responsibility, as the public material states it. */
  responsibility: string;
  publication: PublicationState;
  /** Package or path this component corresponds to, where one is public. */
  identifier?: string;
};

export type ArchitectureContainer = {
  id: string;
  name: string;
  /** Package identity, e.g. "vreko-mcp-server@3.1.1". */
  identifier?: string;
  summary: string;
  publication: PublicationState;
  components: readonly ArchitectureComponent[];
  /** Evidence for this container's existence and shape. */
  provenance: Provenance;
};

/** One boundary crossing in the request trace. */
export type TraceHop = {
  id: string;
  /** Production label, e.g. "Assistant to HTTP edge". */
  label: string;
  /** The container the request is in after this hop. */
  atContainerId: string | null;
  /** The boundary that was crossed. */
  boundary: string;
  /** What the request carries across it. */
  carries: string;
  /** What is deliberately not carried across. */
  withheld?: string;
};

export type VrekoArchitectureData = {
  question: string;
  /** The three top-level boxes at the resting level. */
  external: { upstream: ArchitectureContainer; downstream: ArchitectureContainer };
  system: ArchitectureContainer;
  /** Containers revealed when the system box is expanded. */
  containers: readonly ArchitectureContainer[];
  trace: readonly TraceHop[];
  /** Publicly published packages, with versions, that establish the boundary. */
  publicPackages: readonly {
    name: string;
    version: string;
    registry: string;
    href: string;
  }[];
  /** Packages a public manifest declares but which resolve to nothing public. */
  privatePackages: readonly string[];
  /** How a reader re-derives the public/private split themselves. */
  boundaryVerification: Verification;
  /** Places where public documentation and public package state disagree. */
  discrepancies: readonly { id: string; summary: string; detail: string }[];
  boundary: string;
  sources: readonly EvidenceRef[];
};
