/**
 * Content model for Prove It Resume.
 *
 * The organising idea: durable proof is *data*, and a role lens is a *projection* over
 * that data. A lens may reorder or reframe evidence; it may never change what the
 * evidence says. Keeping the two in separate types is what makes that guarantee
 * checkable rather than merely intended.
 */

/**
 * The evidence vocabulary used by the design export's drawer rows. `boundary` is
 * deliberately part of the same union: what a piece of evidence fails to establish is
 * evidence about the claim, and typing it separately would let it drift out of view.
 */
export type EvidenceKind =
  | 'source'
  | 'specification'
  | 'experiment'
  | 'observed'
  | 'deployed'
  | 'research'
  | 'boundary';

export type EvidenceRef = {
  id: string;
  kind: EvidenceKind;
  title: string;
  description?: string;
  /**
   * The exact inspectable artifact. Absent when no such URL has been supplied.
   *
   * A link to a general profile page is not an artifact, and neither is a link back to
   * the section the reader is already in. Both count as absent here.
   */
  href?: string;
  /**
   * Whether the destination has been confirmed to be the artifact this row names.
   * `verified: false` suppresses the call to action entirely — see `resolveEvidence`.
   */
  verified: boolean;
};

/** A row in a proof's "VERIFY THIS" panel: the shorter, scannable evidence list. */
export type EvidenceSummaryRow = {
  id: string;
  label: string;
  /** Optional second line — a path, an architecture sketch, a tool chain. */
  detail?: string;
  /** Renders `detail` in the mono face, for code-shaped values. */
  detailIsCode?: boolean;
  href?: string;
  verified: boolean;
  /** Text of the call to action when resolved, e.g. "READ CASE". */
  cta?: string;
};

export type ProofStatusTone = 'shipped' | 'implemented' | 'controlled';

export type ProofStatus = {
  label: string;
  tone: ProofStatusTone;
};

export type ProofListing = {
  /** Second line in the Evidence Index. */
  summary: string;
  summaryIsCode?: boolean;
  /** Name in the career list, when it differs from `title`. */
  shortName?: string;
  shortNameIsCode?: boolean;
  /** Status in the career list, when it differs from `status.label`. */
  shortStatus?: string;
};

/** A labelled block of prose in a proof's left column. */
export type ProofField = {
  label: string;
  body: string;
};

export type Proof = {
  id: string;
  /** DOM id and scroll target, e.g. `sec-02`. Matches the design export. */
  sectionId: string;
  /** Two-digit stage number as shown in the rail and eyebrow. */
  stage: string;
  eyebrow: string;
  /** Short label for the proof-progress rail. */
  railLabel: string;
  /**
   * How this proof names itself in compact listings. Lives on the proof rather than in
   * the listing components, so a proof whose short name differs from its title (the
   * standard is "workspace.json", the proof is "Repository Intelligence") does not
   * become an `id ===` special case scattered across the UI.
   */
  listing: ProofListing;
  title: string;
  thesis: string;
  status: ProofStatus;
  /** Evidence-panel identifier from the export, e.g. `EV-VRK`. */
  evidenceCode: string;
  /** Labelled prose blocks: PROBLEM, BUILT, WORK. */
  fields: ProofField[];
  technologies?: string[];
  demonstrates: string[];
  /** Compact rows for the "VERIFY THIS" panel. */
  summary: EvidenceSummaryRow[];
  /** Fuller, typed rows revealed by the evidence disclosure. */
  evidence: EvidenceRef[];
  /** What this proof does not establish. Always rendered; never optional in practice. */
  boundary: string;
  /** Short note pinned beside the evidence panel, where the export had one. */
  boundaryNote?: string;
};

export type SupportingWork = {
  id: string;
  title: string;
  question: string;
  summary: string;
  tags: string[];
  surface: string;
  boundary: string;
  evidence: EvidenceRef;
};

/** A row of the Claim Ledger: what is asserted, on what basis, and within what limit. */
export type Claim = {
  id: string;
  claim: string;
  evidence: string;
  boundary: string;
};

/**
 * A Decision Receipt. Every field after `question` is optional because, for now, none
 * of them are populated: the design export supplied the questions but no answers, and
 * inventing architectural reasoning would defeat the point of the artifact. A receipt
 * with no `decision` renders in an explicit awaiting state.
 */
export type DecisionReceipt = {
  id: string;
  question: string;
  constraint?: string;
  alternatives?: string[];
  decision?: string;
  tradeoff?: string;
  evidence?: EvidenceRef[];
  wouldChangeIf?: string;
};

/** One row of a role lens's evidence map. */
export type RoleEvidenceMapping = {
  problem: string;
  /** Which proofs answer it, by display name. */
  evidence: string;
  discuss: string;
};

/**
 * A role lens. It may change framing, ordering, and emphasis. It holds no proof content
 * of its own, which is what keeps every projection honest about the same underlying
 * evidence.
 */
export type RoleLens = {
  slug: string;
  /** Title shown in the ROLE LENS chip. */
  roleTitle: string;
  /** Organisation shown beside it. Absent on the durable, neutral root lens. */
  organisation?: string;
  /** Overrides the Role Fit heading when the lens wants to name the problem directly. */
  roleFitHeading: string;
  /** Ordering of proof ids in the Evidence Index and body. */
  proofOrder: string[];
  mapping: RoleEvidenceMapping[];
  showAvailability: boolean;
  /** Page <title>/description for this projection. */
  metaTitle: string;
  metaDescription: string;
  /** True for the durable root lens; role routes are excluded from the sitemap. */
  isDefault: boolean;
};
