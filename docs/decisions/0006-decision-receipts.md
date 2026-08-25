# 0006 — "Ask me to defend a decision" is a receipt, not a checkbox list

**Status:** accepted
**Amended:** receipts populated from recorded reasoning (see _Amendment_ below)

## Problem

The design prototype renders seven questions as multi-select checkboxes with a counter:
"3 selected · bring these to the conversation". The interaction collects intent and
returns nothing. It ends precisely where the interesting part starts, and it asks the
evaluator to do work on the candidate's behalf.

No answers to these questions were supplied with the design.

## Alternatives

1. **Port the checkboxes as drawn.** Faithful to the mockup. Preserves an interaction
   that gives the evaluator nothing.
2. **Write plausible answers.** Fills the layout. Fabricates architectural reasoning on
   a page whose entire argument is that claims should be inspectable — the single worst
   thing this artifact could do.
3. **Build the receipt component and render an explicit awaiting state.**

## Decision

A `DecisionReceipt` disclosure per question, with fields for constraint, alternatives
considered, decision, failure mode / tradeoff, evidence, and what would change the
decision now.

An unanswered receipt shows its own structure with each section marked `AWAITING`, and
says plainly that it has not been written yet.

## Amendment — receipts populated from the decision record

The original blocker was sourcing, not design: the reasoning existed, but not in the
material supplied with the mockup. It was recovered from the systems that recorded each
decision when it was made — Linear issues carrying the constraint, the alternatives, and
the disposition, and Fibery Open Questions carrying the measured outcome and its
interpretation boundary.

All seven receipts are now answered. The rules applied:

- **No inference.** A receipt states what the record states. Where a decision was
  reversed, narrowed, or killed, the receipt says so — three of the seven end in a
  negative or a withdrawn result, because that is what was measured.
- **Evidence must be openable.** Four receipts carry evidence rows, all pointing at
  public, revision-pinned artifacts (evidence trees at an exact SHA, and the pull
  requests that record a rollout). Where the only record is a private Linear issue, no
  evidence row is claimed — the identifier appears in the prose as provenance instead.
  `EvidenceLink` remains the only component that can emit an href, so this rule is
  enforced by the type system rather than by review.
- **The awaiting branch stays.** It is the correct state for a future question that has
  been asked but not yet answered from a record.

`EVIDENCE` was listed in `RECEIPT_SECTIONS` but never rendered by the answered branch —
an unanswered receipt promised a section the answered one dropped. The answered branch
now renders it when rows are present.

## Consequences

- An evaluator can open a receipt and reach the underlying artifact for four of the
  seven. For the other three the reasoning is stated and the record is named, without a
  link that would not resolve.
- The content test changed direction. It previously asserted that no receipt carried a
  `decision`; it now asserts that every receipt carries a decision _and_ its constraint,
  its cost, and its reversal condition. A receipt that states a decision without its
  cost is the tidied-up rationale this section exists to avoid.
- Receipt prose is now the largest single body of content in the repository, and it ages
  with the decisions it describes. A receipt whose `wouldChangeIf` condition has since
  fired is worse than an unanswered one.
- The interaction still differs visibly from the approved mockup. Recorded in
  `docs/design-import.md` under deviations.
