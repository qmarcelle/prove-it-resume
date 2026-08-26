# 0010: Application lenses and résumé content projections

**Status:** accepted

## Problem

The evidence surface needed a deeply tailored page for one company (Linear) at
`/linear`, together with a résumé written for that reader rather than the durable one
under a different heading.

Two things in the existing architecture did not stretch to that.

**Role lenses are deliberately generic.** A `RoleLens` reorders proofs and promotes rows
in the evidence map. It has no route of its own, no hero framing, no page order, and no
way to introduce material: all correct for a lens that says "read this for a platform
role", and none of it sufficient for a surface addressed to one organisation.

**A role-specific résumé changed only the masthead title.** ADR 0007 records that
narrowly, and it was right at the time: widening it would have let a résumé say different
things to different readers, which is the opposite of what the artifact is for. But the
Linear application needs a genuinely different _selection_ (customer-facing work leading
the enterprise record, agent memory promoted out of the footnote, an agent-platform block
that the durable sheet has no room for) and a title swap cannot express any of it.

There is also a private-data problem the existing architecture had never faced. The most
relevant Linear material lives in the owner's private workspace, and a public page is
exactly where "just render what the API returns" becomes a leak.

## Alternatives

1. **A second application.** Its own repository, its own deploy. Total freedom, and it
   forks the evidence corpus, the design tokens, the evidence rule, the accessibility
   gates, and the PDF pipeline on day one. Every correction would then have to be made
   twice, and the second copy is the one that goes stale.
2. **`/role/linear`, with `RoleLens` widened.** No new type, no new route shape. It turns
   the lightweight lens into a bag of optional fields (a public path, a hero, a page
   plan, receipts) that every generic lens then carries as five nulls, and makes "does
   this lens own a page?" a question you answer by reading the object rather than its
   type. It also puts a company-specific application under the generic role namespace,
   where it reads as one of a series.
3. **A second copy of the résumé content.** The fastest way to a Linear-specific sheet,
   and the one that guarantees the two documents disagree about the same career within a
   release or two.
4. **A distinct `ApplicationLens`, a first-class route, and résumé content projections
   over a shared fact corpus.**

## Decision

Option 4.

### Why `/linear` is one route in this application

The Linear surface shares the durable evidence, the design tokens, the evidence-integrity
rule, the three progressive-disclosure interactions, the résumé build, the accessibility
gates, and the deployment lifecycle. What it does not share is the reading order and the
framing. A URL path is exactly the right isolation boundary for that difference, and a
second deployment would isolate the things that must stay identical while doing nothing
about the thing that actually differs.

It is `noindex, follow`, canonical to `/`, absent from the sitemap, and disallowed in
`robots.txt`: the same treatment role lenses get, for the same reason. It exists so one
link resolves to a page written for the person opening it, not to compete with the
durable artifact in an index. The disallow list is derived from `APPLICATION_LENSES`, so
registering a surface cannot leave it indexable because someone forgot a file.

### Why `ApplicationLens` is distinct from `RoleLens`

Both are `SurfaceLens`: slug, title, proof order, evidence-map order, metadata, and the
id of a résumé projection. `RoleLens` adds nothing. `ApplicationLens` adds a public path,
an organisation, hero framing, a page plan, section copy, and curated receipts.

The distinction pays for itself in the router. `ROLE_LENSES` and `APPLICATION_LENSES` are
separate registries, `generateStaticParams` for `/role/[slug]` walks only the first, and
`dynamicParams: false` makes `/role/linear` a 404 rather than a second public address for
the same application. That property is asserted in `tests/e2e/application.spec.ts`, and
it is the whole reason the registries are not merged.

Everything downstream of routing treats the two identically. `ALL_LENSES` feeds the
résumé manifest, the PDF build, the download resolver, and the content tests, so an
application lens is a first-class résumé variant without any of them knowing what kind it
is.

### Why the page is a second composition rather than a flag

`ProveItResume` renders `/` and `/role/[slug]`; `ApplicationSurface` renders `/linear`.
They differ in which sections appear, in what order, and what opens the page: the
application surface drops the operating thesis, adds a product history and a
Linear-in-practice section, promotes Never Ask Twice ahead of the proofs, and closes on
product judgement rather than opening on role fit.

Encoding that as branches inside one component produces a file where every second line
asks which surface it is on, and the honest reading of such a file is that there are two
compositions in it anyway. Everything below the section level is shared, which is where
the duplication would actually hurt.

The rail is driven by the lens's `pagePlan` rather than by the module-level
`PROOF_STEPS`, so the map and the page cannot disagree.

That was not enough on its own, and the first implementation proved it: the rail counted
the plan while each proof section printed the durable stage it holds on `/`, so a reader
who clicked "05" arrived at a section introducing itself as "03". The plan is now the
single authority for order, visible number, section identity, the header nav and the
rail, and it authors no numbers at all, since `numberSections` derives them from
position. A section takes a `SurfaceStep` and states nothing about where it is;
`requireStep` throws if a rendered section is absent from the plan, so an unnumbered
section is a build failure rather than a quiet gap. See
`docs/linear-application-surface.md`.

### How durable facts stay canonical

`src/content/resume/facts.ts` holds what is true: identity, chronology with
individually addressable bullets, systems, capability groups, credentials. A projection
in `src/content/resume/projections/` is a set of _selections over ids_ plus framing copy.
It names which systems appear and in what order, which of a role's bullets to print and
in what order, and what to call each block. There is no field in which to put a fact.

`resolveResume` applies a projection and throws on an id that no longer exists, because
a projection whose selection has gone stale has quietly stopped saying what its author
meant, and on a fixed page box that failure is otherwise a gap nobody notices.

Four invariants are executable, in `src/content/resume/resume.test.ts`:

- every bullet a projection renders exists verbatim in the fact corpus;
- every number a projection prints, in framing prose or in a selected bullet, is in
  `RESUME_QUANTITIES`, so a metric cannot be strengthened for an audience without failing
  a test;
- no projection names a fact recorded in `UNVERIFIED`, which is currently empty because
  every question it held has been answered by the record; the mechanism stays wired for
  the next one;
- no bullet describing team-owned work is written in the voice of a personal author,
  which is enforced through an `ownership` field rather than through phrasing
  discipline;
- every grouped capability also appears in the durable stack line, a system's tool chain,
  or a role bullet, so a group cannot become the place a new technology quietly appears.

The durable projection selects every fact in its durable order. It is the artifact other
processes already hold, so it changes only as a deliberate global correction, and the
content fingerprint in `scripts/resume-artifacts.json` catches an accidental one.

### How private Linear data is kept out of the browser

`src/content/linear/receipts.ts` exports a fixed array of `LinearReceipt`. Every field
was written for publication rather than extracted: an identifier, the question, the
finding, a status, and a required boundary. There is no fetch, no credential, and no
workspace URL.

No receipt carries a link, and that is the honest rendering rather than an omission: no
public artifact stands behind them, so under this site's own evidence rule they are
stated claims. Each renders the same `[VERIFY BEFORE PUBLISHING]` marker every other
unresolved row on the site renders, in the place a call to action would sit, and the
section states in as many words that they are not verified evidence.

The intended seam if this is ever automated is

```
private Linear API → hard-coded issue allowlist → build-time sanitiser
→ LinearReceipt[] → page
```

with every stage before the last running on a machine that holds the credential. It is
deliberately not implemented: three receipts do not justify a credentialled build step,
and the seam is worth more written down than half-built.

Two test layers enforce the boundary. `src/content/linear/linear.test.ts` scans the whole
of `src/` for a workspace host or an API credential, so a future contributor cannot ship
a live integration without failing first; `tests/e2e/application.spec.ts` scans the served
HTML and every `href` on the rendered page, which is the artifact that actually leaves
the building.

### How the PDF build still discovers variants automatically

Unchanged from ADR 0007, and deliberately so. The app publishes
`/resume/manifest.json` from `ALL_RESUME_LENSES`; `scripts/build-resume-pdf.mts` reads
slugs, routes, and paths from it and knows nothing about any individual lens. Registering
`linear` produced `/resume/print/linear` and `/qwynn-marcelle-resume-linear.pdf` with no
edit to the script.

## Consequences

- Two résumé layouts exist, `DefaultResumeLayout` and `LinearResumeLayout`, composed from
  shared print primitives. They are written out explicitly rather than generated from a
  block list: there are exactly two, there is no third coming, and an interpreter plus a
  schema would trade a file anyone can read against the printed sheet for machinery.
- The fixed page box now fails in a second way, because a second layout is tuned by hand.
  `resume.spec.ts` gained a check that compares every page's scroll height to its client
  height _and_ every block's to its own box, which catches content that overflows a flex
  child while the page reports none. That is a stronger test than the bottom-anchored
  assertions it sits beside, and it applies to every variant.
- The Linear sheet is a genuinely different document, so it needed its own space budget.
  Per-system tool chains are suppressed there because block 05 groups the same
  technologies by capability; the grouped capability block stacks its heading above its
  rows rather than beside them, because nesting a second label column inside the block's
  own rail left each run about 200px to wrap in.
- Components that render a lens take `SurfaceLens` or `AnyLens` rather than `RoleLens`.
  Not needing the discriminant is the signal that a component treats both kinds
  identically, which is the property this design is trying to keep.
- `ProofNavProvider` takes its stages as a prop. The default is still `PROOF_STEPS`, so
  `/` and `/role/[slug]` are unchanged.
- The Linear résumé's footer links to `/linear` rather than to the root, so a reader who
  opens the personal site from the PDF lands on the surface written for them.
- Registering a second application lens now costs one content module and one route file.
  Nothing in the manifest, the build script, the robots rules, the download resolver, or
  the tests needs to know it exists.
