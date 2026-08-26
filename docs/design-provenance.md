# Design provenance

What design source was consumed for the interaction pass, how it was treated, and where
the implementation deviates from it.

This complements `docs/design-import.md`, which covers the original visual-language
import. That import is preserved in-repository at `design/reference/claude/`. **This one
is not**, for the reason given below.

## Scope

The motion storyboard recorded here is scoped to three interactions (Repository Decision
Diff, Interlock Counterfactual, and Vreko Semantic Zoom) and remains unchanged. All three
are still DOM and SVG driven by CSS transitions, and nothing below has been superseded.

**Hero Concept B is separately scoped.** It arrived later, as its own artifact
(`design/reference/claude/Prove It Resume - Hero Concept B.dc.html`), and it does not
alter the implementation decision for those three. Where this storyboard says hero motion
is out of scope, it is describing its own boundary rather than a standing prohibition on
the hero ever moving; the decision to let it move is
`docs/decisions/0009-a-fourth-animated-treatment.md`. Recording that here so no reader has
to infer it from two documents that appear to disagree.

---

## Source artifact

| Field         | Value                                                              |
| ------------- | ------------------------------------------------------------------ |
| File          | `Motion Storyboard.dc.html`                                        |
| SHA-256       | `420baf10bd2d199a217c9c120a9972d18a07e665360b048f630cd8e78de56b46` |
| Supplied in   | `Motion storyboard for Prove It Resume-animation-updated/`         |
| Date consumed | 2026-08-24                                                         |
| Tool          | Claude Design                                                      |
| Identified as | `DIRECTION C·1 · REV 2026.08`, "Motion & disclosure storyboard"    |

Three storyboard files were present in the supplied directory. The motion storyboard was
selected by inspecting content rather than filenames, and confirmed as the corrected
revision by three markers it carries:

- `BEAT IDS ARE NOT UI LABELS`; one occurrence, stating that `B0–B4`, `t0–t4` and
  `L0–L2` are document and code identifiers that never reach the interface.
- `[BIND: VERIFIED EVIDENCE]`; eighteen occurrences, marking every score, count, path,
  sha, version and timestamp in the frames as an unbound placeholder.
- `COLOR TOKENS · PRODUCTION OVERRIDES THIS ARTIFACT`: stating that the production
  codebase's accessible colour tokens are authoritative and that "where a token and a
  swatch disagree, the token wins and the storyboard is wrong".

## How it was treated

**As an interaction specification, not as production source.** It determined the
progressive-disclosure behaviour, the state transitions, the information-revelation
model, and the relative weight of the three interactions. It determined nothing factual.

No code, markup, styling or copy was copied from it. Every example value it contained
(paths, counts, shas, versions, metrics, architecture labels) was treated as untrusted
and either replaced with a value read from a public artifact or left unbound.

**It was deliberately not committed.** The supplied directory sits outside this
repository's working tree, so it could not appear in `git status`, and nothing in
`src/`, `tests/` or `docs/` imports or references it. It was removed after the pass
completed. `design/reference/claude/` (the previously committed visual-language export)
was left untouched.

## Production implementation

| Interaction              | Component                                                 | Bound evidence                               |
| ------------------------ | --------------------------------------------------------- | -------------------------------------------- |
| Repository Decision Diff | `src/components/interactions/RepositoryDecisionDiff.tsx`  | `content/experiments/repository-decision.ts` |
| Interlock counterfactual | `src/components/interactions/InterlockCounterfactual.tsx` | `content/experiments/interlock-hac330.ts`    |
| Vreko architecture trace | `src/components/interactions/VrekoArchitectureTrace.tsx`  | `content/experiments/vreko-architecture.ts`  |
| Shared stage selector    | `src/components/interactions/StepControl.tsx`             | :                                            |
| Deep-linked state        | `src/components/interactions/useDeepLinkedState.ts`       | :                                            |
| Types                    | `src/lib/interactions.ts`                                 | :                                            |

Durable principles are recorded in `docs/interaction-contract.md`.

## Deviations from the storyboard

Each is deliberate. The first three are the ones that changed what the interactions
actually say.

1. **The Repository Decision Diff's evidence is not co-change or fragility.** The
   storyboard's frame showed two evidence cards, `EV-1 · CO-CHANGE` and
   `EV-2 · FRAGILITY`, with every value marked `[BIND: VERIFIED EVIDENCE]`. The frozen
   run this is now bound to contains neither. Its evidence is an exact source-path
   resolution, and the run's own artifact records the `partners` field as indeterminate
   with an observed count of zero: no co-change evidence was available. The data model
   was written after reading the artifact, with an open `kind` string, precisely so the
   real result would fit. Had the storyboard's taxonomy been typed in, the honest result would have
   had to be distorted to display it.

2. **The Vreko architecture uses a different decomposition.** The storyboard proposed
   transport, MCP protocol, intelligence layer, session store, repository index,
   evidence resolver and auth context. An audit of the current public
   repositories supports a different split, with authentication at the HTTP edge rather
   than inside the intelligence layer. More importantly, the audit found that **none of
   the three public repositories contain implementation source**; they are distribution
   and documentation surfaces. So the interaction argues about the publication boundary,
   which is mechanically checkable, rather than illustrating internals a reader cannot
   inspect.

3. **The Interlock counterfactual is one shared scale with a time axis, not an OFF/ON
   switch.** This follows the storyboard's strongest decision rather than the previous
   implementation. The storyboard's own numbers (`140 > 130`, `WITHHOLD_SERIALIZE`,
   `120 ≤ 130`) turned out to match the frozen packet exactly, but they are used
   because `experiments/hac-330/evidence/arms.json` says so, and would have been
   replaced if it had said otherwise.

4. **No ARIA tree.** The storyboard specified `role="treeitem"` for the architecture
   diagram. Nested `<button aria-expanded>` disclosures inside real lists convey the same
   nesting with semantics that are robust in every screen reader, without owing the full
   tree interaction contract.

5. **No swipe.** The storyboard's mobile frame showed `EVIDENCE 1/2 · SWIPE OR TAP`.
   Swipe was not implemented at all. Explicit Previous and Next controls are the
   interface at every width.

6. **Reduced motion does not open at the final beat.** The storyboard specified that the
   interaction opens fully resolved under `prefers-reduced-motion`. That would change the
   disclosure, not just the interpolation, so instead the same default state and the same
   controls apply and only the transitions are removed. This is handled entirely in CSS,
   with no JavaScript branch, which also means it cannot desynchronise from the rendered
   state.

7. **Stage selectors wrap rather than scroll on narrow screens.** The storyboard implied
   a horizontal rail. In a real browser, a scrolling stage group moved sideways under the
   reader's finger on activation and propagated enough scroll to give the page ~50px of
   horizontal overflow. Wrapping keeps every stage label visible, which is also better
   for a control whose purpose is to show position in a sequence.

8. **Beat identifiers are internal only.** `B0–B4`, `t0–t4` and `L0–L2` appear nowhere in
   the interface, in the DOM, or in the deep-link query values, as the storyboard itself
   required. A test asserts this against rendered text.

9. **Storyboard colour swatches were ignored.** The production token layer (including
   the retuned quiet ladder and the 11.5px microtype floor from the original import) is
   authoritative, as the storyboard itself states.
