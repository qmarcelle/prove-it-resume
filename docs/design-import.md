# Design import

What was received from Claude Design, what was treated as authoritative, and what
could not be reproduced exactly.

## Files received

Source directory: `Prove It Resume Visual Direction/`
Preserved unmodified at `design/reference/claude/` (hashes in that directory's README).

| File                                          | Treatment                                                                     |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| `Prove It Resume.dc.html`                     | **Primary.** Full-page mockup + `DCLogic` interaction class + all draft copy. |
| `Prove It Resume - Visual Directions.dc.html` | Reference. Directions A/B/C and the locked language.                          |
| `support.js`                                  | Reference. Claude Design viewer runtime, no production role.                  |
| `.thumbnail` (WebP, renamed `thumbnail.webp`) | Reference. Export preview.                                                    |

## Approved visual direction

From the visual-directions artifact:

> **Direction C·1 — Technical Review, hybridized** — "C's structure and metadata, B's
> evidence-panel affordance and readable technical scale, A's whitespace and thin-rule
> restraint. Candidate-first hero hierarchy; thesis demoted to supporting line."
> Labelled _Locked visual language — v0.1_.

The primary mockup is the realisation of that direction, so the port follows the
primary mockup, and the directions file was consulted only to confirm intent.

## Extracted design language

### Colour

Every hex in the primary mockup, by frequency. These became the token layer in
`src/styles/tokens.css`. The brief's expected palette matched the export exactly; three
additional values only present in the mockup are marked.

| Token                    | Value                                             | Role                                        |
| ------------------------ | ------------------------------------------------- | ------------------------------------------- |
| `--color-canvas`         | `#FAF9F6`                                         | Page background                             |
| `--color-surface`        | `#FFFFFF`                                         | Panels, cards                               |
| `--color-surface-subtle` | `#FCFBF8`                                         | Panel footers, quiet rows                   |
| `--color-surface-muted`  | `#F6F5F0`                                         | Disclosure buttons, quiet headers           |
| `--color-surface-raised` | `#F2F0E9`                                         | Panel headers                               |
| `--color-ink`            | `#1A1A17`                                         | Primary graphite                            |
| `--color-ink-strong`     | `#38372F`                                         | Emphasised body (mockup-only)               |
| `--color-ink-secondary`  | `#45443E`                                         | Secondary graphite                          |
| `--color-ink-tertiary`   | `#55534C`                                         | Body copy                                   |
| `--color-ink-muted`      | `#6E6C64`                                         | Boundary labels (mockup-only)               |
| `--color-meta`           | `#83817A`                                         | Metadata                                    |
| `--color-meta-quiet`     | `#A5A29A`                                         | Field labels, step numbers                  |
| `--color-border`         | `#DEDBD2`                                         | Structural rules                            |
| `--color-border-quiet`   | `#EDEAE1`                                         | Interior row rules                          |
| `--color-border-dashed`  | `#B3AFA4`                                         | Boundary-note rules                         |
| `--color-accent`         | `#8A5A12`                                         | Signal accent                               |
| `--color-accent-deep`    | `#7A4F0F`                                         | Accent text on light surfaces               |
| `--color-accent-border`  | `#D9C8A8`                                         | Accent borders                              |
| `--color-accent-surface` | `#F6F1E6`                                         | Accent surfaces / active rail               |
| `--color-inverse-*`      | `#C9C3B8` `#3A3833` `#26241F` `#C9B98F` `#E4D6B8` | Dark-panel scale (CTA, "defend a decision") |

One restrained signal accent (`#8A5A12`), used for: eyebrows, active rail marker,
evidence CTAs, focus ring, and primary-button hover. No second hue anywhere.

### Typography

`Public Sans` 400/500/600/700 + `JetBrains Mono` 400/500, loaded in the export from
Google Fonts. Ported via `next/font/google` with `display: swap` and CSS variables, so
there is no render-blocking third-party stylesheet and no layout shift from a late
swap. Mono carries metadata, status labels, identifiers, and code-shaped values; sans
carries everything else. This split is load-bearing for the "technical review" feel and
was preserved exactly.

### Spacing, shape, rules

Sections `44px 0 56px` with a `1px` bottom rule; panels `1px` border with a `2px`
graphite top rule when they open an argument; radius `2px` on buttons only; one
`box-shadow` in the entire mockup (guided-nav dock). `max-width: 1280px`, `32px`
gutters. Reproduced as spacing/rule tokens rather than repeated literals.

### Layout and responsive intent

The export uses flexbox with `flex: N 1 <basis>` throughout rather than media queries —
it reflows by basis. That intent is preserved, and media queries were added only where
flex alone cannot express the change (the sticky desktop rail becoming a horizontal
scroller, and type-scale reduction on small screens). See "Deviations" below.

### Interactive behaviour found in the export

From the `DCLogic` class in the primary artifact:

- `steps` — six proof stages (`sec-01`…`sec-06`), each with number and label.
- `componentDidMount` — `IntersectionObserver` with `rootMargin: '-45% 0px -50% 0px'`,
  `threshold: 0`, setting the active step. **Ported as-is**, including the margins.
- `goTo(i)` — scrolls to the section top minus `92px`, using `behavior: 'auto'` when
  `prefers-reduced-motion: reduce` matches. **Ported as-is.**
- `drawer(key)` — per-proof evidence disclosure with `aria-expanded` and a label that
  flips between "Inspect evidence ↓" and "Close evidence ↑". **Ported.**
- `toggleLedger` — collapsed-by-default Claim Ledger. **Ported.**
- `walkProof` / `nextProof` / `prevProof` / `exitGuided` — guided mode with a fixed
  bottom-right dock showing `NN / 06`. **Ported.**
- `prompts` — seven "ask me to defend a decision" questions as multi-select checkboxes
  with a "N selected" counter. **Deliberately not ported** — see Deviations.
- Props `roleTitle` / `roleOrg` / `showAvailability` / `expandEvidence` / `ledgerOpen`
  with defaults `"Senior AI Platform Engineer"` / `"athenahealth / Yoh"` / `true` /
  `false` / `false`. Became the role-lens content model and page-level defaults.

### Accessibility already present in the export

Preserved and extended: `:focus-visible` outline in the accent colour with `2px`
offset; a global `prefers-reduced-motion` block; `aria-expanded` on every disclosure;
`aria-current="step"` on the active rail item; `aria-label` on the icon-only exit
control; real `<button>` and `<a>` elements throughout, no click-handling `<div>`s.

## Content taxonomy extracted

Evidence rows in the export are typed with a small vocabulary, which became
`EvidenceKind`: `SOURCE`, `SPECIFICATION`, `EXPERIMENT`, `OBSERVED`, `DEPLOYED`,
`RESEARCH`, plus a distinct `BOUNDARY` row rendered last in every drawer.

Proof status labels: `SHIPPED SYSTEM`, `STANDARD · IMPLEMENTED · INTEGRATED`,
`CONTROLLED EVIDENCE`. Evidence panel codes: `EV-VRK`, `EV-WSJ`, `EV-ILK`.

## Links found in the export

| URL                                            | Occurrences | Treatment                                                                                                                       |
| ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `https://github.com/qmarcelle`                 | 10          | Real. Kept **only** as a profile link (header, hero, career, footer). Not reused as a per-artifact evidence target — see below. |
| `https://www.workspacejson.dev/showcase/tally` | 2           | Real. Kept as the Tally case-study evidence link.                                                                               |

Every other evidence CTA in the export — `INSPECT ↗`, `VIEW REPOSITORY ↗`,
`OPEN GITHUB ↗`, `READ ↗` — resolved either to `#sec-0N` (the section the CTA is
already inside) or to the generic GitHub profile. Neither is a specific inspectable
artifact, so under the evidence-integrity rule those are represented as **unresolved**
in the content model and render as `[VERIFY BEFORE PUBLISHING]` rather than as a link.
See `docs/content-audit.md` for the complete list.

The export itself already flags this in the résumé section:
`[VERIFY BEFORE PUBLISHING] file + profile URLs`.

## Second import — `Prove It Resume - PDF.dc.html`

A second Claude Design artifact was imported later: an explicitly paginated two-page
letter résumé, plus the `doc-page.js` page-box scaffold it depends on.

| File                              | Treatment                                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| `Prove It Resume - PDF.dc.html`   | **Primary.** Two-page résumé, all copy, `targetTitle`/`showVerifyLinks`/`showNonprofit` props. |
| `doc-page.js`                     | Page-box contract. Reimplemented, not vendored — see below.                                    |
| `uploads/QwynnMarcelleResume.pdf` | An earlier hand-made export. Superseded by the generated artifact; not imported.               |

### What `doc-page.js` specifies, and what was taken from it

`doc-page.js` is an omelette starter scaffold that implements a `<doc-page>` custom
element. Only its **explicit pagination** mode is relevant: one `<section class="page">`
per sheet, each printed at a fixed page box with `overflow: hidden`. Its documented
contract, reproduced in `ResumeDocument.module.css`:

- `@page { size: 8.5in 11in; margin: 0 }` — zero margin leaves Chrome no margin box in
  which to draw its date/URL/page-count furniture, so the visual inset lives on the
  page's own padding instead.
- Width **and** height rather than width + `aspect-ratio`: the component's own comments
  record that the ratio is a six-decimal rounding of the same division and that a few
  millionths of overflow spills a blank sheet after every page.
- `break-before: page` between sheets, and `print-color-adjust: exact`.

The scaffold itself is not vendored. It carries a shadow-DOM viewer shell, a desk
background, running header/footer slots, scaled-fit mode, and a WebKit `thead`/`tfoot`
workaround — none of which this document uses, and all of which would have to be
maintained. The ~40 lines of print CSS that matter are reimplemented and annotated.

### Deviations in the résumé port

1. **VERIFY links resolve to the published sites.** The export pointed Vreko's at
   `github.com/qmarcelle`. All three systems now publish real sites, so the links are
   `vreko.dev`, `workspacejson.dev` and `interlock.marcellelabs.io` — the same
   published-first rule the evidence rows follow.
2. **`targetTitle` comes from the role lens.** The export took it as a standalone prop.
   It is now `RoleLens.resumeTitle ?? roleTitle`, so the PDF downloaded from a role page
   carries that lens's title. `resumeTitle` exists because the masthead is a single mono
   line sharing a fixed measure with the domains string: the neutral lens's chip wording
   wraps there, and a wrapped masthead pushes the whole document down ~21px.
3. **Colours are the site tokens, not the export's literals.** The palette is identical
   apart from the quietest greys, which this project darkened for legibility
   (deviation 8 above). That applies at least as strongly to 9.5px metadata on paper.
   Type sizes remain the export's literal px values — nothing reflows on a fixed sheet.
4. **`showVerifyLinks` / `showNonprofit` are not props.** Both defaulted to true and
   nothing in the site toggles them; they can return as lens fields if a reason appears.
5. **The masthead's domains line drops one notch**, from `11px / 0.05em` to
   `10.5px / 0.03em`. It shares one fixed 7.3in measure with the target title, and the
   export tunes that pair to fit with **1.3px to spare — 0.2% of the line**. That
   survives on the machine the design was drawn on and nowhere else: CI's Linux Chromium
   wrapped the same markup to two lines, which on a fixed page box pushes the document
   down ~21px and clips page two's footer. The new sizes are ones the document already
   uses (10.5px matches the block-number rails) and buy 4.4% headroom on the neutral
   lens, 15–16% on the other two. The 22 fidelity probes are unaffected — the domains
   string sits on its own row, so nothing below it moves.

### Fidelity check

The port was measured against a render of the export's own markup rather than judged by
eye: 22 probes across both pages, comparing x, y, width and height of every structural
element. All 22 match exactly. Three discrepancies were found and fixed this way, none
of which were visible without measuring:

| Symptom                                                                           | Cause                                                                                                                    |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Everything below the masthead drifted down, page-two footer clipped off the sheet | `globals.css` sets `body { line-height: 1.6 }`; the export leaves line-height at `normal` except where it states a value |
| Foundation and profile blocks ran 3–9px long                                      | The export sets a _different_ body gap per block — 9px, 12px, 8px — rather than one shared rhythm                        |
| Role titles measured ~7px narrow                                                  | `globals.css` tracks `h1`–`h4` at `-0.025em`; the export gives `h4` no tracking                                          |

`tests/e2e/resume.spec.ts` locks the page box, the single-line masthead, and the
bottom-anchored elements, because on a fixed sheet with `overflow: hidden` these fail by
silent clipping rather than by visible wrapping.

The generated PDFs are checked against their routes by content fingerprint rather than by
byte comparison — Chromium's output is deterministic on one machine but differs across
platforms, since builds subset embedded fonts differently. ADR 0007.

## Third import — `Prove It Resume - Redesign.dc.html`

Preserved at `design/reference/claude/Prove It Resume - Redesign.dc.html`
(sha256 `73052f8a…e1b90380`). Its own handoff band states the base it was cut from:
`qmarcelle/prove-it-resume @ 41defda · tokens.css unchanged`.

That commit matters. `41defda` is one commit _before_ `a1b3605`, which added the résumé
PDF and moved every evidence call to action onto the published sites. So the export
predates both, and two of its details are stale rather than intended:

- Its `INSPECT` blocks point at GitHub repositories. The repository's published-first
  rule — a reader lands on the site or docs a person can actually read, with the
  revision-pinned repository underneath as a citation — post-dates the cut and is
  enforced by `content.test.ts`. The redesign's _structure_ for those blocks was taken;
  their destinations come from the evidence records.
- Its résumé section defaults to `resumePending` with "ARTIFACT PENDING · NOT WIRED".
  Its own handoff band lists that copy for removal "once the PDF lands". It has, so the
  completion state is what was built.

The export is a partial redesign: four sections, not a new page. It states what it
keeps, changes, creates and removes, and that list was followed.

| Handoff                                                                                  | Outcome                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| KEEP `tokens.css` unchanged                                                              | Untouched. `--page-max` stays 1280px.                                                                                                                                                               |
| KEEP hero, evidence index, disclosure/link/boundary/ledger, receipts, server composition | Untouched.                                                                                                                                                                                          |
| MODIFY `VrekoArchitectureTrace` → containment diagram                                    | Done. Replaced the semantic zoom + hop stepper.                                                                                                                                                     |
| MODIFY `RepositoryDecisionDiff` → dark signature                                         | Done, via a token remap rather than a parallel stylesheet.                                                                                                                                          |
| MODIFY `InterlockCounterfactual` → one shared axis                                       | Done. Extracted as `BoundAxis`.                                                                                                                                                                     |
| MODIFY `ProofSection` → scan / proof layer split                                         | Done. Reduced to a shell; masthead moved into the sections.                                                                                                                                         |
| MODIFY `ResumeBridge` → completion state                                                 | Done.                                                                                                                                                                                               |
| CREATE `ChapterMark`, `HeldFixedRail`, `BoundAxis`, `ProofScan`                          | Done.                                                                                                                                                                                               |
| REMOVE `ArchitectureStrip`                                                               | Deleted.                                                                                                                                                                                            |
| REMOVE Vreko's downward trace list                                                       | Gone; hops are joined to the layer they cross into.                                                                                                                                                 |
| REMOVE "Résumé — not yet published" copy                                                 | Gone from the bridge.                                                                                                                                                                               |
| MODIFY `ProofNavProvider` scroll + focus targets                                         | **Not done.** Section ids and scroll offsets were unchanged by the redesign, and the existing rail tracked every section correctly after the port. Left alone rather than changed without a reason. |

### Deviations from this export

- **Measure held constant.** The export sets sections 02 and 04 at 1440px against the
  site's 1280px. Divergent width across adjacent sections reads as a seam; divergent
  _rhythm_ is the goal. Everything stays at `--page-max` and the differentiation is
  carried by scale, orientation, density and the one dark chapter. The Vreko containment
  row stacks cleanly at the narrower measure.
- **The dark chapter is a band, not the section.** The export's 03 contains only the
  HAC-152 experiment. The three-layer chain and the evidence panel below it carry
  evidence that cannot be dropped, and the export never showed those on dark, so the
  signature is inverted and the remainder stays on light ground. This also keeps the
  contrast budget at the one dark chapter the handoff allows.
- **The dark chapter is inset, not full-bleed.** The page measure and gutters belong to
  the layout shell, and reaching past them from inside a section would either change
  that shell or overlap the proof-progress rail beside it.
- **Three colours changed.** The export sets the chapter number in the rule colour and
  the flow arrows in the dashed-stroke colour. Both are stroke tokens; as text they
  measure 1.31:1 and 2.08:1 against canvas. Moved to the quietest text tokens that clear
  AA — the number to `--color-meta` (3.5:1, large text) and the arrows to
  `--color-ink-muted` (4.7:1).
- **LinkedIn kept in the résumé section.** The export shows one call to action there and
  is right about the hierarchy, so the PDF is the primary button and LinkedIn renders as
  the quiet second line rather than being dropped to the footer alone.
- **Résumé copy unchanged.** The export supplies new body copy for the completion state
  ("the format your ATS expects"). The existing copy was kept: what an applicant
  tracking system expects is not something this repository can verify, and an
  unverifiable claim in the one section about handing over a document would sit badly
  against the rest of the page.
- **No scan layer on 03 or 04.** The export has none on either. On 04 it would have been
  a one-cell grid in any case, because `interlock.fields` is empty.

## Fourth import — `Prove It Resume - Hero Concept B.dc.html`

Preserved at `design/reference/claude/Prove It Resume - Hero Concept B.dc.html`
(sha256 `4267530b…bac5419f`). Unlike the first three it was retrieved from the Claude
Design project rather than a download bundle, so that hash is of the file as committed
here.

**This is the second pass.** The first, "The Bounded Field", is kept alongside it as
`Prove It Resume - Hero Concept B (first pass).dc.html` (sha256 `edd40d1d…ff83a5a3`),
because ADR 0009 was written against it and because the second pass exists to fix it. The
export states the fault in its own words: the first version "resolved into two rules, a
black bar, and an amber square: abstract geometry that communicated craft and nothing
specific, and that lost its meaning the moment the motion stopped".

"The Bounded Path": a 108-frame, 30fps hero sequence, authored as a prototype for a
`.lottie` asset. Four dashed nodes settle onto one axis and connect left to right —
repository, evidence, agent, decision — a bracket rises to enclose the middle two, a node
outside it is excluded, and the decision fills as the only saturated mark on the stage.

Two things were taken from it.

**The sequence**, built as `BoundedField` — in CSS, not as an animation asset, on the
export's own recommendation that the prototype ships and the runtime decision waits for
real readers. Its governing rule is _geometry in SVG, labels in DOM_: nothing in the
drawing is a word, a number, or a claim, and the four station labels, the bracket's BOUND
label, and the per-beat caption are all DOM text positioned against the stage. It is the
fourth animated treatment on the page, which the interaction contract requires be decided
explicitly — `docs/decisions/0009-a-fourth-animated-treatment.md`.

**The concept marks**, in `src/components/concept`. The export's own "marks derived from
the settled frame" panel supplies four crops of the final composition, drawn at the same
weight and with the same dashed-to-solid convention. Three are placed: a bracketed pair on
`ClaimBoundary`, one node feeding another on the evidence panel's resolution count, and two
unconnected dashed nodes on a stated gap. The fourth, DECISION, is not — see the deviation
below.

Deviations from this import specifically:

- **The excluded node is excluded, as the export authored it.** The first pass shipped it
  held at 0.35 opacity rather than faded out, on the grounds that a hero which erases what
  it ruled out contradicts a page that types `boundary` as a kind of evidence. The second
  pass changes that argument's premise: its four stations are named and the stray is not,
  so at rest it is an unlabelled dashed box standing after the answer — the exact
  illegibility this pass was drawn to remove. The boundary itself is still rendered and
  still named, because the bracket and its BOUND label survive to the settled frame. Both
  variants remain behind one constant. Reasoning in ADR 0009.
- **DECISION is not vendored.** Its only natural home is `EvidenceStatus`, whose marks are
  inline-chip scale while these are card scale. Re-cutting that component is new geometry
  the export does not supply, and a vendored shape nothing uses is dead code. Recorded as
  an open decision in ADR 0008.
- **The marks lost their accent.** The settled frame spends its single accent on the
  decision node, and none of the three placed marks is a crop of that node, so the mark set
  is now monochrome — ink for a node or an edge, ink-tertiary for a bracket, border-dashed
  for what is unresolved.
- **The bracket is dropped on viewport width, the labels redistribute on stage width.**
  The export drops the bracket and the stray below 640px. That is kept as a viewport rule
  while the station layout stays a container rule, because a 1024px window gives this
  figure a 390px stage: the labels have to redistribute there, but the bracket is still
  perfectly legible, and gating both on stage width would throw away the B2 beat on an
  ordinary laptop.
- **Station labels give way before the type does.** Deviation 8 below set an 11.5px
  microtype floor and it holds here: where four mono words stop clearing their node
  columns, a container query switches them to an evenly distributed row — still in
  sequence order, which is the fact they carry — rather than shrinking the words.
- **No frame controls.** The export's prototype has a frame scrubber and a replay button
  for authoring. Its own export constraints say production has neither, and it does not.

## Content placeholders in the export

- Résumé PDF: **resolved.** The second import supplied the document; `pnpm resume:pdf`
  renders it. Originally: no file supplied, every résumé CTA pointed at `#resume`.
- LinkedIn and Email: point at `#resume`.
- "Professional work: Marcelle Labs ↗": points at `#`.
- The seven decision prompts have questions but no answers.
- Repository-plan-diff data (Plan A vs Plan B) does not exist in the export at all.

## Deviations from the export

Each is deliberate; rationale recorded here and, where structural, in `docs/decisions/`.

1. **Root page is organisation-neutral.** The export's default `roleOrg` is
   `"athenahealth / Yoh"`. Baking one employer into `/` would make the durable artifact
   look like a single application. `/` uses a neutral lens
   ("Staff / Principal · AI Platform & Developer Systems"); the supplied lens lives at
   `/role/athenahealth-yoh`. Instructed by the brief; ADR 0003.

2. **"Ask me to defend a decision" is a Decision Receipt, not a checkbox list.** The
   export collects selections and prints "N selected · bring these to the conversation",
   which asks the evaluator to do work and returns nothing. Replaced with a
   `DecisionReceipt` disclosure per question. No answers existed in the supplied
   material; they were recovered afterwards from the Linear issues and Fibery Open
   Questions that recorded each decision when it was made, and all seven are now
   answered. The _awaiting_ state remains the rendering for any future question without
   a record. No architectural reasoning was invented. ADR 0006.

3. **Résumé demoted.** The export gives "Open traditional résumé" a bordered button of
   nearly equal weight to "Walk the proof". Per the brief the hierarchy is
   `Walk the proof →` then `GitHub ↗ · Résumé ↓` as quiet secondary links. Résumé
   support is retained throughout; the CTA is disabled because no file was supplied.

4. **Inline styles became tokens + CSS Modules.** The export has ~700 inline `style`
   attributes and `style-hover` attributes, which is a Claude Design authoring
   affordance, not a production styling strategy. ADR 0002.

5. **Interlock counterfactual is interactive.** The export shows both arms statically
   side by side. Ported as an OFF/ON counterfactual so the _change_ is the thing on
   screen, which is the section's actual claim. The numbers (`140 > 130`,
   `WITHHOLD_SERIALIZE`, `120 ≤ 130`) are carried over from the export **and labelled
   as unverified prototype values**, because they are not yet bound to a published
   evidence packet.

6. **`RepositoryDecisionDiff` ships as structure only.** The export contains no plan-A/
   plan-B content. The component, its state machine, and its accessibility behaviour are
   implemented; it renders an explicit awaiting-evidence state. Nothing was invented.

7. **Desktop rail becomes a horizontal scroller on small screens.** The export's
   `position: sticky` rail with `flex: 1 1 180px` would consume roughly a third of a
   320px viewport before any content is visible. Below `900px` it becomes a compact
   sticky horizontal strip; the sticky/`aria-current` semantics are unchanged.

8. **Microtype raised.** The export uses `10.5px`–`11px` for boundary labels and status
   metadata. At those sizes the metadata reads as texture rather than information, which
   contradicts the thesis. Floor raised to `11.5px` with letter-spacing reduced from
   `0.09em` to `0.08em` at the smallest sizes. Visual density is preserved; the type is
   legible at normal laptop zoom.

9. **Header nav collapses.** The export's header wraps to three rows at 320px. The
   in-page nav is hidden below `760px`; the Evidence Index and the proof rail are the
   navigation on small screens.

10. **The page has an icon set; no export did.** All four canvases contain zero `<svg>`
    and no `stroke-width`: their entire mark vocabulary is borders, filled and outlined
    CSS boxes, and typographic Unicode. That vocabulary had become ambiguous — one `↓`
    was doing four unrelated jobs and one `↗` three — so fifteen shapes were vendored
    from Lucide for actions and destinations. They are drawn to this language rather
    than to Lucide's: square caps and mitre joins instead of round, and a stroke width
    computed as `24 / size` so every icon renders at exactly the 1px of `--rule`. The
    concept marks are separate and are crops of the fourth import's settled frame. Full
    reasoning in `docs/decisions/0008-vendored-icon-set.md`.

## The Linear Lens import — "The Lit Work Surface"

A sixth import, scoped to `/linear` only. Two files, both preserved at
`design/reference/claude/`:

| File                                    | Treatment                                                                     |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| `Prove It Resume - Linear Lens.dc.html` | **Primary.** Four desktop frames and three mobile frames of the lens surface. |
| `Linear Lens - Design Spec.dc.html`     | The written specification: tokens, disposition, interaction, a11y, handoff.   |

The direction, in the spec's own words:

> **The Lit Work Surface** — "A warm charcoal field where nothing is boxed by default,
> structure comes from alignment and tonal steps, and the only saturated mark on the page
> is the one place evidence has been verified. Depth is a control you press, never a hover
> you discover."

### How it is implemented

As a palette swap at the composition root, not a dark variant of anything. The
`--lens-*` scale sits beside the light tokens in `tokens.css`, and
`LensSurface.module.css` remaps the existing `--color-*` names onto it for the whole
subtree. Every component below already reads those names, so the evidence panels, the
disclosure controls, the decision diff, the counterfactual axis, the claim ledger, the
header and the footer all invert without a parallel stylesheet — including components
written later.

This is the technique `ProofSignature` already uses for the durable page's one dark
chapter, which is also why the `--color-inverse-*` pair is remapped here: the signature
block reads that pair rather than raw hexes, so it lands inside this palette instead of
importing the light page's graphite into a charcoal field.

The generic `/` surface is unchanged. That is asserted rather than claimed: `/`,
`/role/athenahealth-yoh`, `/role/end-to-end-delivery` and `/resume/print` render
byte-identical full-page screenshots with and without the one shared-CSS change this
import required, and neither `/` nor the role routes emit any lens or section-frame
markup at all.

### Deviations from the supplied direction

1. **Section numbers are legible.** The frames set the index at `#2F2D29` — 1.37:1 on
   the canvas, an ornament rather than a number. This surface's numbers had to become
   countable, since the defect being fixed was a page whose visible sequence disagreed
   with itself, so `--lens-index` is the quietest tone still clearing 3:1 on both the
   canvas and the band.

2. **Metadata lifted one step.** The spec calls `#8B867D` "the floor" at 5.2:1, which is
   measured against the canvas alone; the same grey is 4.3:1 on `--lens-surface-active`,
   where controls sit. Raised to `#968F86`, which clears AA on every surface in the
   scale. The tonal ladder and the amber budget are unchanged.

3. **The strong rule stays neutral.** `--rule-strong` appears at fourteen block tops.
   Mapping it to the amber edge would have spent the page's one saturated mark on
   section furniture and left a reader unable to tell a structural line from a verified
   one, so it maps to the most raised border instead.

4. **Bands are inset, not full-bleed.** The measure and the gutters belong to the layout
   shell, and a full-bleed section would overlap the progress rail beside it. The band
   bleeds by exactly its own padding and pulls its content back, so the ground changes
   without the content origin moving.

5. **Vreko keeps its evidence.** The disposition table marks `VrekoArchitectureTrace`
   REMOVE and reduces Vreko to one row of platform depth. A lens may reorder evidence
   and may not remove it, so the section keeps its diagram, its recorded contradictions
   and its boundary; the demotion is carried by the `inline` frame.

6. **The section content is the current content.** The frames also propose new material
   — a four-stage progression with an audience and discipline grid, three receipts
   redrawn as a dimension table, responsibility lanes and a lifecycle sequence, a
   session-pair figure, cumulative depth 1–4 controls, six product-judgment rules. None
   of that is implemented here. This pass reconciles the existing surface's structure
   and treatment against the direction; the content model those figures would need is
   not built, and inventing it to fill a frame is the move this site argues against.

7. **`showAvailability` stays true.** The spec's handoff sets it false. The banner is a
   per-lens flag and the lens is addressed to a reader for whom availability is
   material, so the existing value is kept.

### One shared primitive changed

`--color-action-fill` / `--color-action-ink` / `--color-action-ink-quiet`. Three filled
buttons — the hero's primary, the final call to action, the résumé download — reached for
`--color-ink` as a fill and assumed it was dark. That assumption held on every light
surface and produced cream type on a cream fill the moment one inverted. Naming the fill
and its ink as a pair lets a surface answer with whatever its strongest mark is: ink on
the light page, amber on the lens. The light values resolve to exactly what those rules
resolved to before, which is what the screenshot comparison above verifies.

## Ambiguities requiring later review

- Whether `github.com/qmarcelle` should remain the header/hero link once per-repository
  URLs exist, or be replaced by the specific repositories.
- Whether the availability banner should be content-managed or removed before a real
  application; it is currently a per-role flag, on by default, as in the export.
- Whether "REV 2026.08" in the Evidence Index should be derived from a build stamp. It
  is currently a static content value taken from the export.
- Whether the Never Ask Twice supporting entry belongs above or below the Claim Ledger.
  The export places it above; that ordering was kept.
- Whether `EvidenceStatus`'s three tone marks should be re-cut in the concept-mark
  grammar, so the page carries one abstract vocabulary rather than two. It needs
  chip-scale geometry the fourth import does not supply. See ADR 0008.
