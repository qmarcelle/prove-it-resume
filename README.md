# Prove It Resume

A technical evidence surface for hiring decisions.

> **Important evidence should be easy to find at decision time.**

An artifact that lets an evaluator understand, inspect, and challenge evidence of senior
engineering capability, rather than reading a conventional résumé and taking it on faith.
A résumé asks to be believed. This asks to be checked.

Three engineering claims carry it, each with multiple independent receipts:

|        | Claim                                                                      | Status                              |
| ------ | -------------------------------------------------------------------------- | ----------------------------------- |
| **01** | **Vreko**: MCP and codebase intelligence for agentic development workflows | Shipped system                      |
| **02** | **Repository Intelligence**: `workspace.json` → Codex → Tally              | Standard · implemented · integrated |
| **03** | **Interlock**: can environment evidence change a coordination decision?    | Controlled evidence                 |

Not a portfolio of six side projects. Three arguments, with the evidence for each and an
explicit statement of what that evidence does _not_ establish. A fourth system, **Never
Ask Twice**, is supporting work on `/` and leads the evidence on `/linear`: application
surfaces may reorder what is emphasised, never what is claimed.

The implementation is part of the evidence. The architecture, accessibility, tests, and
the decisions behind them are meant to hold up to inspection.

## Start here

| If you want to                   | Open                                                                                                                                                                                                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Understand the system            | **Architecture** below, then [`docs/decisions/`](docs/decisions/)                                                                                                                                                                                           |
| Inspect `/linear`                | [`src/app/linear/page.tsx`](src/app/linear/page.tsx) → [`ApplicationSurface`](src/components/ApplicationSurface.tsx) → [`content/applications/linear.ts`](src/content/applications/linear.ts)                                                               |
| Inspect evidence integrity       | [`src/lib/evidence.ts`](src/lib/evidence.ts) and [`src/content/content.test.ts`](src/content/content.test.ts)                                                                                                                                               |
| Inspect the résumé pipeline      | [`content/resume/facts.ts`](src/content/resume/facts.ts) + [`projections/`](src/content/resume/projections/), built by [`scripts/build-resume-pdf.mts`](scripts/build-resume-pdf.mts). See [ADR 0007](docs/decisions/0007-resume-pdf-generated-at-build.md) |
| Know why any of it is like it is | [`docs/decisions/`](docs/decisions/): indexed, with the rejected alternatives                                                                                                                                                                               |

## Architecture

```
src/
  app/                    routes, all statically rendered
    page.tsx              the durable evidence surface
    role/[slug]/page.tsx  the same surface, projected through a role lens
                          (athenahealth-yoh, end-to-end-delivery)
    linear/page.tsx       an application surface, its own composition,
                          the same evidence
    resume/print/         the print sources the PDFs are rendered from
  components/             presentation; no content lives here
    resume/parts/         print primitives
    resume/layouts/       the two explicit résumé compositions
    application/          sections that exist only on an application surface
  content/                durable proof, claims, decisions, lenses
    experiments/          the frozen runs the interactions are bound to
    resume/facts.ts       the durable résumé fact corpus
    resume/projections/   what a given reader should see first
    applications/         application lenses, including each one's page plan
    linear/receipts.ts    curated public receipts from a private workspace
  lib/                    types, the evidence rule, lens projection
  styles/tokens.css       the design language as custom properties
design/reference/claude/  the original design export, preserved unmodified
docs/                     ADRs and the working notes behind them
```

**Content is data.** Proofs, claims, and boundaries live in typed modules under
`src/content/`, not inside JSX. `boundary` is a required field on `Proof`, so a proof
cannot ship without stating its limits. See [ADR 0002](docs/decisions/0002-proof-content-as-data.md)

**Lenses are projections, not forks.** A lens may reorder and reframe; it holds no proof
content, so it structurally cannot change a claim. A test asserts that every row in every
lens exists _verbatim_ in the durable mapping. `/linear` is a first-class route addressed
to one organisation, sharing the evidence, the tokens, the evidence rule, the
interactions, the PDF pipeline and the deploy: `ApplicationLens` is a separate registry
from `RoleLens`, so `/role/linear` 404s by construction. See [ADR 0003](docs/decisions/0003-role-lenses-as-projections.md),
[ADR 0010](docs/decisions/0010-application-lenses-and-resume-projections.md),
[`docs/linear-application-surface.md`](docs/linear-application-surface.md)

**The résumé is durable facts plus projections over them.** `content/resume/facts.ts`
holds the chronology, the systems, and the capabilities; a projection selects facts by
id, orders them, and frames them. It has no field in which to put a fact. Tests assert
that every printed bullet exists verbatim in the corpus, that every quantity appears
inside the exact claim `RESUME_QUANTITIES` permits (the number _and_ what it counts),
and that no projection claims one of the facts recorded as unverified.

**One page plan, one ordinal system.** A surface's `pagePlan` is the only sequence: the
rail, the header nav, the skip link and every section number are stamped from position by
`numberSections`, and a section the plan does not list throws at build time. A section's
`id` is separate from its number (semantic, permanent, and the anchor a shared link
carries) so reordering a page renumbers it and invalidates nothing.

**Server Components by default.** `"use client"` appears in seventeen files, all
genuinely interactive. The page works before hydration: anchors, the evidence index,
every link, one worked decision receipt, and the hero composition's settled frame are
ordinary HTML. See [ADR 0004](docs/decisions/0004-server-components-by-default.md)

**A page states what it cannot prove.** The design direction supplied the product-history
section with a frontend stack, per-audience product surfaces, and a description of the
2016–2019 period. No source established any of them at the time, so those three entries
rendered the recorded gap instead: dashed, marked `NOT YET EVIDENCE`, never linked.
Deleting them would have left a page that reads as complete and a reader who never
learns a question was asked.

All three were later answered by the record and are now stated. Closing a gap once it is
genuinely answered is the other half of recording it, and the mechanism stays wired and
tested for the next question the corpus cannot answer.

Four more rules are enforced by tests and explained in their own records: interaction
state is shareable but never written while browsing
([ADR 0012](docs/decisions/0012-state-can-be-a-link-not-is-one.md)); mobile recomposes
rather than stacking, gated at four viewports with every disclosure open
([ADR 0013](docs/decisions/0013-mobile-recomposes-rather-than-stacks.md)); a token that
names text is never a background, and text inside a fill takes its colour from that
fill's stated pair ([ADR 0011](docs/decisions/0011-tokens-that-name-text-are-not-backgrounds.md));
and one meaning gets one icon, with the geometry vendored rather than installed
([ADR 0008](docs/decisions/0008-vendored-icon-set.md)): `dependencies` is exactly
`next`, `react`, `react-dom`.

## Evidence policy

**No evidence CTA without evidence.**

A row renders as a link only when it names a destination _and_ that destination has been
confirmed to be the artifact the row claims. A link to a general profile page is not an
artifact, and neither is a link back to the section the reader is already in. Everything
else renders `VERIFY BEFORE PUBLISHING`, and each evidence panel reports its own state
honestly.

The rule lives in one function, `resolveEvidence` in `src/lib/evidence.ts`. `EvidenceLink`
takes a record rather than an href, so there is no way to produce a link that bypasses it.

Every evidence row on the three primary claims resolves to an exact artifact, and each
was opened and confirmed to be the thing its row names: Vreko 8/8, Repository
Intelligence 12/12, Interlock 8/8, Never Ask Twice 1/1. The Interlock rows point at a
**pinned commit**, not a branch, and a test enforces that for every GitHub evidence link
on the site.

## What is not established

Nothing on this site was invented to fill a gap. No metrics, adoption figures,
employment details, URLs, or architectural rationale have been fabricated. Three things
a product-oriented résumé would like to say, and does not:

`UNVERIFIED` in `src/content/resume/facts.ts` is empty, and that is a result rather than
a shrug. It held three entries for most of this project: no established frontend
framework, no per-audience product ownership, and a title-only 2016–2019. Each was true
of the record as supplied, each rendered on the page as an open question, and each has
since been answered.

Three things a reader might expect and will not find, because none is an evidence gap:
the exact year TypeScript arrived, an exhaustive broker or employer feature catalogue,
and GraphQL. GraphQL is worth naming: it is on the target role's published stack and is
simply not claimed, which is what the rule is for. The full content audit is in
[`docs/content-audit.md`](docs/content-audit.md).

## Design provenance

The approved design was produced in Claude Design and is preserved unmodified at
[`design/reference/claude/`](design/reference/claude/), with SHA-256 hashes recorded in
that directory's README. Those files are **reference, not source**; they contain Claude
Design runtime constructs that were translated by hand into React, TypeScript, and CSS
Modules. They are not under `public/` and are never served.
[ADR 0005](docs/decisions/0005-design-export-as-reference.md) has the reasoning;
[`docs/design-import.md`](docs/design-import.md) records what was extracted, where each
piece landed, and every deliberate deviation.

A later motion-and-disclosure storyboard drove the three progressive-disclosure
interactions. It was consumed as an interaction specification and **not** committed; its
hash, treatment, and every deviation are in
[`docs/design-provenance.md`](docs/design-provenance.md), and the durable rules it
produced are in [`docs/interaction-contract.md`](docs/interaction-contract.md).

## House style

**No em dashes.** They are the most reliable surface tell of generated prose, and a
document arguing that its claims can be checked cannot afford a typographic habit that
makes a reader stop and wonder who wrote the argument. A colon, a semicolon, a comma,
parentheses, or two sentences will all carry the pause. The en dash stays, because
`08/2016 – 08/2019` is punctuation rather than a rhetorical device.

The rule covers comments and decision records as well as rendered copy, because this
README sends an evaluator to read them. `src/test/typography.test.ts` enforces it over
every file git would keep, tracked or not, and runs in `pnpm test` and in CI.

## Local development

Requires Node 22 (see `.node-version`) and pnpm via Corepack.

```bash
corepack enable
pnpm install
pnpm dev            # http://localhost:3000
```

## Quality gates

```bash
pnpm format:check   # prettier
pnpm lint           # eslint (flat config)
pnpm typecheck      # tsc --noEmit, strict
pnpm test           # vitest (unit and component
pnpm build          # next build
pnpm test:e2e       # playwright) browser + axe-core accessibility
```

All six run in CI on every pull request. The browser suite needs Chromium once:

```bash
pnpm exec playwright install chromium
```

Accessibility is a gate rather than a follow-up: axe-core runs against the durable page,
a role lens, and the Linear application surface, each with every disclosure open, at
desktop and at 320px. Contrast is checked on resolved colours in both palettes, not on
declared ones.

The résumé PDFs are generated from real print routes and committed:

```bash
pnpm resume:pdf        # regenerate every variant from the manifest
pnpm resume:pdf:check  # verify the committed artifacts are still current
```

## License

MIT for the application source. The preserved design export under `design/reference/` is
provenance material, not licensed application code.
