# 0006 — "Ask me to defend a decision" is a receipt, not a checkbox list

**Status:** accepted

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

Every receipt is currently unanswered. An unanswered receipt shows its own structure
with each section marked `AWAITING`, and says plainly that it has not been written yet.

## Consequences

- An evaluator learns what they would get and that it is not written, which is true and
  useful. A fabricated rationale would be neither.
- Populating a receipt is a data change in `src/content/decisions/index.ts`; the
  component already renders the answered branch, and that branch is under test.
- A test asserts that no receipt carries a `decision` while answers are unsupplied. When
  real reasoning is added, that test must be updated deliberately — which is the point.
- The interaction differs visibly from the approved mockup. Recorded in
  `docs/design-import.md` under deviations.
