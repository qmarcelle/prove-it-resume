# The Linear application surface

Everything specific to `/linear`, in one place: what routes exist, what the page says in
what order, which component does what, where the content comes from, what is deliberately
kept out of the browser, how the PDF is produced, and what is tested.

The reasoning behind the architecture is in
[`docs/decisions/0010-application-lenses-and-resume-projections.md`](decisions/0010-application-lenses-and-resume-projections.md).
This document is the map.

---

## Route map

| Route                               | What it is                                   | Indexing                    |
| ----------------------------------- | -------------------------------------------- | --------------------------- |
| `/`                                 | The durable evidence surface                 | indexed, canonical, sitemap |
| `/role/athenahealth-yoh`            | Role lens — same page, reordered             | `noindex, follow` → `/`     |
| `/role/end-to-end-delivery`         | Role lens — same page, reordered             | `noindex, follow` → `/`     |
| `/role/linear`                      | **404 by construction**                      | —                           |
| `/linear`                           | The Linear application surface               | `noindex, follow` → `/`     |
| `/resume/print`                     | Print source, durable projection             | `noindex, nofollow`         |
| `/resume/print/athenahealth-yoh`    | Print source, durable projection, lens title | `noindex, nofollow`         |
| `/resume/print/end-to-end-delivery` | Print source, durable projection, lens title | `noindex, nofollow`         |
| `/resume/print/linear`              | Print source, **Linear projection**          | `noindex, nofollow`         |
| `/resume/manifest.json`             | Variant list the PDF build reads             | static JSON                 |
| `/qwynn-marcelle-resume-linear.pdf` | Generated artifact, committed                | static file                 |

`/role/linear` 404s because `ROLE_LENSES` and `APPLICATION_LENSES` are separate
registries: `generateStaticParams` for `/role/[slug]` walks only the first, and
`dynamicParams: false` refuses anything else. That is asserted rather than assumed —
one public address per application surface is the property the split registry exists to
protect.

`robots.txt` disallows `/role/` and every registered application path, derived from the
registry so a new surface cannot be left indexable by forgetting a file. The sitemap
still lists exactly one URL.

---

## Information architecture

The page plan is the single authority for this surface's sequence. `pagePlan` in
`src/content/applications/linear.ts` states the order, each section's identity and each
section's frame; `numberSections` stamps the visible number from position; and the rail,
the header nav, the skip link and every section head read that one stamped list.

Numbers are not authored. A plan that carried its own numbers could disagree with its
own order, and this one did — see "The sequence defect" below.

| #   | Section                     | Anchor          | Frame      | What it does                                                           |
| --- | --------------------------- | --------------- | ---------- | ---------------------------------------------------------------------- |
| —   | Hero                        | `#top`          | —          | The claim, the Evidence Index, the résumé link                         |
| 01  | Product engineering history | `lin-history`   | `standard` | The production record the recent systems sit on                        |
| 02  | Linear in practice          | `lin-practice`  | `band`     | Curated private-workspace receipts, marked unverified                  |
| 03  | Never Ask Twice             | `more-evidence` | `standard` | Agent memory, promoted out of the appendix                             |
| 04  | Repository Intelligence     | `sec-03`        | `band`     | `workspace.json` → Codex → Tally — the durable proof                   |
| 05  | Interlock                   | `sec-04`        | `standard` | Coordination under concurrent agents — the durable proof               |
| 06  | Vreko                       | `sec-02`        | `inline`   | MCP and codebase intelligence — the durable proof, demoted             |
| 07  | Product judgment            | `lin-judgement` | `standard` | Evidence map, decision receipts, how an unfamiliar platform is entered |
| 08  | Career                      | `sec-06`        | `standard` | The production history beneath the systems                             |
| 09  | Claim ledger                | `ledger`        | `inline`   | Every claim, its basis, its limit                                      |
| —   | Résumé bridge               | `#resume`       | —          | Downloads the Linear PDF                                               |
| —   | Final CTA / footer          | —               | —          | —                                                                      |

The résumé bridge and the closing call to action are deliberately outside the sequence.
They are the handoff after the argument ends, they carry no claim, and numbering them
would say the page has one more thing to prove than it does.

The proof order is the design direction's: Never Ask Twice, Repository Intelligence,
Interlock, Vreko. It runs from the reader's own product problem outward — memory is the
nearest thing in the corpus to what they build, repository context is the surface under
it, and coordination under concurrent agents is the hardest claim and the one carrying a
frozen packet and an independent verifier, so it lands last of the three.

Two orderings differ from `/`, both deliberate:

**Never Ask Twice leads the systems.** Agent memory is the closest of the four to what
this reader builds. On `/` it sits after the three proofs as supporting work.

**Vreko is demoted to last.** It is the strongest MCP artifact in the corpus and the
least differentiating for a company already operating an agent platform. The design
direction removes it from the proof sequence entirely; this surface may reorder evidence
and may not remove it, so the section keeps its diagram, its recorded contradictions and
its boundary, and the demotion is carried by the `inline` frame instead.

### The sequence defect this replaced

Four separate things counted this page, and three of them were wrong.

- **The proof sections printed their durable stage.** `Proof.stage` is the position a
  proof holds on `/`. Rendered here, Vreko introduced itself as `02 · PROOF ONE` while
  the rail beside it counted `06`, and Repository Intelligence said `03` under a rail
  entry reading `05`.
- **Three sections were in no sequence at all.** The promoted Never Ask Twice entry, the
  career section and the claim ledger rendered their own eyebrows with no number, so the
  visible sequence had holes the rail did not.
- **The numbers were authored twice.** `pagePlan` carried an `n` field beside the order
  it described, which is two statements of one fact.
- **The heads did not share an anchor.** Editorial sections used one shell, proof
  sections another, the promoted entry a third, so the numbers sat at different
  horizontal positions down the page.

The fix is structural rather than corrective. `SurfaceSection` has no number field to
get wrong; `numberSections` derives it from position; sections take a `step` and state
nothing about where they are; and `requireStep` throws if a section is rendered that the
plan does not list, so an unnumbered section is a build-time failure rather than a
silently unnumbered block.

`role-lens.test.ts` asserts the plan and `proofOrder` name the same proofs in the same
order, and that a proof's durable stage and its plan position are allowed to differ.
`application.spec.ts` reads the numbers back out of the rail, the header nav and every
section head on the served page and requires them to be one list.

---

## The product-history registers

Three registers read together — how the work progressed, who it was for, what it spanned
— from `src/content/history/product-engineering.ts`.

The design direction supplied this section with three details no source in this
repository supports: a browser stack, ownership of distinct member, broker and employer
product surfaces, and what was built between 2016 and 2019. All three are already
recorded in `UNVERIFIED` in `content/resume/facts.ts`.

So a record is either **stated**, carrying a `body` traceable to the fact corpus, or
**unresolved**, carrying the thing it would like to say and the id of the recorded gap.
There is no third state, because "present but hedged" is how unverified material gets
read as evidence. Unresolved records take the same dashed burnt-orange treatment every
unverified row on this site takes, marked `NOT YET EVIDENCE`, and they are never linked.

Deleting those three entries was the alternative, and it is worse than it looks: a page
that silently omits what it cannot prove reads as complete, and the reader never learns
there was a question. Stated, they are the three things to ask about in an interview.

Before this, `UNVERIFIED` existed and nothing rendered it. It was a test guard, which is
half the job.

---

## The receipt tab strip

`ReceiptTabs` is the surface's one new client leaf. It renders the stacked list on the
server and on the first client render, then becomes the strip — so the degraded form is
what the direction calls for, is what a reader without JavaScript keeps, and is not a
fallback bolted on afterwards. Hydration detection is `useSyncExternalStore` rather than
a state-setting effect.

Arrow keys move between tabs and select as they go; Home and End reach the ends; the
strip wraps. Selection is carried four ways — edge, field, label brightness, and a
filled mark that is not chromatic at all — on top of `aria-selected`.

Its stylesheet is its own. A CSS module imported by a client component is emitted into
the client chunk graph, and the receipts are wholly owned by this component now, so
there is nothing left for the two server sections beside it to share.

---

## Section frame

One outer frame, in `src/components/section/SectionFrame.tsx`, serves every section on
this surface. It owns two things nothing else may set:

- **the index rail** — a fixed column at the section's own left edge holding the number;
- **the content origin** — where the eyebrow, the heading and the lead begin.

`frame` is the only axis of variation, and the page plan declares it, because how loudly
a section is set is a decision about the page rather than about the section.

| Frame      | Ground                                        | Head                                           | Used by                                     |
| ---------- | --------------------------------------------- | ---------------------------------------------- | ------------------------------------------- |
| `standard` | Section ground                                | Oversized number, ruled                        | Editorial, product proof, judgment, career  |
| `band`     | One tonal step down, hairlines top and bottom | Oversized number, unruled                      | Linear in practice, Repository Intelligence |
| `compact`  | Section ground                                | Oversized number, unruled, title one step down | Available; unused today                     |
| `inline`   | Section ground                                | Number at metadata scale                       | Vreko, claim ledger                         |

The band is inset rather than full-bleed, and pulls its content back with a negative
inline margin equal to its padding. A padded band would move its own content origin
inward and put its heading 28px right of every unbanded section — the exact misalignment
the frame exists to remove. Reaching past the layout shell instead was not available:
the measure and the gutters belong to the shell, and a full-bleed section would overlap
the progress rail beside it.

Below 700px the index rail lies down. An oversized number costs a column a narrow
viewport does not have, and aligning headings across sections is a job that does not
exist once there is one column, so the number and the eyebrow share a metadata line.

---

## Component disposition

| Component                                                                                                                  | Disposition          | Note                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `SiteHeader`                                                                                                               | MODIFY               | Nav and availability became props; defaults unchanged                                                                               |
| `Hero`                                                                                                                     | MODIFY               | Framing and the figure became props, both defaulting to the durable page's                                                          |
| `BoundedField` (hero animation)                                                                                            | REUSE on `/`         | Unchanged. Superseded on this surface by `EvidenceChain`                                                                            |
| `EvidenceIndex`                                                                                                            | REUSE                | Already takes projected proofs                                                                                                      |
| `ProofNavProvider`                                                                                                         | MODIFY               | Stages became a prop, defaulting to `PROOF_STEPS`                                                                                   |
| `SectionFrame`                                                                                                             | CREATE               | The one outer frame and index rail every section on this surface is drawn from                                                      |
| `LensSurface.module.css`                                                                                                   | CREATE               | The Lit Work Surface: a palette swap at the composition root, not a dark variant                                                    |
| `ProofProgress`                                                                                                            | REUSE                | Reads stages from the provider                                                                                                      |
| `ProblemSection`                                                                                                           | REPLACE on `/linear` | Superseded by `ProductHistorySection`                                                                                               |
| `ProductHistorySection`                                                                                                    | CREATE               | Opens the surface on the production record                                                                                          |
| `LinearInPracticeSection`                                                                                                  | CREATE               | Curated receipts, each with a boundary and a stated-gap marker                                                                      |
| `SupportingEvidence`                                                                                                       | MODIFY / REORDER     | Framing and an optional plan step became props; the work and its evidence are unchanged                                             |
| `ProofSection` / `ProofChapter`                                                                                            | MODIFY               | Take an optional plan step; without one the durable shell and chapter mark are unchanged                                            |
| `InterlockSection`                                                                                                         | REUSE / REORDER      | Third proof here; number and eyebrow now come from the plan                                                                         |
| `RepositoryIntelligenceSection`                                                                                            | REUSE / REORDER      | Second proof here. Number and eyebrow from the plan; the head leaves the signature block when framed                                |
| `VrekoSection`                                                                                                             | REUSE / DEMOTE       | Rendered last, in the `inline` frame; content unchanged                                                                             |
| `RoleLensSection`                                                                                                          | REPLACE on `/linear` | Superseded by `ProductJudgementSection`                                                                                             |
| `ProductJudgementSection`                                                                                                  | CREATE               | Same three blocks, same content, moved to the close; shares `RoleLens.module.css`                                                   |
| `CareerSection`                                                                                                            | MODIFY               | Optional plan step; without one its own eyebrow and heading render as on `/`                                                        |
| `ResumeBridge`                                                                                                             | REUSE                | Resolves the Linear PDF through `resumePdfPath`                                                                                     |
| `ClaimLedger`                                                                                                              | MODIFY               | Optional plan step; joins the numbered sequence instead of closing outside it                                                       |
| `EvidenceLink` / evidence rule                                                                                             | REUSE, NO BYPASS     | Receipts render the same unresolved marker as any other row without an artifact                                                     |
| `FinalCta`, `SiteFooter`                                                                                                   | REUSE                | Lens prop widened to `AnyLens`                                                                                                      |
| `ProveItResume`                                                                                                            | REUSE                | Unchanged; still renders `/` and `/role/[slug]`                                                                                     |
| `ApplicationSurface`                                                                                                       | CREATE               | The `/linear` composition                                                                                                           |
| `ResumeDocument`                                                                                                           | MODIFY               | Now a shell that selects a layout by projection                                                                                     |
| `ResumePage`/`Masthead`/`Section`/`SystemsSection`/`ExperienceSection`/`FoundationSection`/`AgentPlatformSection`/`Footer` | CREATE               | Print primitives extracted from the old monolith                                                                                    |
| `DefaultResumeLayout`                                                                                                      | CREATE               | The durable composition, written out explicitly                                                                                     |
| `LinearResumeLayout`                                                                                                       | CREATE               | The Linear composition, same primitives                                                                                             |
| Design tokens                                                                                                              | MODIFY               | Added the `--lens-*` dark scale, the `--color-action-*` and `--color-verdict-*` pairs, and `--focus-offset`; no light value changed |
| Interactions                                                                                                               | REUSE                | All three, unchanged                                                                                                                |

---

## Content sources

```
src/content/
  proofs/            durable proof — untouched by any lens
  claims.ts          durable claim ledger — untouched
  supporting/        Never Ask Twice — untouched, reframed on /linear
  site.ts            durable site copy; hero/nav defaults
  lenses.ts          ALL_LENSES / ALL_RESUME_LENSES / PRINTABLE_LENSES
  roles/             RoleLens records          → /role/<slug>
  applications/      ApplicationLens records   → /<publicPath>
  linear/receipts.ts curated LinearReceipt[] + its boundary
  resume/
    facts.ts         the durable fact corpus + UNVERIFIED + RESUME_QUANTITIES
    projection.ts    the projection type and `resolveResume`
    projections/
      default.ts     the durable sheet
      linear.ts      the Linear sheet
    index.ts         registry and `resolveResumeById`
```

A projection names ids. It has no field in which to put a fact, and `resolveResume`
throws on an id that no longer resolves.

### What the Linear projection changes, and why

| Change                                                      | Reason                                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------- |
| Profile leads on products, not infrastructure               | This reader builds agent products                             |
| Team-lead bullets reordered: initiatives and identity first | Customer-facing work leads; same sentences, promoted          |
| Never Ask Twice promoted to a full entry                    | Agent memory is nearest this reader's problem                 |
| Vreko demoted to the `ALSO` line                            | Least differentiating for a company already running agents    |
| Agent-platform receipts block added                         | No proof section carries "has used Linear as a control plane" |
| Stack becomes five grouped capabilities                     | A 22-item run cannot answer "do they do the frontend too?"    |
| Per-system tool chains suppressed                           | Block 05 already groups the same technologies                 |
| Certifications and nonprofit leadership dropped             | This is what pays for the receipts block                      |
| Footer points at `/linear`                                  | A reader following the PDF lands on the page written for them |

### What it does not change

Nothing about the proofs, the claims, or any boundary. Every printed bullet exists
verbatim in `facts.ts`, and a test asserts it.

---

## Private / public boundary

**In the public bundle:** the workspace identifier (`META-268`), a curated title,
question, finding, status, a required boundary, and the date the summary was checked.

**Never in the public bundle:** issue descriptions, comment threads, customer or client
references, workspace URLs, API credentials, or any runtime path from the browser to the
workspace.

Receipts carry no link. No public artifact stands behind them, so under this site's own
evidence rule they are stated claims — and they render the same
`[VERIFY BEFORE PUBLISHING]` marker as any other unresolved row, with the section stating
plainly that they are not verified evidence.

### The seam, if this is ever automated

```
private Linear API → hard-coded issue allowlist → build-time sanitiser
→ LinearReceipt[] → page
```

Every stage before the last runs at build time on a machine holding the credential. The
browser receives only the last. **Never** browser → private workspace.

Not implemented in this pass, on purpose: three receipts do not justify a credentialled
build step.

### Enforcement

| Layer                               | Check                                                                            |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| `src/content/linear/linear.test.ts` | Scans all of `src/` for a workspace host or an API credential                    |
| `tests/e2e/application.spec.ts`     | Scans the served HTML and every rendered `href`                                  |
| Type                                | `publicEvidenceHref` is optional and must be `https:` and not the workspace host |

---

## Résumé generation flow

Unchanged in shape from ADR 0007. What changed is that a variant may now select
different content, and that the manifest walks every lens rather than only role lenses.

```
content/resume/facts.ts                     durable facts
        │
        ├── projections/default.ts          selections + framing
        └── projections/linear.ts           selections + framing
                    │
              resolveResume()               ids → facts; throws on a stale id
                    │
        ┌───────────┴────────────┐
  DefaultResumeLayout      LinearResumeLayout      shared print primitives
        └───────────┬────────────┘
              ResumeDocument
                    │
     /resume/print          /resume/print/<slug>   Server Components, no JS
                    │
        /resume/manifest.json                      derived from ALL_RESUME_LENSES
                    │
      scripts/build-resume-pdf.mts                 Chromium via Playwright
                    │
        public/*.pdf  +  scripts/resume-artifacts.json
```

The build script reads slugs, routes, and paths from the manifest and knows nothing about
any individual lens. Registering `linear` produced its print route and its PDF with no
edit to the script.

`pnpm resume:pdf:check` compares the print route's content fingerprint against the
recorded one and reads the committed PDF's own structure — real PDF, two pages, US
Letter, carrying every external destination the route has.

---

## Test matrix

| Area               | Where                               | What is asserted                                                                                                                                                                                                 |
| ------------------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fact / projection  | `src/content/resume/resume.test.ts` | Every printed bullet exists verbatim in facts; every quantity is in `RESUME_QUANTITIES`; no projection claims an `UNVERIFIED` fact; grouped capabilities are all durable; projections resolve without a stale id |
| Durable stability  | `src/content/resume/resume.test.ts` | The durable projection selects every role and every bullet, in durable order                                                                                                                                     |
| Linear projection  | `src/content/resume/resume.test.ts` | Initiatives lead; NAT promoted; Vreko demoted; receipts bounded and unlinked; footer → `/linear`                                                                                                                 |
| Lens integrity     | `src/lib/role-lens.test.ts`         | Every lens — application lenses included — projects the same proof objects and only durable mapping rows                                                                                                         |
| Registries         | `src/lib/role-lens.test.ts`         | Unique slugs across both registries; `/role/linear` unresolvable; each non-default lens printable exactly once; rail numbered by position                                                                        |
| Private boundary   | `src/content/linear/linear.test.ts` | No workspace host or credential anywhere in `src/`; identifiers are identifiers; every receipt has a boundary and a verification date                                                                            |
| Artifacts          | `src/content/content.test.ts`       | Every lens has a distinct PDF and the file is on disk                                                                                                                                                            |
| Routing            | `tests/e2e/application.spec.ts`     | `/linear` 200; `/role/linear` 404; `/` and both role routes unchanged; `noindex, follow`, canonical `/`                                                                                                          |
| Private boundary   | `tests/e2e/application.spec.ts`     | Served HTML and every `href` free of the workspace host                                                                                                                                                          |
| Evidence integrity | `tests/e2e/application.spec.ts`     | Three stated-gap markers in the receipts section; disclosures and claim ledger present                                                                                                                           |
| Page plan          | `src/lib/page-plan.test.ts`         | Numbers derive from position and renumber on reorder; identity and frame carry through; a section absent from the plan throws                                                                                    |
| Page plan          | `src/lib/role-lens.test.ts`         | The plan and `proofOrder` name the same proofs in the same order; each section states one identity; a proof's durable stage and its plan position may differ                                                     |
| Page plan          | `tests/e2e/application.spec.ts`     | Every planned anchor exists; proofs render in Linear order; the rail, the header nav and every section head print one sequence; no section prints its durable stage                                              |
| Section frame      | `tests/e2e/application.spec.ts`     | All frames in use share one index-rail position and one content origin at 1440px                                                                                                                                 |
| Résumé geometry    | `tests/e2e/resume.spec.ts`          | All four variants: two US Letter pages, no page or block overflow, masthead and identity headroom, contact row unwrapped, bottom-anchored content inside the sheet                                               |
| Résumé content     | `tests/e2e/resume.spec.ts`          | Linear sheet leads on Portal Refresh, promotes NAT, prints all three identifiers, links to `/linear`; the durable sheet still leads on Vreko and links to the root                                               |
| Manifest           | `tests/e2e/resume.spec.ts`          | Every variant exactly once; Linear's route, path, and download name                                                                                                                                              |
| Downloads          | `tests/e2e/resume.spec.ts`          | Every résumé CTA on `/linear` resolves to the Linear PDF with the right filename                                                                                                                                 |
| Accessibility      | `tests/e2e/application.spec.ts`     | axe-core on `/linear`, closed and with every disclosure open; no horizontal scroll at 320px                                                                                                                      |
| Artifact drift     | `pnpm resume:pdf:check`             | Content fingerprint and committed PDF structure for all four variants                                                                                                                                            |
