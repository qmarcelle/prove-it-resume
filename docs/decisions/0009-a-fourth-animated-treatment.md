# 0009: A fourth animated treatment, built in CSS, with dotLottie deferred

**Status:** accepted
**Amended:** the hero's second pass, "The Bounded Path", replaced its first; see
_The second pass_ below, which supersedes the stray-treatment decision this record
originally made.

## Problem

`docs/interaction-contract.md` fixed the count: "Exactly three interactions get an
animated treatment. Nothing else on the page does, and adding a fourth is a decision to
make deliberately rather than by accretion." This is that decision.

Claude Design supplied `Prove It Resume - Hero Concept B.dc.html`: a 108-frame, 30fps
hero sequence authored as a prototype for a `.lottie` asset.

Two questions had to be answered separately: whether the hero earns motion at all, and
whether that motion earns an animation runtime.

## Does it earn motion?

The contract's admission rule requires naming which of Causality, Boundary, State,
Provenance, or Evidence a transition reveals, and removing it if the honest answer is
"it looks polished". The export's own beat sheet answers for each beat:

| Beat | What it says                                                                  | Category      |
| ---- | ----------------------------------------------------------------------------- | ------------- |
| B1   | "Repository material becomes evidence. Causality runs left to right."         | **Causality** |
| B2   | "The agent decides inside a bounded evidence surface. Something is excluded." | **Boundary**  |
| B3   | "The decision is the output, and the only saturated thing on the stage."      | **State**     |

Three of the five categories, one per beat, and the ordering _is_ the claim: evidence
before the agent, the boundary before the answer. Shown as two static states, the causal
direction is exactly what is lost.

Budget: opacity plus one of transform or fill per element, no overshoot or spring. The
~900ms choreography cap in the contract was written for three disclosure interactions the
reader operates; this is a single play-once sequence at 3.05 seconds and it is named here
rather than allowed to drift silently.

**Timing and trigger.** 900ms a beat: a hold, then three beats, so the last is triggered
at 2.7s and its own 340ms transform settles at 3.05s; measured in a browser, not derived.
The export's prototype ships 800ms, which lands at 2.4s and 2.7s, just under the 2.5s
floor the sequence is specified to clear; one notch slower puts it inside the window
however you choose to measure it.

It plays **once**, on the stage's first meaningful entry into the viewport (half of it on
screen) and the observer disconnects on that first hit. Not on mount: on a narrow window
the figure sits below the fold, and a sequence that had already finished by the time the
reader arrived would be a load-order accident. The beats _are_ the claim, and they are
worth nothing unwatched. Not on every entry either: scrolling past it a second time
replays nothing, because this is something the page says on arrival rather than a scroll
effect.

## Does it earn a runtime?

Not yet, and the export says so itself: "This CSS version is deployable as-is, which means
the decision to buy an animation is deferred until after the concept has been in front of
real readers."

So the hero ships as CSS transitions keyed off a `data-beat` attribute. `dependencies` is
still exactly `next`, `react`, `react-dom`, and `docs/performance.md`'s "no Lottie" holds.

**The trigger for revisiting it**: the concept survives real readers; that is, someone
who watches it once can say what the work is. The export named this risk plainly, and it
is the honest test.

If it is revisited, the export's own nine constraints govern: dotlottie-web only,
lazy-imported after first paint; under 12 KB, shape layers only; autoplay once, loop off,
no state machine; frame 108 pixel-identical to the static SVG; the player never mounts
under reduced motion; a fixed aspect-ratio box; the headline stays LCP; the bracket and
stray dropped below 640px. It would replace the animated layers only.

## The second pass

That trigger fired against the first composition rather than for it. "The Bounded Field"
resolved into three fragments on a baseline inside two rules, and the export's own second
pass states the fault: it "resolved into two rules, a black bar, and an amber square:
abstract geometry that communicated craft and nothing specific, and that lost its meaning
the moment the motion stopped".

"The Bounded Path" is the replacement, and its trade is stated in the same place:
"Labelling the nodes costs one line of the composition's purity and buys a resting state a
cold reader can describe in five seconds." Four nodes settle onto one axis and connect
left to right (REPOSITORY, EVIDENCE, AGENT, DECISION) a bracket rises to enclose the
middle two, a node outside it is excluded, and the decision fills as the only saturated
mark on the stage.

Everything above survives the swap: the same three admission categories, the same beat
count, the same CSS-over-runtime answer, the same nine constraints. What changed is what
the settled frame says with the motion switched off, which was the only part that failed.

Both files are kept (`Prove It Resume - Hero Concept B (first pass).dc.html` alongside
the current one) because this record cites the first and the second exists to correct it.

## Architecture: the prerendered HTML is the settled frame

`src/components/hero/BoundedField.tsx` renders **beat 3** (the finished composition) as
its initial state, which is what the server sends and what hydration matches. The sequence
is a _rewind_: an effect drops back to B0 and plays forward, across two animation frames
so that the jump back happens with transitions unattached and does not animate in reverse.

That inversion satisfies four rules at once. No JavaScript and reduced motion both leave
the reader with the finished picture rather than a degraded one; the export's requirement
that the settled SVG render before any player is requested holds by construction; the
first render matches the prerender; and the box never changes size, so CLS stays 0.0000.

**The rewind happens on mount; only the play waits for the viewport.** That order is
deliberate and it is the one part of this that is easy to get backwards. Rewinding on
entry instead would mean a reader scrolling down met the finished diagram and then watched
it snap back to scattered before starting: the sequence running in reverse in front of
them, which is the single thing the double animation frame exists to prevent. Rewound
early and off screen, it is simply waiting at its first frame. The cost of that choice is
that a reader whose `IntersectionObserver` never fires would sit on beat zero rather than
on the settled frame, so a missing observer plays immediately instead of gating.

**Geometry in SVG, labels in DOM.** Nothing in the drawing is a word, a number, or a
claim. The four station labels, the bracket's BOUND label, and the per-beat caption are
real text positioned against the stage, so copy stays selectable, translatable, and
readable by a screen reader. The stage is `role="img"` with the export's per-beat
description, which is the same rule the charts already follow. This is also the answer to
the export's stated risk: the animation supplies the mental model, the DOM labels supply
the semantics, and the headline above supplies the thesis.

One consequence of putting labels in the DOM is that a hidden one is still a word. BOUND
is `visibility: hidden` until its bracket exists, not merely transparent; a contrast
checker reads a transparent word blended against the stage and fails it, and a screen
reader announces an enclosure that has not been drawn.

All colours are existing tokens: ink, ink-tertiary, border-dashed, accent. No hue is
introduced.

## The B2 stray: excluded, as authored

The export animates the excluded node outward and it is gone by B3. The first pass shipped
the opposite (held still at 0.35 opacity, outside the bound) arguing that
`src/lib/types.ts` puts `boundary` inside `EvidenceKind` deliberately ("what a piece of
evidence fails to establish is evidence about the claim"), that the interaction contract
says claim boundaries are "rendered, never collapsed to make an interaction tidier", and
that a hero whose final beat erased what it ruled out would contradict every section
beneath it.

**The second pass changes that argument's premise rather than answering it.** In the first
composition the stray sat inside the same unlabelled field as everything else, so holding
it visible read as "the system knows what lies outside its decision boundary". Here the
four stations are named and the stray is not: it sits past DECISION, outside the bracket
and outside the vocabulary, so at rest it is an anonymous dashed box standing after the
answer. That is precisely the illegibility the second pass was drawn to remove, and it
would be bought back for a principle the composition now expresses somewhere better.

The principle is not given up. The boundary that this page refuses to collapse is the
bracket, and the bracket survives to the settled frame with its name attached, which the
browser suite asserts directly. What is dropped is an unnamed mark, not a claim boundary.

Both variants stay behind `STRAY_TREATMENT` in `BoundedField.tsx` so the comparison can be
made again rather than taken on trust.

## Consequences

- The animated-treatment count is now **four**, and `docs/interaction-contract.md` names
  the hero as the fourth, along with the one number that moves with it: the contract's
  ~900ms choreography cap does not bind a sequence nobody is waiting on.
- Browser tests have to arrive at the figure before they can watch it play, which is why
  the hero block scrolls it into view. One of them asserts the opposite: that it is
  still on beat zero five seconds after load with the stage below the fold.
- The settled frame is the source of the concept marks in `src/components/concept`. A
  reader meets the geometry once, moving, then meets crops of it beside the claims it was
  describing: the vocabulary is learned before it is used. The second pass re-cut all
  three: a bracketed pair, one node feeding another, and two unconnected dashed nodes.
- The mark set is monochrome now. The settled frame spends its single accent on the
  decision node and none of the three placed marks is a crop of that node, so carrying an
  accent into them would have been decoration rather than derivation.
- Station labels cannot shrink to fit: `docs/design-import.md` set an 11.5px microtype
  floor and it is authoritative. Below roughly a 480px stage the four words stop clearing
  their columns, so a container query switches them to an evenly distributed row and BOUND
  wraps onto a line of its own.
- The bracket and the stray are dropped below a 640px **viewport**, per the export, while
  the label layout switches on **stage** width. The split is deliberate: a 1024px window
  gives this figure a 390px stage, where the labels must redistribute but the bracket is
  still perfectly legible.
- The hero's browser tests carry generous timeouts. Its sequence is driven by `setTimeout`,
  so its length is a floor and not a bound: under full suite parallelism a ~3s
  choreography has been observed still sitting on beat zero six seconds in. A slow machine
  is not a regression, and Playwright resolves as soon as the attribute lands.
