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

## Content placeholders in the export

- Résumé PDF: no file supplied; every résumé CTA points at `#resume`.
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
   `DecisionReceipt` disclosure per question. Because no answers exist in the supplied
   material, every receipt renders in an explicit _awaiting_ state — the question, the
   receipt's shape, and a stated gap. No architectural reasoning was invented. ADR 0006.

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

## Ambiguities requiring later review

- Whether `github.com/qmarcelle` should remain the header/hero link once per-repository
  URLs exist, or be replaced by the specific repositories.
- Whether the availability banner should be content-managed or removed before a real
  application; it is currently a per-role flag, on by default, as in the export.
- Whether "REV 2026.08" in the Evidence Index should be derived from a build stamp. It
  is currently a static content value taken from the export.
- Whether the Never Ask Twice supporting entry belongs above or below the Claim Ledger.
  The export places it above; that ordering was kept.
