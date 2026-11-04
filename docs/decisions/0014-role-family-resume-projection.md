# 0014: A role-family résumé may ship before its role page

**Status:** accepted

## Problem

A Product Engineer application needs a résumé that leads on personally delivered
customer-facing work. The architecture offered two ways to select different facts, and
neither fit.

A `RoleLens` is held to the durable résumé by test, and registering one also publishes
`/role/<slug>`. An `ApplicationLens` may select its own facts, but it requires a
company-specific route, hero, page plan and section copy. That is a page build, for an
application whose form has no portfolio field.

A role page would also contradict this résumé. It composes the durable surface, so it
would show the AI-platform hero, the durable evidence order and an older revision.

## Alternatives

1. **A company-specific application lens.** Creates a company-branded public page that
   the application would not use.
2. **A second résumé document outside this pipeline.** Duplicates the fact corpus, which
   is the failure ADR 0010 exists to prevent.
3. **A company-neutral role lens with its own projection, published at
   `/role/product-engineer`.** Publishes a page that does not match the résumé, and
   needs an exception to the rule that role lenses stay on the durable résumé.
4. **A company-neutral résumé-only lens with its own projection.**

## Decision

Option 4. `product-engineer` selects durable facts through
`projections/product-engineer.ts`, using the existing `linear` composition without its
agent-platform block.

The lens is in `RESUME_ONLY_LENSES`, which feeds `ALL_LENSES` but not `ROLE_LENSES`. It
gets a print route, a manifest entry, a PDF and a download name. `/role/product-engineer`
is a 404.

## Consequences

- Every lens in `ROLE_LENSES` stays on the durable résumé, with no exception.
- `RESUME_ONLY_LENSES` is asserted as an exact list, and its lenses must name no company.
  A company-specific lens still cannot reorder a career this way.
- The PDF, the `noindex` print route and the manifest entry are public once deployed, but
  no page on the site links to them.
- A company application copies this PDF into its campaign package. The projection stays
  free of company wording, and `resume.test.ts` asserts that.
- The Product Engineer page is separate role-family work. It needs its own hero, evidence
  order and revision before the lens moves into `ROLE_LENSES`, and this record and the
  role-lens test must change with it. Until then the lens holds durable values in its
  surface fields, so it makes no decision for that page.
- `layout: 'linear'` now names a composition rather than a company. Renaming it would
  touch the Linear artifact for no benefit to a reader, so the name stays for now.
- A projection may print a later `revision` than the corpus, so cutting one new sheet
  does not change the artifacts other processes already hold.
- This sheet sets `omitBoundaries`, because a conventional résumé carries its scope through
  precise wording and evidence links. Evidence-surface sheets keep their boundary blocks.
- Facts with no recorded dates sit in `RESUME_EMPLOYER_HIGHLIGHTS`, above the dated roles,
  so printing them does not assert a period the record does not establish.
