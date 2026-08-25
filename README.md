# Prove It Resume

A technical evidence surface for hiring decisions.

> **Important evidence should be easy to find at decision time.**

## What this is

An artifact that lets an evaluator understand, inspect, and challenge evidence of senior
engineering capability, rather than reading a conventional résumé and taking it on faith.

It organises three engineering claims, each with multiple independent receipts:

|        | Claim                                                                       | Status                              |
| ------ | --------------------------------------------------------------------------- | ----------------------------------- |
| **01** | **Vreko** — MCP and codebase intelligence for agentic development workflows | Shipped system                      |
| **02** | **Repository Intelligence** — `workspace.json` → Codex → Tally              | Standard · implemented · integrated |
| **03** | **Interlock** — can environment evidence change a coordination decision?    | Controlled evidence                 |

Not a portfolio of six side projects. Three arguments, with the evidence for each and an
explicit statement of what that evidence does _not_ establish.

## Why it is not a conventional résumé site

A résumé asks to be believed. This asks to be checked.

Every claim carries a boundary, every proof exposes its evidence, and the Claim Ledger
lists all of it in one auditable table. Where an exact artifact does not exist yet, the
page says so instead of linking somewhere plausible — see **Evidence policy** below.

The implementation is also part of the evidence. The architecture, accessibility, tests,
and the decisions behind them are meant to hold up to inspection.

## Architecture

```
src/
  app/                    routes, all statically rendered
    page.tsx              the durable evidence surface
    role/[slug]/page.tsx  the same surface, projected through a role lens
  components/             presentation; no content lives here
  content/                durable proof, claims, decisions, role lenses
    experiments/          the frozen runs the interactions are bound to
  lib/                    types, the evidence rule, lens projection
  styles/tokens.css       the design language as custom properties
design/reference/claude/  the original design export, preserved unmodified
docs/                     design import, ADRs, content audit, performance,
                          interaction contract, design provenance
```

Three ideas carry the design:

**Content is data.** Proofs, claims, and boundaries live in typed modules under
`src/content/`, not inside JSX. `boundary` is a required field on `Proof`, so a proof
cannot ship without stating its limits.

**Role lenses are projections, not forks.** A `RoleLens` may reorder and reframe; it
holds no proof content, so it structurally cannot change a claim. `/` and `/role/<slug>`
render the same component with a different lens.

**Server Components by default.** `"use client"` appears in nine files, all genuinely
interactive. The page works before hydration: anchors, the evidence index, and every link
are ordinary HTML.

The reasoning is in [`docs/decisions/`](docs/decisions/); the defensible detail is in
[`docs/implementation-notes.md`](docs/implementation-notes.md).

## Design provenance

The approved design was produced in Claude Design and is preserved unmodified at
[`design/reference/claude/`](design/reference/claude/), with SHA-256 hashes recorded in
that directory's README.

Those files are **reference, not source**. They contain Claude Design runtime constructs
(`<x-dc>`, `<sc-if>`, `{{ binding }}`, a `DCLogic` class) which were translated by hand
into React, TypeScript, and CSS Modules. They are not under `public/` and are never
served.

[`docs/design-import.md`](docs/design-import.md) records what was extracted, where each
piece landed, and every deliberate deviation from the mockup.

A later motion-and-disclosure storyboard drove the three progressive-disclosure
interactions. It was consumed as an interaction specification and **not** committed —
its hash, treatment, and every deviation are recorded in
[`docs/design-provenance.md`](docs/design-provenance.md), and the durable rules it
produced are in [`docs/interaction-contract.md`](docs/interaction-contract.md).

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
pnpm test           # vitest — unit and component
pnpm build          # next build
pnpm test:e2e       # playwright — browser + axe-core accessibility
```

All six run in CI on every pull request. The browser suite needs Chromium once:

```bash
pnpm exec playwright install chromium
```

Accessibility is a gate rather than a follow-up: axe-core runs against the durable page,
a role lens, and the page with every disclosure open, at desktop and at 320px.

## Evidence policy

**No evidence CTA without evidence.**

A row renders as a link only when it names a destination _and_ that destination has been
confirmed to be the artifact the row claims. A link to a general profile page is not an
artifact, and neither is a link back to the section the reader is already in.

Everything else renders `VERIFY BEFORE PUBLISHING`, and each evidence panel reports its
own state honestly — "0 of 8 evidence items resolve to an inspectable artifact".

The rule lives in one function, `resolveEvidence` in `src/lib/evidence.ts`. `EvidenceLink`
takes a record rather than an href, so there is no way to produce a link that bypasses it.
Tests assert that no evidence record points at the bare GitHub profile or at an on-page
anchor.

## Status

**Implementation complete**

- All six proof stages, the Evidence Index, and the Claim Ledger
- Guided proof navigation, active-stage tracking, evidence disclosures
- Role-lens projection with the supplied `athenahealth / Yoh` lens
- Decision Receipt component, with an explicit awaiting state
- `InterlockCounterfactual` (prototype values, labelled as such)
- `RepositoryDecisionDiff` — structure, state machine, and accessibility only
- Accessibility, responsive, and browser test coverage; CI

**Awaiting verified content**

- No résumé PDF was supplied; résumé support is wired but the link is disabled
- Most per-artifact evidence URLs are unresolved — the Tally case study is the exception
- The seven Decision Receipts have questions but no answers
- `RepositoryDecisionDiff` has no plan pair to show

The complete list, with what each item needs, is in
[`docs/content-audit.md`](docs/content-audit.md).

Nothing on this site was invented to fill a gap. No metrics, adoption figures,
employment details, URLs, or architectural rationale have been fabricated.

## License

MIT for the application source. The preserved design export under `design/reference/` is
provenance material, not licensed application code.
