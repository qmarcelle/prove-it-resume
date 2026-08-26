# 0004 — Most of the application stays Server Components

**Status:** accepted

## Problem

The page has five genuinely interactive behaviours: proof-progress tracking, guided
navigation, evidence disclosures, the claim ledger, and the two counterfactual
interactions. Everything else is static content.

The easy failure is to mark the page `"use client"` because something inside it has
state, which ships the entire page's markup, copy, and evidence data as JavaScript.

## Alternatives

1. **One client page.** Simplest to write. Ships every proof, every evidence row, and
   every boundary to the browser as JS for the sake of a few toggles.
2. **Server Components with client leaves.** Requires thinking about where state lives
   and how server content passes through a client provider.

## Decision

Server Components by default. `"use client"` appears only where a file genuinely holds
state: `ProofNavProvider`, `ProofProgress`, `GuidedProofNav`, `WalkProofButton`,
`EvidenceDisclosure`, `ClaimLedger`, `DecisionReceipt`, `ReceiptTabs`, and the
interaction components.

`EvidenceChain`, the application surface's hero figure, is a Server Component despite
being an animation. Its keyframes carry `fill-mode: both` and the stylesheet describes
the settled frame, so the finished figure is the authored DOM state and there is nothing
for JavaScript to sequence.

## Consequences

- `ProofNavProvider` wraps the page but renders `children` untouched, so server-rendered
  sections pass through it without crossing the boundary. This is the pattern that makes
  "provider at the top, server content inside" work.
- The hero is a Server Component with one client button inside it, rather than a client
  component because it contains a button.
- All routes prerender to static HTML.
- The page works before hydration: anchors, the evidence index, in-page nav, and the
  skip link are ordinary links, and the sections are ordinary anchor targets. The rail
  and guided mode are progressive enhancements.
- Shared client state costs a context. Prop-drilling through server sections is not
  possible, and three distant components need the same state, so a provider is the right
  shape rather than an indulgence.
