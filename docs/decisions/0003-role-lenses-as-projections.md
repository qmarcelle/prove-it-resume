# 0003: Role lenses are projections, not duplicated pages

**Status:** accepted

## Problem

The same evidence needs to be presented for different roles, emphasising different
problems. The obvious implementation (a page per role) makes every application a
fork, and forks drift. Worse, if two lenses could state different things about the same
system, an evaluator comparing them would learn that the claims are marketing.

## Alternatives

1. **A page per role.** Total freedom per role. Duplicates every proof, so a corrected
   boundary must be fixed in N places and will not be.
2. **A CMS-driven page builder.** Flexible, and far more machinery than a handful of
   lenses justify.
3. **A `RoleLens` record projected over the durable proof set.**

## Decision

A lens is data: title, organisation, proof ordering, and the ordering of the evidence
map. `projectProofs(lens)` applies it. `/` and `/role/[slug]` render the same
`ProveItResume` component with a different lens.

## Consequences

- A lens has no field in which to put proof content, so it structurally cannot change a
  claim. The guarantee is enforced by the type, not by discipline.
- `projectProofs` appends any proof a lens omits rather than dropping it, so a
  projection cannot quietly hide evidence.
- `prioritiseMapping` reorders shared rows rather than copying them, so a lens cannot
  hold a stale copy of a row.
- Tests in `src/lib/role-lens.test.ts` assert that every lens projects the same proof
  objects and that every lens mapping row exists verbatim in the durable mapping.
- Role routes are `noindex` with a canonical pointing at `/`, and are excluded from the
  sitemap: they are projections of one work, and listing them would advertise every open
  application.
- An unknown slug 404s rather than falling back to the default lens, which would serve a
  different projection under the requested URL.
