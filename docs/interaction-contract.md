# Interaction contract

The durable rules behind the three progressive-disclosure interactions. This records
_principles_, not a storyboard: the design source that specified these is not committed,
and a document that paraphrased it would rot the moment either side moved.

The governing idea is one line:

> Complexity should be available, never imposed.

Exactly four things on this page get an animated treatment: the three progressive
disclosures documented below, and the hero composition. Nothing else does.

The fourth was added deliberately rather than by accretion, which is what this clause
asks for — see `docs/decisions/0009-a-fourth-animated-treatment.md`, which names the
admission category for each of its beats (causality, boundary, state) and records why it
ships as CSS rather than as an animation runtime. A fifth would need the same treatment.

One number moves with it. The ~900ms choreography cap below was written for disclosures
the reader operates, where a long sequence means waiting on a control; the hero is a
single play-once sequence measured at 3.05 seconds end to end. That exception is named
there, not assumed.

The cap's premise is what makes the exception safe. Nobody is waiting on this one: it is
not a control, it plays once on the stage's first meaningful entry into the viewport, and
it has no replay. A reader who wants the finished picture already has it — that is the
frame the server sent.

---

## Motion admission rule

A transition ships only if a reviewer can name which of these it reveals:

| Category       | What it means here                                                  |
| -------------- | ------------------------------------------------------------------- |
| **Causality**  | One thing happened because another did, and the order is the point. |
| **Boundary**   | A request or a claim crossed from one system into another.          |
| **State**      | Something is now in a different, named condition.                   |
| **Provenance** | This value came from that artifact, at that revision.               |
| **Evidence**   | Here is the thing you can go and check.                             |

If the honest answer is "it looks polished", the transition is removed and the two states
are shown at once. Every transition currently shipping, with its category:

| Transition                | What changes           | What stays fixed                  | What the reader learns                          | Category  |
| ------------------------- | ---------------------- | --------------------------------- | ----------------------------------------------- | --------- |
| Diff stage disclosure     | Opacity + 6px rise     | Controls, baseline plan, boundary | Evidence arrived _before_ the plan changed      | Causality |
| Interlock bar widths      | Segment width          | Scale, bound marker, both arms    | The joint total moved relative to a fixed bound | State     |
| Vreko container expansion | Height, in place       | Label, position, neighbours       | You are inside the box you opened               | Boundary  |
| Vreko hop highlight       | Which container is lit | The whole diagram                 | Where the request is now                        | Boundary  |

Constraints: at most two animated properties per element, always opacity plus one of
transform or height; no translation over 12px; no overshoot, spring, or bounce; no
choreography longer than ~900ms. **No animation library.** Every transition above is a
CSS transition or keyframe. `motion` was evaluated and not installed, because nothing
here needed layout animation or interruptible physics.

---

## The three interactions

### Repository Decision Diff

```
evidence → decision comparison → attribution → provenance → exact evidence
```

Held fixed and varied are stated **before** any stage is advanced, because a plan pair
with nothing pinned is an anecdote rather than a comparison.

The diff is not computed here. Its rows are the source experiment's own delta records,
carried across with their kind, reason, and attribution. A diff derived in this codebase
would be this codebase deciding what changed.

**The data model follows the evidence.** `DecisionEvidence.kind` is an open string, not
a union. The run this is bound to contains no co-change evidence at all, and one of its
evidence rows records that absence — a model typed around co-change and fragility could
not have displayed its own source truthfully.

With no bound run, the component renders a stated gap. It never fabricates a plan pair.

### Interlock counterfactual

```
bounded scenario → treatment → resulting state → perturbation → frozen evidence
```

**Both arms share one scale and one constraint marker.** The marker is a single element
spanning the whole track, so "the same constraint" is a visual fact rather than a claim
about two aligned charts. The reader never has to hold one arm in memory.

The arms advance together through named stages, because _when_ the decision happens —
before shared state is mutated — is the finding.

Perturbation is a control the reader operates, never autoplay. Removing the coupling
evidence flips the decision and the outcome using the same decision function, which is
simultaneously the experiment's strongest control and its most honest limitation.

Restraint is part of the contract: no flash, no shake, no celebration of the satisfied
arm. The uncoordinated arm is a recorded finding, not a failure to be punished with
colour.

### Vreko semantic zoom

```
overview → expand the same container → expose public boundaries → user-stepped trace → inspect source
```

The box you opened stays the box you are looking inside. Expansion happens in place: the
container keeps its label and position, grows downward, and its neighbours move around
it. One diagram at three depths, never a second denser picture.

The trace never auto-advances, at any motion setting. One user action is one boundary
crossing. A timed walk would imply throughput, which this section does not claim.

Publication state is on every node, because the interesting fact about this system is
_how much of it an evaluator can read_. Where public documentation contradicts public
package state, the contradiction is displayed rather than reconciled.

---

## Accessibility contract

Semantic DOM first. These are lists, buttons, and disclosures — not a canvas, not an
illustration with text baked into it. Text stays selectable, translatable, and reflowable.

- **Keyboard reaches every state.** Stage selectors are one tab stop with roving
  tabindex; arrow keys, Home and End move within them. No hover-only disclosure, no
  mouse-only trace.
- **Explicit ordinal controls always exist.** Previous and Next are visible at every
  width. Swipe is not implemented and nothing depends on a gesture.
- **Reduced motion preserves information equivalence.** Interpolation is removed; the
  same states, the same controls, the same content. Causal ordering that motion carried
  is carried instead by persistent attribution labels and by a decision trace stamped
  per stage.
- **Change is never colour alone.** Diff rows carry a glyph, a spelled-out word, and a
  border treatment. Verdicts carry a word plus a solid-versus-dashed rule.
- **Charts are described in text.** Each bar is `role="img"` with a label naming every
  segment, the joint total, and the bound; the same numbers appear as visible text.
- **Nested disclosures, not an ARIA tree.** `role="treeitem"` was specified by the design
  and deliberately not implemented: a tree brings an interaction contract that this
  content does not need and that would be worse half-built.
- **axe runs against interacting states**, at desktop and 320px, not just the resting
  page.

Production accessibility tokens are authoritative. The design source's swatches and its
10.5–11px microtype do not override the retuned quiet ladder or the 11.5px floor.

---

## Evidence contract

Verified evidence overrides design-fixture content. Where the design source and a frozen
artifact disagree about a number, a label, a path, or an architecture, the artifact wins
and the design source is wrong.

- No inspect call to action without an exact artifact. Unresolved rows render as stated
  gaps.
- Every GitHub evidence link on the three primary proofs is pinned to a full
  40-character commit sha, enforced by a test. A `/blob/main/` link silently changes
  meaning when main moves, which matters most where the claim is about a specific frozen
  result. The one supporting-work link deliberately tracks `main`, because it names a
  living evaluation document rather than a frozen artifact.
- Anchored links must point at a heading that exists. A dead `#anchor` lands the reader
  at the top of the page, which looks like working evidence and is not — one was found
  and corrected during this pass.
- No two links in one panel share a call-to-action label. "INSPECT SOURCE" three times
  leaves the reader guessing which is which.
- Claim boundaries are rendered, never collapsed to make an interaction tidier.
  Distinctions the source repositories insist on — `ALLOW` is not `VERIFIED`, `OBSERVED`
  is not `SAFE` — are carried through verbatim.
- Separate experiments stay separate. A controlled local causal experiment, a recorded
  cloud traversal, and a broader operational comparison are three results, and merging
  them would misrepresent all three.
- Where the evidence says less than existing copy, the copy is corrected.

---

## Deep-linkable state

Meaningful states _can be_ represented in the query string with human-readable values:
`?decision=…`, `?interlock=…`, `?layer=…`. No internal beat identifiers appear.

The distinction is load-bearing, and it is the one thing to preserve here. Ordinary
interaction does not touch the address. Reading three sections of `/linear` used to
produce `?interlock=evidence&layer=workspace&decision=comparison#sec-02`, which nobody
asked for and which reads as a debug harness rather than a finished page. One explicit
control — `COPY THIS VIEW`, on each interaction's ordinal row — builds the address, and
it carries the whole surface's state rather than that one panel's, because a reader
shares the page they are looking at. See
[ADR 0012](decisions/0012-state-can-be-a-link-not-is-one.md).

Arriving through such a link is honoured exactly as before. The first render is always
the default, matching the prerendered HTML; the URL is applied in an effect afterwards.
That keeps the route statically rendered and hydration-safe, and means the page is
correct with no query state at all.

One write to the URL remains, and it only ever deletes: a reader who arrives at
`?interlock=evidence` and then steps elsewhere has their address corrected rather than
left asserting a stage the page is not in. The URL only moves toward the clean one.

---

## Client/server boundary

The three interaction surfaces are client components. Their surrounding proof sections
stay server-rendered, and the page is not promoted to `"use client"` for convenience.
Content lives in `src/content/`, outside the components that animate it, so the facts and
the presentation can be reviewed separately.
