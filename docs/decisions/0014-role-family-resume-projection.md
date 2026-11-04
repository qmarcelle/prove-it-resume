# 0014: A role-family lens may carry its own résumé projection

**Status:** accepted

## Problem

A Product Engineer application needs a résumé that leads on personally delivered
customer-facing work. The architecture offered two ways to select different facts, and
neither fit.

A `RoleLens` was held to the durable résumé by test. An `ApplicationLens` may select its
own facts, but it requires a company-specific route, hero, page plan and section copy.
That is a page build, for an application whose form has no portfolio field.

## Alternatives

1. **A company-specific application lens.** Creates a company-branded public page that
   the application would not use.
2. **A second résumé document outside this pipeline.** Duplicates the fact corpus, which
   is the failure ADR 0010 exists to prevent.
3. **A company-neutral role lens with its own projection.**

## Decision

Option 3. `product-engineer` is a role lens that names no company and selects durable
facts through `projections/product-engineer.ts`, using the existing `linear` composition
without its agent-platform block.

The exception is one explicit slug in `role-lens.test.ts`, not a loosened rule. A
company-specific role lens still cannot reorder a career.

## Consequences

- A company application copies this PDF into its campaign package. The projection stays
  free of company wording, and `resume.test.ts` asserts that.
- Registering the lens also creates `/role/product-engineer`. It is `noindex`, like every
  role lens, and composes the durable proofs. It is not a dedicated role-family surface,
  which remains a separate piece of work.
- `layout: 'linear'` now names a composition rather than a company. Renaming it would
  touch the Linear artifact for no benefit to a reader, so the name stays for now.
- A projection may print a later `revision` than the corpus, so cutting one new sheet
  does not change the artifacts other processes already hold.
- This sheet sets `omitBoundaries`, because a conventional résumé carries its scope through
  precise wording and evidence links. Evidence-surface sheets keep their boundary blocks.
- Facts with no recorded dates sit in `RESUME_EMPLOYER_HIGHLIGHTS`, above the dated roles,
  so printing them does not assert a period the record does not establish.
