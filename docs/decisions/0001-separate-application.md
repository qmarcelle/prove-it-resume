# 0001 — Prove It Resume is a separate application

**Status:** accepted

## Problem

The evidence surface could have been a section of the Marcelle Labs site or a route
inside an existing property. It needs its own domain, its own release cadence, and its
own risk profile, and it will be inspected by people who were sent one link.

## Alternatives

1. **A route inside marcellelabs.io.** Reuses hosting and shell. Couples a personal
   hiring artifact to a company site's release cycle, analytics, and legal surface, and
   invites shared components that make the two drift toward each other.
2. **A shared monorepo with a common design-system package.** Attractive on paper. The
   two properties have one design language between them and no second consumer, so the
   package would be an abstraction with a single caller.
3. **A standalone application.** Independent deploys, its own quality gates, and a
   repository that is itself part of the evidence.

## Decision

A standalone application in its own repository.

## Consequences

- The repository is inspectable as a work sample, and its CI, tests, and commit history
  are part of what it demonstrates.
- Nothing here is shared with Marcelle Labs. If a genuine second consumer appears, the
  token layer in `src/styles/tokens.css` is the natural extraction point — but not
  before, since one consumer does not justify a package.
- The visual language is duplicated rather than shared. Accepted: divergence between a
  company site and a personal hiring artifact is fine, and often correct.
