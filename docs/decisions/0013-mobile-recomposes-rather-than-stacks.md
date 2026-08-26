# 0013: Mobile recomposes; it does not stack

**Status:** accepted

## Problem

A recruiter opens this page from a phone: from email, from LinkedIn, from Slack, from an
applicant tracking system, from a notification. That is not an edge case for this
artifact; for a product-engineering application it is plausibly the _first_ case.

A page whose argument is "I care about product quality and full-lifecycle ownership,"
arriving as a desktop document squeezed into 390px, has undermined its claim before a
word of it is read.

The surface was already close. The 320px no-horizontal-scroll gate and axe have been
quality gates from the start, the section index rail already lies down below 700px, and
the hero chain and the containment diagram were already vertical. What an audit at 390,
320, 768 and 1440 found were three specific failures, all of the same kind: the layout
fit, and the _meaning_ did not survive the fit.

- **The bound axis clipped its own evidence.** The narrowest segment of the Interlock
  comparison is an eighth of the axis. Its label (`gamma 20`) rendered as `gamm`. The
  number the whole comparison turns on was lost, silently, because a bar clips rather
  than overflows. It was still in the bar's accessible description, so a screen-reader
  user had it and a sighted phone reader did not.
- **Thirty-seven controls were under a thumb.** The evidence calls to action (the
  primary interaction of the entire surface) were 15px tall. WCAG 2.5.8's inline-link
  exemption does not cover a standalone call to action, and the design direction's own
  figure is stricter: 44px for every control at mobile.
- **A pinned citation pushed the page sideways at 1440.** Unrelated to mobile, found by
  the same sweep: `white-space: nowrap` on a 40-character revision line inside the 438px
  aside of a framed proof section overran the viewport by 76px.

## Alternatives

1. **Commission a second Claude Design run for mobile.** The existing export already
   contains three mobile frames (hero, Linear in Practice, one proof interaction) with
   the direction stated on the frame itself: _"Recomposed, not shrunk. Diagrams turn
   vertical, comparisons stack in causal order, every disclosure is a 44px control."_
   A second run would re-explore rather than resolve.
2. **Stack everything and accept the losses.** Cheap, and it is exactly the failure the
   frame's own note warns against.
3. **Implement the existing frames, derive the rest, and gate it.**

## Decision

Option 3, with the standard stated as an acceptance criterion rather than a habit:

> **Mobile is not desktop stacked vertically. Mobile preserves the decision hierarchy and
> recomposes any visualisation whose meaning depends on spatial comparison.**

The three fixes:

- **The bound axis moves its labels out of the bar.** Below the width where every label
  fits, the bar returns to pure proportion and the values sit beneath it as a legend with
  matching swatches. Both arms keep one shared scale and one shared bound marker, which
  is the semantic the comparison depends on. A container query, not a media query: the
  axis appears both full-measure and inside a narrow proof column, and at 1440px the
  framed variant is narrower than the same axis at 900px unframed.
- **A mobile control floor.** 44px minimum height for every standalone control below
  700px: evidence calls to action, unresolved markers, pinned citations, the wordmark,
  the header and footer links, the copy controls. Minimum rather than fixed, so a label
  that wraps grows instead of clipping.
- **The citation wraps.** `overflow-wrap: anywhere`, because what overruns is a single
  unbroken token (a commit sha, a path) that `break-word` leaves alone until it has
  already overflowed.

## Consequences

- `responsive.spec.ts` gates `/linear` at 390×844, 320×568, 768×1024 and 1440×900, with
  every disclosure open and the counterfactual at the stage that draws the bars. It fails
  on horizontal page scroll, on any leaf element whose text is clipped by its own
  overflow, and (below 700px) on any control under the floor.
- Two further tests cover the half a prohibition list cannot: that the bound axis still
  shows every value against one marker at 390px, and that the hero chain turns rather
  than shrinks. Passing the mechanical gates while losing the comparison would be the
  failure this ADR exists to name.
- The touch-target floor is applied below 700px only. At 1440 a 24px inline citation is a
  mouse target and correct as it is; a global floor would inflate the desktop page to
  satisfy a rule about thumbs.
- The `/linear` sweep found a defect that had nothing to do with mobile. Auditing a
  surface at four widths with everything open is worth more than the mobile fixes alone
  suggested.
