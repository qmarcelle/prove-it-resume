# 0002: Proof content is data, not page-local JSX

**Status:** accepted

## Problem

The design export carries every claim, evidence row, boundary, and status label inline
in markup, mixed with roughly 700 inline `style` attributes. Ported literally, a claim
and its boundary would live in different parts of a large JSX file, and the same
evidence would be restated anywhere it appeared twice.

That matters more here than in a typical site, because this artifact's central promise
is that claims and their limits travel together.

## Alternatives

1. **Copy the markup and keep content inline.** Fastest. Makes duplication invisible,
   makes a role lens impossible without forking pages, and lets a boundary be edited
   away from the claim it bounds.
2. **A CMS.** Content editing without a deploy. Adds a service, a schema migration
   story, and a runtime dependency for a page whose content changes a few times a year.
3. **Typed content modules under `src/content/`.** Content is data; components render
   it; the type system enforces the shape.

## Decision

Typed content modules, with `EvidenceRef`, `Proof`, `Claim`, and `RoleLens` as the
model. Presentation stays in components.

## Consequences

- `boundary` is a required field on `Proof`, so a proof cannot ship without stating what
  it does not establish. That is a type error, not a review comment.
- `resolveEvidence` in `src/lib/evidence.ts` is the only path to an evidence link, so
  the "no CTA without evidence" rule is enforced centrally rather than per component.
- Role lenses become projections over the same data; see ADR 0003.
- Content changes need a deploy. Acceptable at this cadence.
- Sections still own their own layout. The data model deliberately does not try to
  describe presentation; three proofs that make different arguments earn different
  shapes, and forcing one template would flatten the argument.
