# 0005 — The Claude Design export is preserved as reference, not used as source

**Status:** accepted

## Problem

The design arrived as `.dc.html` files containing Claude Design runtime constructs —
`<x-dc>`, `<sc-if>`, `<sc-for>`, `{{ binding }}`, `style-hover`, and a `DCLogic`
component class — plus a `support.js` viewer runtime. These express the design's
behaviour precisely and are not a production dependency.

## Alternatives

1. **Delete the export after porting.** Clean tree. Destroys the record of what the
   approved design actually specified, so later disagreements are settled by memory.
2. **Serve it from `public/` as a living reference.** Ships a 90KB unmaintained page and
   a viewer runtime to production, and creates a second, divergent copy of the site.
3. **Preserve it unmodified outside the build, and document the translation.**

## Decision

Preserved at `design/reference/claude/`, unmodified, with SHA-256 hashes recorded in
that directory's README. Excluded from ESLint, Prettier, and `tsconfig`. Not under
`public/`, so it is never served. `docs/design-import.md` records what was extracted,
where it landed, and every deliberate deviation.

## Consequences

- "Is that what the design said?" is answerable by inspection, including whether the
  files have changed since import.
- The translation is auditable: the export's `IntersectionObserver` parameters and
  scroll offset are ported verbatim and annotated as such in the code.
- The reference will go stale as the site evolves. That is correct — it is a record of a
  moment, not a specification to keep in sync.
- Inline styles became a token layer plus CSS Modules. The export's inline styling is a
  Claude Design authoring affordance, not a styling strategy, and carrying it forward
  would have made the design language uneditable.
