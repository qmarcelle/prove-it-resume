# 0009 — A fourth animated treatment, built in CSS, with dotLottie deferred

**Status:** accepted

## Problem

`docs/interaction-contract.md` fixed the count: "Exactly three interactions get an
animated treatment. Nothing else on the page does, and adding a fourth is a decision to
make deliberately rather than by accretion." This is that decision.

Claude Design supplied `Prove It Resume - Hero Concept B.dc.html` — "The Bounded Field" —
a 108-frame, 30fps hero sequence in which three dashed fragments align onto an evidence
baseline, a decision boundary closes around them, and they consolidate into one solid unit
with a terminus mark. It was authored as a prototype for a `.lottie` asset.

Two questions had to be answered separately: whether the hero earns motion at all, and
whether that motion earns an animation runtime.

## Does it earn motion?

The contract's admission rule requires naming which of Causality, Boundary, State,
Provenance, or Evidence a transition reveals, and removing it if the honest answer is
"it looks polished". The export's own beat sheet answers for each beat:

| Beat | What it says                                                                             | Category      |
| ---- | ---------------------------------------------------------------------------------------- | ------------- |
| B1   | "Evidence arrives first and the fragments align to it. Causality runs in one direction." | **Causality** |
| B2   | "The decision gets a boundary, and something is deliberately ruled out by it."           | **Boundary**  |
| B3   | "One unit, bounded, on the evidence, shipped."                                           | **State**     |

Three of the five categories, one per beat, and the ordering _is_ the claim — evidence
before alignment, boundary before consolidation. Shown as two static states, the causal
direction is exactly what is lost.

Budget: opacity plus one of transform or fill per element, no translation over 16 units,
no overshoot or spring. The ~900ms choreography cap in the contract was written for three
disclosure interactions the reader operates; this is a single play-once sequence at 3.2
seconds and it is named here rather than allowed to drift silently.

## Does it earn a runtime?

Not yet, and the export says so itself: "This CSS version is deployable as-is, which means
the decision to buy an animation is deferred until after the concept has been in front of
real readers."

So the hero ships as CSS transitions keyed off a `data-beat` attribute. `dependencies` is
still exactly `next`, `react`, `react-dom`, and `docs/performance.md`'s "no Lottie" holds.

**The trigger for revisiting it**: the concept survives real readers — that is, someone
who watches it once can say what the work is. The export names this risk plainly, and it
is the honest test. If it fails, the sequence is removed and the marks derived from it
stay, because the marks are earning their place independently.

If it is revisited, the export's own nine constraints govern: dotlottie-web only,
lazy-imported after first paint; under 12 KB, shape layers only; autoplay once, loop off,
no state machine; frame 108 pixel-identical to the static SVG; the player never mounts
under reduced motion; a fixed aspect-ratio box; the headline stays LCP; bounds and stray
dropped below 640px. It would replace the animated layers only.

## Architecture: the prerendered HTML is the settled frame

`src/components/hero/BoundedField.tsx` renders **beat 3** — the finished composition — as
its initial state, which is what the server sends and what hydration matches. The sequence
is a _rewind_: an effect drops back to B0 and plays forward, across two animation frames
so that the jump back happens with transitions unattached and does not animate in reverse.

That inversion satisfies four rules at once. No JavaScript and reduced motion both leave
the reader with the finished picture rather than a degraded one; the export's requirement
that the settled SVG render before any player is requested holds by construction; the
first render matches the prerender; and the box never changes size, so CLS stays 0.0000.

**Geometry in SVG, labels in DOM.** Nothing in the drawing is a word, a number, or a
claim. The four station labels — AGENT, CONTEXT, BOUNDARY, PRODUCTION — and the per-beat
caption are real text positioned against the stage, so copy stays selectable,
translatable, and readable by a screen reader. The stage is `role="img"` with the export's
per-beat description, which is the same rule the charts already follow. This is also the
answer to the export's stated risk: the animation supplies the mental model, the DOM
labels supply the semantics, and the headline above supplies the thesis.

All five colours are existing tokens — ink, ink-tertiary, border-dashed, surface-muted,
accent. No hue is introduced.

## The B2 stray: constraint, not exclusion

The export animates the excluded candidate outward and fades it to nothing. It ships
holding still at 0.35 opacity, outside the right bound, where it already sits — the stray
is drawn at `x=576` and the bound at `x=560`, so the two variants differ by one value.

This is not the gentler option, it is the consistent one. `src/lib/types.ts` puts
`boundary` inside `EvidenceKind` deliberately: "what a piece of evidence fails to
establish is evidence about the claim, and typing it separately would let it drift out of
view." The interaction contract adds that claim boundaries are "rendered, never collapsed
to make an interaction tidier". A hero whose final beat erases what it ruled out would
contradict every section beneath it. Held visible, the beat says the system knows what
lies outside its decision boundary; faded to zero, it says the outside stopped existing.

The export's layer note — "exits outward, never inward; it must be obvious it was excluded
rather than absorbed" — is still satisfied. Both variants live behind `STRAY_TREATMENT` in
`BoundedField.tsx` so the comparison can be made again rather than taken on trust.

## Consequences

- The animated-treatment count is now **four**, and `docs/interaction-contract.md` names
  the hero as the fourth.
- The settled frame is the source of the concept marks in `src/components/concept`. A
  reader meets the geometry once, moving, then meets crops of it beside the claims it was
  describing — the vocabulary is learned before it is used.
- Station labels cannot shrink to fit: `docs/design-import.md` set an 11.5px microtype
  floor and it is authoritative. Below roughly a 480px stage the labels stop clearing
  their ticks, so a container query switches them to an evenly distributed row and hides
  the ticks they would otherwise misalign against. Below 640px the bounds and the stray
  are dropped, per the export.
