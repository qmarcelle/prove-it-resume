# Implementation notes

What the major boundaries are and why they are where they are. Written to be defensible
in a technical conversation, not to be comprehensive.

## Architecture at a glance

```
src/
  app/                    routes; all statically rendered
    page.tsx              the durable evidence surface
    role/[slug]/page.tsx  the same surface, projected through a role lens
    linear/page.tsx       an application surface: its own composition, same evidence
    resume/print/         the print sources the PDFs are rendered from
  components/             presentation only; no content lives here
    resume/parts/         print primitives shared by both résumé layouts
    resume/layouts/       the two explicit two-page compositions
    application/          sections that exist only on an application surface
  content/                the durable proof, claims, decisions, and lenses
    resume/facts.ts       durable résumé facts; projections/ selects over them
    applications/         application lenses
    linear/receipts.ts    curated public receipts from a private workspace
  lib/                    types, the evidence rule, lens projection, proof steps
  styles/tokens.css       the design language as custom properties
design/reference/claude/  the original Claude Design export, preserved unmodified
```

The load-bearing idea: **content is data, presentation is components, and a lens is a
projection over the data.** Everything else follows from that; including the résumé,
whose facts and projections are separated for the same reason.

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
different arguments (a shipped system, a three-layer standard, a controlled experiment)
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
and it takes a record rather than an href; there is no prop that lets a caller supply a
raw URL or force the resolved branch.

This matters because the failure mode is invisible. A broken evidence link does not look
broken; it looks like working evidence until someone clicks it and lands on a profile
page. Two things guard it: the type shape, and tests in `src/content/content.test.ts`
that assert no record points at the bare GitHub profile or at an on-page anchor; the two
ways the design draft produced links that looked like evidence and were not.

Panels report their own honesty ("8 of 8 evidence items resolve to an inspectable
artifact") which is more useful to a skeptic than an unqualified "evidence source" line,
and which moves when the evidence does. It read "0 of 8" until the artifacts existed.

## Role lenses

A `RoleLens` carries a title, an organisation, a proof ordering, and a mapping ordering.
It carries no proof content, so it structurally cannot change a claim. `/` and
`/role/[slug]` render the same `ProveItResume` component with a different lens; one
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

## Application lenses

A role lens is generic: it says "read this for a platform role". An `ApplicationLens` is
addressed to one organisation, owns a route of its own (`/linear`, not `/role/linear`),
and carries what a generic lens has no business carrying: a public path, hero framing, a
page plan, section copy, and curated receipts. Bolting those onto `RoleLens` as optional
fields would leave every generic lens holding five nulls and make "does this lens own a
page?" a question you answer by reading the object rather than its type.

Both are `SurfaceLens`, and `AnyLens` is the discriminated union of the two. A component
that takes `SurfaceLens` is one that treats both kinds identically, which is most of
them, and is the property this design is trying to keep.

The registries stay separate, and that is the point. `generateStaticParams` for
`/role/[slug]` walks `ROLE_LENSES` only, and `dynamicParams: false` turns `/role/linear`
into a 404 rather than a second public address for the same application. Everything
downstream of routing walks `ALL_LENSES` instead: the résumé manifest, the PDF build, the
download resolver, and the content tests. Registering an application lens therefore
produces a print route, a PDF, a manifest entry, and a robots disallow with no edit
anywhere else.

`/linear` is a second composition (`ApplicationSurface`) rather than a flag on
`ProveItResume`. The two differ in which sections appear, in what order, and what opens
the page; encoding that as branches inside one component produces a file where every
second line asks which surface it is on. Everything below the section level is shared,
which is where duplication would actually cost something.

`ProofNavProvider` takes its stages as a prop, defaulting to `PROOF_STEPS`, so the rail on
an application surface maps the page in front of the reader rather than the durable six.

## Résumé facts and projections

`content/resume/facts.ts` holds what is true: identity, the employment chronology with
individually addressable bullets, the systems, grouped capabilities, and credentials. A
projection in `content/resume/projections/` is a set of selections over ids plus framing
copy, which systems, in what order; which of a role's bullets, in what order; what to
call each block. It has no field in which to put a fact.

`resolveResume` applies one and **throws** on an id that no longer exists. A projection
whose selection has gone stale has quietly stopped saying what its author meant, and on a
fixed page box that failure is otherwise a gap nobody notices.

Four invariants are executable rather than intended:

- every bullet a projection renders exists verbatim in the fact corpus;
- every number a projection prints (framing prose and selected bullets alike) is in
  `RESUME_QUANTITIES`, so a figure cannot quietly grow for a reader who would prefer a
  bigger one, and "14 engineers plus 10 contractors" cannot collapse into "24 reports";
- career duration is stated only in the one durable phrasing, and the retired
  "8 years in technology" (which the 2016–2026 employment row contradicts) fails
  outright;
- no projection names a fact recorded in `UNVERIFIED`;
- every grouped capability also appears in the durable stack line, a system's tool chain,
  or a role bullet.

`UNVERIFIED` is the other half of that, and it is now empty. It held three entries for
most of this project: no established frontend framework, no per-audience product
ownership, and a title-only 2016–2019. Each was true of the record as supplied, each
rendered on the application surface as an open question rather than being dropped, and
each has since been answered by the owner. Removing a gap once it is genuinely answered
is the same discipline as recording it: a page that keeps asking a question it can answer
misleads as surely as one that answers a question it cannot.

The mechanism stays wired. `HistoryRecord.unresolved` still resolves against the list,
and `ProductHistorySection.test.tsx` renders an unresolved fixture through the component,
so the dashed treatment still works for the next question the corpus cannot answer.

`ownership` on `ResumeBullet` is the newer half. One career contains applications this
person wrote and a portal estate a team of fourteen delivered, and on a two-page sheet
those sit three lines apart in the same typeface. A `team` bullet has to attribute to the
team in its own words and may not open on an authorship verb, so a projection cannot
promote team work into personal work without editing a durable string.

`ResumeDocument` is now a shell that resolves a projection and picks one of two explicit
layouts. The layouts are written out rather than generated from a block list: there are
exactly two, there is no third coming, and an interpreter plus a schema would trade a file
anyone can read against the printed sheet for machinery nobody would.

## The private workspace boundary

`content/linear/receipts.ts` is the only channel between a private Linear workspace and
this site. It exports a fixed array whose every field was written for publication rather
than extracted: an identifier, the question, the finding, a status, a required boundary,
and the date the summary was last checked. No fetch, no credential, no workspace URL.

Receipts carry no link, and that is the honest rendering. No public artifact stands behind
them, so under this site's own evidence rule they are stated claims, and they render the
same `[VERIFY BEFORE PUBLISHING]` marker as any other unresolved row.

The seam for a future live integration is documented and deliberately unbuilt:

```
private Linear API → hard-coded issue allowlist → build-time sanitiser
→ LinearReceipt[] → page
```

Never browser → private workspace. `src/content/linear/linear.test.ts` scans all of
`src/` for a workspace host or an API credential, and `tests/e2e/application.spec.ts`
scans the served HTML and every rendered `href`: the artifact that actually leaves the
building.

## Client/server boundary

Server Components by default. `"use client"` appears in fourteen files:

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
| `useDeepLinkedState`      | Reads the query string on mount; publishes state to the registry   |
| `BoundedField`            | Rewinds the hero composition and plays its beats                   |
| `CopyableCommand`         | Writes a re-check command to the clipboard, and reports the result |

The pattern that makes this work is `ProofNavProvider` rendering `children` untouched:
server-rendered sections pass _through_ the client provider without crossing the
boundary. The hero is a Server Component containing one client button, rather than a
client component because it contains a button.

Consequence worth stating: **the page works before hydration.** The evidence index,
in-page nav, section anchors, skip link, and every outbound link are ordinary HTML. The
rail and guided mode are enhancements on top.

## Navigation state

Three distant components need the same state (the rail, the hero button, and the guided
dock) so it lives in a context rather than being drilled (which server sections in
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
library: the visual language is bespoke and already specified, and a generic library
would have to be fought rather than used.

The token file has a rule: a value belongs there when it carries meaning that repeats. A
one-off measurement stays in the component's module. Otherwise a token file becomes a
second, worse copy of the stylesheet.

## Two mark vocabularies

A pictogram is something you can **do**; an abstract mark is something you should
**understand**. Nothing appears in both sets, and a reader infers the split without being
told.

**Actions**: `src/components/icon`. Fifteen shapes vendored from `lucide-react@0.575.0`
(ISC), extracted programmatically rather than transcribed. Drawn to this page's language
rather than to Lucide's: square caps, mitre joins, and a stroke width of `24 / size` so
every icon renders at exactly the 1px of `--rule` at any of its three sizes. Call sites
name an `Affordance`, never a shape, and `semantics.test.ts` fails if one icon ever
carries two meanings. ADR 0008.

**Concepts**: `src/components/concept`. Three crops of the hero composition's settled
frame, at the weights the export drew them. The reader meets that geometry once, moving,
before meeting pieces of it beside the claims it describes.

Both are `aria-hidden` with `focusable="false"`, and neither ever replaces a word. "Change
is never colour alone" generalises: it is never _mark_ alone either.

`EvidenceStatus` still carries its own three chip-scale marks and was deliberately not
folded into either set; see the open question at the end of `docs/design-import.md`.

No new colour tokens. Everything inherits `currentColor` or an existing token, so a mark
inside a dark panel inverts with the text around it.

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

Treated as a gate, not a cleanup pass: `pnpm test:e2e` runs axe-core against the durable
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
  `<ol>`, because `role="region"` on the list would replace the list semantics, and the
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
  rail (the navigation you actually want while reading) is the one that stays.
- **The in-page nav hides below 760px**, where it wrapped the header to three rows. The
  Evidence Index and the rail are better navigation on a small screen anyway.
- **Wide content scrolls inside its own container.** A test asserts zero page-level
  horizontal overflow at 320, 375, 768, 1024, and 1440 with every disclosure open.

## Testing

- **Unit and component** (`vitest`, 100 tests): the evidence rule, lens projection,
  content integrity, the render behaviour that depends on verification state, the three
  interactions' state machines, and integrity of the bound experiment data. No snapshot
  tests; they would pin the markup without asserting anything true.
- **Browser** (`playwright`, 110 tests across desktop and a 320px viewport): page loads,
  section presence, guided navigation, rail tracking, disclosures, role-lens resolution
  and 404, keyboard reachability, focus visibility, reduced motion, overflow at five
  widths with every interaction open, and axe-core accessibility on five page states
  including the interacting ones.

`src/test/setup.ts` resets `window.history` between tests. The interactions reflect their
stage into the query string, and jsdom keeps one history per file: without the reset, a
test that steps an interaction forward leaves the next one mounted already advanced,
which looks like a component bug and is not one.

The browser suite runs against a real production build, because static output, hydration,
and layout differ between `next dev` and `next build`, and it is the built artifact that
ships.

One test is worth calling out: `content.test.ts` asserts that every decision receipt
carries a `decision` _and_ its `constraint`, `tradeoff`, and `wouldChangeIf`. It
previously asserted the opposite (that no receipt carried a `decision`) so that
populating one had to be a conscious change rather than something that slid in. It was
inverted when the receipts were answered from the decision record (ADR 0006). A receipt
that states a decision without its cost now fails the suite.

## The animated surfaces

`docs/interaction-contract.md` holds the durable rules; these notes belong here because
they are architectural rather than behavioural.

There are four: the three progressive disclosures, and the hero composition. The fourth
was admitted deliberately, with a motion category named per beat, in ADR 0009.

**No animation dependency was added.** Every transition is a CSS transition or keyframe.
`motion` was considered and rejected: nothing here needs layout animation or
interruptible physics, and the page budget is better spent elsewhere. The hero arrived as
a prototype for a `.lottie` asset and ships as CSS for the same reason: the runtime buys
easing curves the sequence does not need yet. `dependencies` is still exactly `next`,
`react`, `react-dom`.

**The hero's prerendered HTML is its settled frame.** `BoundedField` renders the finished
composition as its initial state and the sequence is a rewind: an effect drops back to the
first beat and plays forward, across two animation frames so the jump back happens with
transitions unattached. No JavaScript, reduced motion, and the end of the sequence are
therefore the same picture rather than three different ones.

**Animation is not the state model.** Each interaction is a state machine with named,
addressable states; animation interpolates between them. Every state renders correctly
with animation fully disabled, which is what makes the reduced-motion path a CSS-only
concern with no JavaScript branch to desynchronise.

**The data model follows the evidence, not the design.** `src/lib/interactions.ts` was
written after the frozen artifacts were read. The clearest case: `DecisionEvidence.kind`
is an open string rather than a union, because the run the diff is bound to contains no
co-change evidence at all; the taxonomy the design assumed would be load-bearing was
absent, and a type built around it could not have displayed the real result.

## Dependency choices

Two places where _latest_ and _latest compatible_ diverge, both pinned on purpose:

| Package      | Latest | Chosen     | Why                                                                                                                                                |
| ------------ | ------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript` | 7.0.2  | **6.0.3**  | `eslint-config-next@16.3.2` depends on `typescript-eslint@^8.46`, which peers `typescript >=4.8.4 <6.1.0`. TypeScript 7 breaks the lint toolchain. |
| `eslint`     | 10.9.1 | **9.39.5** | `eslint-plugin-import`, `eslint-plugin-react`, and `eslint-plugin-jsx-a11y` all still cap at `eslint ^9`.                                          |

Everything else is the current stable release. `pnpm install` produces no peer warnings.

Next.js 16 notes that shaped the code: `next lint` is gone (ESLint CLI with flat config
instead), the `eslint` key is gone from `next.config`, and request APIs are async; hence
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
- The proof rail on `/role/end-to-end-delivery` still lists the durable stage order while
  the body renders the lens's order, so the rail and the page disagree there. `/linear`
  does not have the problem because its rail is driven by the lens's page plan; the fix
  for role lenses is to derive `PROOF_STEPS` from `proofOrder` the same way, and it was
  left out of this change rather than widened into it.
- Whether a second application lens should share `ApplicationSurface` or get its own
  composition. One surface is not enough evidence to decide; the section components are
  already parameterised by lens copy, so either is cheap.
