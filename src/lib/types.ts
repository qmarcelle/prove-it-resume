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

/**
 * A pinned, immutable citation sitting behind a row's user-facing call to action.
 *
 * The rule for these links is that the reader should land on the published site or
 * docs; that is the artifact a person can actually read. But a published page is a
 * live surface: it can be rewritten, and a claim that cites one cites a moving target.
 * So a row may also carry the exact frozen artifact the claim was made against, which
 * renders as a quiet secondary citation rather than as the call to action.
 *
 * Both fields or neither, enforced here rather than by review: a source href with no
 * label renders as an unreadable URL, and a label with no href is a citation with
 * nothing behind it.
 */
export type SourcePin =
  | { sourceHref: string; sourceLabel: string }
  | { sourceHref?: never; sourceLabel?: never };

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
   * `verified: false` suppresses the call to action entirely; see `resolveEvidence`.
   */
  verified: boolean;
} & SourcePin;

/** A row in a proof's "VERIFY THIS" panel: the shorter, scannable evidence list. */
export type EvidenceSummaryRow = {
  id: string;
  label: string;
  /** Optional second line: a path, an architecture sketch, a tool chain. */
  detail?: string;
  /** Renders `detail` in the mono face, for code-shaped values. */
  detailIsCode?: boolean;
  href?: string;
  verified: boolean;
  /** Text of the call to action when resolved, e.g. "READ CASE". */
  cta?: string;
} & SourcePin;

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
  /**
   * Stable identity of the section this proof renders in: DOM id, anchor, and what a
   * shared link carries. Semantic (`vreko`) so it survives being reordered.
   */
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
  /**
   * How this work names itself where it is listed rather than rendered: the Evidence
   * Index on a surface that promotes it out of the appendix.
   *
   * Compression of the record above, never an addition to it: `content.test.ts` asserts
   * every word of the status label is already used of this work somewhere durable.
   */
  listing?: ProofListing & { status: ProofStatus };
};

/**
 * One row of the Evidence Index: a name, a line, a state, and where it lives.
 *
 * A listing shape, deliberately narrow. Both a `Proof` and a promoted `SupportingWork`
 * flatten into it, and there is no field here in which to put a claim, so composing an
 * index cannot become a way to say something the durable record does not.
 */
export type IndexEntry = {
  /** The section's stable identity; the anchor this row links to. */
  id: string;
  title: string;
  summary: string;
  summaryIsCode?: boolean;
  status: ProofStatus;
};

/** A row of the Claim Ledger: what is asserted, on what basis, and within what limit. */
export type Claim = {
  id: string;
  claim: string;
  evidence: string;
  boundary: string;
};

/**
 * A Decision Receipt: a question, and the recorded answer to it.
 *
 * All seven are answered from the decision record. Everything after `question` stays
 * optional so a receipt whose reasoning has not been recovered renders its own shape
 * with each missing section marked `AWAITING`: an honest gap rather than invented
 * architectural rationale, which is the failure this artifact exists to argue against.
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
 * The identifier of a résumé content projection; see `src/content/resume/`.
 *
 * Declared here rather than in the content module so a lens can name its projection
 * without `lib` importing `content` and closing an import cycle.
 */
export type ResumeProjectionId = 'default' | 'linear';

/**
 * What every projection the public composition renders through must supply.
 *
 * Two kinds satisfy it: a `RoleLens`, addressable at `/role/<slug>`, and an
 * `ApplicationLens`, which owns a first-class route of its own. Both are projections of
 * the same durable evidence, and neither has a field in which to put proof content;
 * that constraint is what makes "a lens cannot change a claim" structural rather than
 * a convention someone has to remember.
 */
export type SurfaceLens = {
  slug: string;
  /** Title shown in the ROLE LENS chip. */
  roleTitle: string;
  /**
   * Masthead title for this lens's résumé PDF, when the chip's wording is too long.
   *
   * The chip sits in a flexible column and may wrap freely; the résumé masthead is a
   * single mono line sharing a fixed 7.3in measure with the domains string, and a title
   * that wraps there pushes the whole document down by ~21px. Absent means the chip's
   * title already fits.
   */
  resumeTitle?: string;
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
  /**
   * Which résumé *content* projection this lens's PDF renders.
   *
   * Separate from `resumeTitle`, which is only the masthead line. A role lens changes
   * the title and nothing else; an application lens may also select and order different
   * durable facts. See ADR 0010.
   */
  resumeProjection: ResumeProjectionId;
};

/**
 * A role lens. It may change framing, ordering, and emphasis. It holds no proof content
 * of its own, which is what keeps every projection honest about the same underlying
 * evidence.
 */
export type RoleLens = SurfaceLens & {
  kind: 'role';
};

/**
 * The outer geometry one section of an application surface is set in.
 *
 * Four frames, not four stylesheets. Every section on a lens surface: editorial,
 * receipts, proof, the compact treatments: is drawn from the same index rail and the
 * same content origin, and this is the only axis on which they are allowed to differ.
 *
 * - `standard`: the default. Section ground, an oversized index number, a ruled head.
 * - `band`: the same head on its own tonal step, marking a block that groups without
 *   boxing. Inset rather than full-bleed: the measure and the gutters belong to the
 *   layout shell, and a section reaching past them would overlap the progress rail.
 * - `compact`: `standard` with the head unruled and the title one step down, for a
 *   section whose own figure is carrying the emphasis.
 * - `inline`: no oversized number: index and eyebrow share one metadata line. For the
 *   sections the plan deliberately demotes.
 */
export type SectionFrame = 'standard' | 'band' | 'compact' | 'inline';

/**
 * One section of an application surface's page plan, as authored.
 *
 * Note what is *not* here: the visible number. A page plan that carried its own numbers
 * could disagree with its own order, and on this surface it did: proof sections were
 * printing the stage they hold on `/` while the rail counted their position here. The
 * number is stamped from position by `numberSections`, so the two cannot drift.
 */
export type SurfaceSection = {
  /**
   * The section's stable identity: its DOM id, its anchor, and what a shared link
   * carries. Semantic and permanent: `interlock`, not `sec-04`.
   *
   * Held apart from the visible number on purpose. The number is a *position* and moves
   * when the plan is reordered; the identity is what the section *is* and must not.
   * When the two were the same field, `/linear` handed out `#sec-02` from a section it
   * printed as `06`, so a copied link asserted a number its own page contradicted.
   * Reordering the plan now renumbers the page and invalidates nothing.
   */
  id: string;
  /** How the section names itself in the rail and the header nav. */
  label: string;
  /** The section's visible eyebrow. The plan owns section identity, not the section. */
  eyebrow: string;
  frame: SectionFrame;
  /**
   * The durable proof this section renders, when it renders one.
   *
   * Declared here so the plan states the whole reading order in one list, including the
   * proofs, rather than leaving their position to be inferred from `proofOrder`.
   */
  proof?: string;
};

/** One numbered stage in a surface's proof rail: a plan section, stamped with its position. */
export type SurfaceStep = SurfaceSection & {
  /** Two-digit visible sequence number, derived from position in the plan. */
  n: string;
};

/**
 * A curated receipt from the owner's private Linear workspace.
 *
 * The public bundle carries only these fields, and each one is written for publication
 * rather than extracted: no issue description, no comment thread, no customer name, no
 * workspace URL. `evidence` says how far a reader can check the row; a private Linear
 * URL is never a destination, and `linear.test.ts` fails the build if one appears.
 *
 * The intended future seam is private Linear API → hard-coded allowlist → build-time
 * sanitiser → this type → page. Never browser → private workspace.
 */
/**
 * How much a reader can check a receipt for themselves.
 *
 * The model used to have two states and needed three, and the missing one was doing
 * real damage. `publicEvidenceHref` was optional and its absence meant "unverified", so
 * a receipt whose claim had been checked line by line against a private issue rendered
 * identically to one nobody had checked at all. Both got `[VERIFY BEFORE PUBLISHING]`.
 *
 * Those are different facts. "Nobody has confirmed this" and "the author confirmed this
 * against a source you cannot open" deserve different marks, and collapsing them
 * punishes the honest case: a finished application surface covered in
 * `[VERIFY BEFORE PUBLISHING]` reads as unfinished rather than as careful.
 *
 * What the split must not do is let the middle state borrow the top one's authority.
 * `private-verified` is an *attestation by the author*, not evidence, and it is rendered
 * as such: no link, no call to action, and wording that names who did the checking and
 * against what. Only `public-verified` gets a destination, because only it has one a
 * reader can open.
 */
export type ReceiptEvidence =
  /** Nothing has been checked. The default, and the only state that claims nothing. */
  | { state: 'unresolved' }
  /**
   * Checked by the author against a source the reader cannot reach. An attestation.
   * Carries no href, because there is nothing honest to point at.
   */
  | { state: 'private-verified'; checkedAt: string }
  /**
   * Backed by an artifact anyone can open. `href` must resolve for a reader who is not
   * signed in to anything, which is a stricter test than "the URL works for me" and is
   * the one that has actually failed here before. See `receipts.ts`.
   */
  | { state: 'public-verified'; checkedAt: string; href: string; label: string };

export type LinearReceipt = {
  /** The workspace identifier, e.g. `META-268`. An identifier, not a link. */
  identifier: string;
  title: string;
  /** The question the work was actually answering. */
  question: string;
  /** What was decided or found, written for a public reader. */
  finding: string;
  status: string;
  /**
   * The same finding in one sentence, for the sheet that cannot afford the full one.
   *
   * Durable copy rather than a truncation, so the short form cannot drift from the long
   * one and cannot quietly claim more than it. The page prints `finding`; the résumé
   * prints this where it exists, because a two-page sheet has room for the claim and not
   * for its qualifications, and the qualifications are the part that must not be lost.
   * `linear.test.ts` holds the two to the same status and the same hedges.
   */
  compact?: string;
  /** What this receipt does not establish. Required, like every boundary here. */
  boundary: string;
  /** How far a reader can check this row. Required: there is no unstated default. */
  evidence: ReceiptEvidence;
};

/**
 * What an entry on the product-history section would say if it were verified.
 *
 * The site's rule is that a claim without a checkable basis is not evidence. Applied to
 * a *page section* rather than to an evidence row, that rule has two possible readings:
 * drop the unsupported entry, or state the gap. This type is the second reading, and it
 * is the one the surface takes: a dropped entry leaves a page that looks complete and
 * a reader who never learns a question was asked.
 *
 * `unverifiedId` points at a record in `UNVERIFIED` in `content/resume/facts.ts` rather
 * than restating it, so the page and the fact corpus cannot disagree about what is
 * unknown. `product-history.test.ts` fails if the id does not resolve.
 */
export type HistoryGap = {
  /** The fact this entry would carry, phrased as the thing still to be established. */
  wants: string;
  /** Id of the matching record in `UNVERIFIED`. */
  unverifiedId: string;
};

/**
 * The substance of a product-history record, whichever register it appears in.
 *
 * Exactly one of `body` and `unresolved` is present: a record either states something
 * traceable to the fact corpus or states that it cannot. There is deliberately no third
 * state, because "present but hedged" is how unverified material gets read as evidence.
 *
 * Split out from the two shapes below so `product-history.test.ts` can hold stages and
 * flat entries to the same rule in one pass: the rule is about what a record may
 * claim, and that does not change with how the record is captioned.
 */
export type HistoryRecord = {
  id: string;
  body?: string;
  unresolved?: HistoryGap;
};

/** One labelled entry in a flat register: an audience, or a discipline. */
export type HistoryEntry = HistoryRecord & {
  label: string;
};

/** A period of the production record, pinned to a role id in `RESUME_ROLES`. */
export type HistoryStage = HistoryRecord & {
  /** The durable role this stage is drawn from. Keeps it from becoming a second CV. */
  roleId: string;
  /** Sequence marker, e.g. `STAGE 01`. This register really is a sequence. */
  ordinal: string;
  title: string;
  span: string;
};

/**
 * The structured production record beneath the recent systems.
 *
 * Three registers a product-engineering reader reads together: how the work progressed,
 * who it was for, and what it spanned. Content rather than copy, so each line is a
 * record a reader can check and a test can hold to the fact corpus.
 */
export type ProductHistory = {
  stages: readonly HistoryStage[];
  audiencesHeading: string;
  audiences: readonly HistoryEntry[];
  disciplinesHeading: string;
  disciplines: readonly HistoryEntry[];
};

/**
 * An application lens: a first-class hiring surface for one organisation, at its own
 * route, composed from the same durable evidence as `/`.
 *
 * Distinct from `RoleLens` because it carries things a role lens has no business
 * carrying; its own public path, its own hero framing, its own page plan, and its own
 * résumé content projection. Bolting those onto `RoleLens` as optional fields would
 * turn the lightweight type into a bag of maybes, and would make "does this lens own a
 * route?" a question you answer by reading the object rather than its type.
 *
 * What it deliberately does *not* carry is proof content. Like every lens it selects
 * and orders; `linearReceipts` is the one place it introduces material of its own, and
 * that material is typed, curated, boundary-bearing, and tested, not a `Proof`.
 */
export type ApplicationLens = SurfaceLens & {
  kind: 'application';
  /** The route this lens is served at, e.g. `/linear`. */
  publicPath: string;
  /** Required here: an application surface is always addressed to someone. */
  organisation: string;
  /** Hero framing for this application. Copy only; it states no new evidence. */
  hero: {
    eyebrow: string;
    headline: string;
    thesis: string;
    supporting: string;
    capabilities: readonly string[];
    availability: string;
  };
  /**
   * The reading order of this surface, and the single authority for it.
   *
   * Section order, visible section number, section identity, the header nav, and the
   * guided rail are all read from this one list. Nothing on the page may state its own
   * position; see `SurfaceSection`.
   */
  pagePlan: readonly SurfaceSection[];
  /** Curated public receipts from the owner's private workspace, if any. */
  receipts: readonly LinearReceipt[];
  /**
   * Section copy owned by this surface. States framing, never evidence.
   *
   * No eyebrow here: a section's identity is the page plan's to state, and copy that
   * carried its own would be a second place for the surface to name the same section.
   */
  sections: {
    history: { heading: string; body: string; boundary: string };
    inPractice: { heading: string; body: string; boundary: string };
    judgement: { heading: string };
  };
};

/**
 * Any lens the application actually renders through.
 *
 * A discriminated union rather than the bare `SurfaceLens`, so code that needs to ask
 * "does this lens own a route of its own?" can narrow on `kind` instead of probing for
 * a field. Components that only project evidence should still take `SurfaceLens`: not
 * needing the discriminant is the signal that they treat both kinds identically, which
 * is the property this whole design is trying to keep.
 */
export type AnyLens = RoleLens | ApplicationLens;
