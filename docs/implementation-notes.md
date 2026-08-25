# Implementation notes

What the major boundaries are and why they are where they are. Written to be defensible
in a technical conversation, not to be comprehensive.

## Architecture at a glance

```
src/
  app/                    routes; all statically rendered
    page.tsx              the durable evidence surface
    role/[slug]/page.tsx  the same surface, projected through a role lens
  components/             presentation only; no content lives here
  content/                the durable proof, claims, decisions, and role lenses
  lib/                    types, the evidence rule, lens projection, proof steps
  styles/tokens.css       the design language as custom properties
design/reference/claude/  the original Claude Design export, preserved unmodified
```

The load-bearing idea: **content is data, presentation is components, and a role lens is
a projection over the data.** Everything else follows from that.

## Content model

`src/lib/types.ts` defines `EvidenceRef`, `Proof`, `Claim`, `DecisionReceipt`, and
`RoleLens`. Two choices in there are worth defending:

**`boundary` is required on `Proof`.** A proof that does not state what it fails to
establish will not compile. On a site whose argument is that claims should be
inspectable, that constraint belongs in the type rather than in a review checklist.

**`EvidenceKind` includes `'boundary'`.** What a piece of evidence does not show is
evidence about the claim. Typing it separately would let it drift out of view, which is
exactly how boundaries get quietly dropped.

Sections are deliberately _not_ driven by one generic template. The three proofs make
different arguments — a shipped system, a three-layer standard, a controlled experiment —
and each earns its own middle. What is shared is the header, the column structure, and
the field/list/tag primitives in `ProofSection.tsx`, which is what keeps the page reading
as one document.

## The evidence rule

`src/lib/evidence.ts` holds the only function that can produce an evidence link:

```ts
resolveEvidence({ href, verified }); // → { status: 'resolved', href } | { status: 'unresolved' }
```

A row links only when it has a destination **and** that destination has been confirmed to
be the artifact the row names. `EvidenceLink` is the sole component that renders a CTA,
and it takes a record rather than an href — there is no prop that lets a caller supply a
raw URL or force the resolved branch.

This matters because the failure mode is invisible. A broken evidence link does not look
broken; it looks like working evidence until someone clicks it and lands on a profile
page. Two things guard it: the type shape, and tests in `src/content/content.test.ts`
that assert no record points at the bare GitHub profile or at an on-page anchor — the two
ways the design draft produced links that looked like evidence and were not.

Panels report their own honesty — "8 of 8 evidence items resolve to an inspectable
artifact" — which is more useful to a skeptic than an unqualified "evidence source" line,
and which moves when the evidence does. It read "0 of 8" until the artifacts existed.

## Role lenses

A `RoleLens` carries a title, an organisation, a proof ordering, and a mapping ordering.
It carries no proof content, so it structurally cannot change a claim. `/` and
`/role/[slug]` render the same `ProveItResume` component with a different lens — one
composition, so there is no second page to drift.

Two defensive details:

- `projectProofs` **appends** any proof a lens omits rather than dropping it, so a
  projection cannot quietly hide evidence.
- `prioritiseMapping` **reorders shared rows** rather than copying them, and
  deduplicates. A copied row is a row that can go stale against the evidence it describes.

An unknown slug 404s rather than falling back to the default lens, which would serve a
different projection under the URL the reader asked for.

Role routes are `noindex`, canonical to `/`, and absent from the sitemap: they are
projections of one work, and indexing them would advertise every open application.

## Client/server boundary

Server Components by default. `"use client"` appears in twelve files:

| File                      | Why it needs the client                                            |
| ------------------------- | ------------------------------------------------------------------ |
| `ProofNavProvider`        | Holds active-stage and guided state; runs the IntersectionObserver |
| `ProofProgress`           | Reads active stage, scrolls on click                               |
| `GuidedProofNav`          | Reads and drives guided state                                      |
| `WalkProofButton`         | Enters guided mode                                                 |
| `EvidenceDisclosure`      | Open/closed state                                                  |
| `ClaimLedger`             | Open/closed state                                                  |
| `DecisionReceipt`         | Open/closed state                                                  |
| `InterlockCounterfactual` | Stage selection and the perturbation control                       |
| `RepositoryDecisionDiff`  | Disclosure stage                                                   |
| `VrekoArchitectureTrace`  | Zoom level, per-container disclosure, trace position               |
| `StepControl`             | Roving tabindex and arrow-key handling                             |
| `useDeepLinkedState`      | Reads and writes the query string                                  |

The pattern that makes this work is `ProofNavProvider` rendering `children` untouched:
server-rendered sections pass _through_ the client provider without crossing the
boundary. The hero is a Server Component containing one client button, rather than a
client component because it contains a button.

Consequence worth stating: **the page works before hydration.** The evidence index,
in-page nav, section anchors, skip link, and every outbound link are ordinary HTML. The
rail and guided mode are enhancements on top.

## Navigation state

Three distant components need the same state — the rail, the hero button, and the guided
dock — so it lives in a context rather than being drilled (which server sections in
between would make impossible anyway).

The IntersectionObserver parameters are ported verbatim from the design export's
`DCLogic` class: `rootMargin: '-45% 0px -50% 0px'`, `threshold: 0`. That band treats the
middle sliver of the viewport as "here", so the rail changes when a section reaches
reading position rather than when its top edge appears. The `- 92px` scroll offset is
likewise carried over.

`goTo` sets the active index immediately instead of waiting for the observer, so the rail
responds to a click even when the scroll is interrupted or the target is already in view.

Guided mode is strictly additive: no scroll-jacking, no slides, no wheel capture.
Scrolling, anchors, and every other affordance keep working while it is on, and exiting
leaves the reader where they are.

## Styling

Tokens in `src/styles/tokens.css`, CSS Modules per component. No Tailwind, no component
library — the visual language is bespoke and already specified, and a generic library
would have to be fought rather than used.

The token file has a rule: a value belongs there when it carries meaning that repeats. A
one-off measurement stays in the component's module. Otherwise a token file becomes a
second, worse copy of the stylesheet.

**One deliberate change to the design's colours.** `#83817A` and `#A5A29A` are the
export's metadata greys, and both fail WCAG AA on this canvas (3.90:1 and 2.55:1 against
white). On a page arguing that evidence metadata should be easy to retrieve, metadata
that cannot be read is a contradiction. The quiet ladder was retuned so every step clears
4.5:1 on every light surface it appears on, and the four-step hierarchy is preserved:

| Token                | Was       | Now       | Contrast (worst light surface) |
| -------------------- | --------- | --------- | ------------------------------ |
| `--color-ink-muted`  | `#6E6C64` | `#5E5C55` | 5.87:1                         |
| `--color-meta`       | `#83817A` | `#66645D` | 5.19:1                         |
| `--color-meta-quiet` | `#A5A29A` | `#6E6C64` | 4.61:1                         |

On dark surfaces the same tokens would get _worse_ if darkened, so those usages switch to
the inverse scale instead.

Microtype was also raised from the export's 10.5–11px floor to 11.5px, with tracking
eased from `0.09em` to `0.08em` at the smallest sizes. Wide tracking on tiny uppercase
type is what makes it unreadable; the density is preserved, the texture-vs-information
problem is not.

## Accessibility

Treated as a gate, not a cleanup pass — `pnpm test:e2e` runs axe-core against the durable
page, a role lens, and the page with every disclosure open, at desktop and at 320px.

Decisions worth naming:

- **Tables where the data is tabular.** The Claim Ledger and the role evidence map are
  real `<table>`s with headers and captions. The design's flexbox rows looked identical
  and conveyed none of the relationships.
- **Status is never colour alone.** Each `EvidenceStatus` tone has its own glyph shape as
  well as its own colour.
- **Scrollable regions are focusable.** Every horizontally scrolling container has
  `tabIndex={0}` and a named `role="region"`; otherwise its content is unreachable
  without a pointer. In `ArchitectureStrip` the focus stop is on a wrapper rather than the
  `<ol>`, because `role="region"` on the list would replace the list semantics — and the
  sequence is the content there.
- **New tabs are announced**, via visually hidden text on every outbound link.
- **The guided dock announces position politely**, because scrolling alone tells a
  screen-reader user nothing about where NEXT took them.
- **Unresolved evidence explains itself** to assistive technology, not just visually.

## Responsive

The export uses flex bases rather than media queries and reflows naturally. That intent
is kept; media queries appear only where flex cannot express the change:

- **Below 900px the proof rail becomes a sticky horizontal strip.** As a vertical rail it
  would consume roughly a third of a 320px viewport before any evidence appeared. The
  sticky behaviour and `aria-current` semantics are unchanged; only the axis is.
- **The header releases its stickiness at the same breakpoint.** Two stacked sticky
  elements would either overlap or eat the viewport, so the header scrolls away and the
  rail — the navigation you actually want while reading — is the one that stays.
- **The in-page nav hides below 760px**, where it wrapped the header to three rows. The
  Evidence Index and the rail are better navigation on a small screen anyway.
- **Wide content scrolls inside its own container.** A test asserts zero page-level
  horizontal overflow at 320, 375, 768, 1024, and 1440 with every disclosure open.

## Testing

- **Unit and component** (`vitest`, 100 tests): the evidence rule, lens projection,
  content integrity, the render behaviour that depends on verification state, the three
  interactions' state machines, and integrity of the bound experiment data. No snapshot
  tests — they would pin the markup without asserting anything true.
- **Browser** (`playwright`, 110 tests across desktop and a 320px viewport): page loads,
  section presence, guided navigation, rail tracking, disclosures, role-lens resolution
  and 404, keyboard reachability, focus visibility, reduced motion, overflow at five
  widths with every interaction open, and axe-core accessibility on five page states
  including the interacting ones.

`src/test/setup.ts` resets `window.history` between tests. The interactions reflect their
stage into the query string, and jsdom keeps one history per file — without the reset, a
test that steps an interaction forward leaves the next one mounted already advanced,
which looks like a component bug and is not one.

The browser suite runs against a real production build, because static output, hydration,
and layout differ between `next dev` and `next build`, and it is the built artifact that
ships.

One test is worth calling out: `content.test.ts` asserts that every decision receipt
carries a `decision` _and_ its `constraint`, `tradeoff`, and `wouldChangeIf`. It
previously asserted the opposite — that no receipt carried a `decision` — so that
populating one had to be a conscious change rather than something that slid in. It was
inverted when the receipts were answered from the decision record (ADR 0006). A receipt
that states a decision without its cost now fails the suite.

## The three interactions

`docs/interaction-contract.md` holds the durable rules; three notes belong here because
they are architectural rather than behavioural.

**No animation dependency was added.** Every transition is a CSS transition or keyframe.
`motion` was considered and rejected: nothing here needs layout animation or
interruptible physics, and the page budget is better spent elsewhere. `dependencies` is
still exactly `next`, `react`, `react-dom`.

**Animation is not the state model.** Each interaction is a state machine with named,
addressable states; animation interpolates between them. Every state renders correctly
with animation fully disabled, which is what makes the reduced-motion path a CSS-only
concern with no JavaScript branch to desynchronise.

**The data model follows the evidence, not the design.** `src/lib/interactions.ts` was
written after the frozen artifacts were read. The clearest case: `DecisionEvidence.kind`
is an open string rather than a union, because the run the diff is bound to contains no
co-change evidence at all — the taxonomy the design assumed would be load-bearing was
absent, and a type built around it could not have displayed the real result.

## Dependency choices

Two places where _latest_ and _latest compatible_ diverge, both pinned on purpose:

| Package      | Latest | Chosen     | Why                                                                                                                                                |
| ------------ | ------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript` | 7.0.2  | **6.0.3**  | `eslint-config-next@16.3.2` depends on `typescript-eslint@^8.46`, which peers `typescript >=4.8.4 <6.1.0`. TypeScript 7 breaks the lint toolchain. |
| `eslint`     | 10.9.1 | **9.39.5** | `eslint-plugin-import`, `eslint-plugin-react`, and `eslint-plugin-jsx-a11y` all still cap at `eslint ^9`.                                          |

Everything else is the current stable release. `pnpm install` produces no peer warnings.

Next.js 16 notes that shaped the code: `next lint` is gone (ESLint CLI with flat config
instead), the `eslint` key is gone from `next.config`, and request APIs are async — hence
`await params` in the role route.

## Unresolved decisions

- Whether `github.com/qmarcelle` stays as the header/hero link once per-repository URLs
  exist, or is replaced by the specific repositories.
- Whether the availability banner should be content-managed or removed before a real
  application. It is currently a per-lens flag, on by default, as in the export.
- Whether `REV 2026.08` should be derived from a build stamp rather than being a content
  string.
- Whether `SupportingEvidence` belongs above or below the Claim Ledger. The export places
  it above; that ordering was kept without strong conviction.
- Whether `RepositoryDecisionDiff` should live in the Repository Intelligence section or
  become its own stage once it has real data. It is currently in section 03, where its
  claim is made.
