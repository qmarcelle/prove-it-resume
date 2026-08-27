import type { LinearReceipt } from '@/lib/types';

/**
 * Curated receipts from the owner's private Linear workspace.
 *
 * ## The boundary these exist to hold
 *
 * The work these describe happened in a private workspace. That workspace contains
 * issue descriptions, comment threads, and customer references that must never reach a
 * browser, and a public résumé surface is precisely the place where "just render what
 * the API returns" turns into a leak.
 *
 * So nothing here is extracted. Each field below was written for publication from facts
 * the owner supplied to this repository, and the module exports a fixed array: there is
 * no fetch, no token, no workspace URL, and no runtime path from this page to the
 * workspace. `linear.test.ts` asserts all of that rather than trusting it.
 *
 * ## The seam, if this is ever automated
 *
 *   private Linear API → hard-coded issue allowlist → build-time sanitiser
 *   → `LinearReceipt[]` → page
 *
 * Every stage of that runs at build time on a machine holding the credential. The
 * browser only ever receives the last one. Deliberately not implemented in this pass
 * (see ADR 0010) because three receipts do not justify a credentialled build step, and
 * the seam is worth more written down than half-built.
 *
 * ## What a reader can and cannot check
 *
 * Every receipt declares an `evidence` state, and the three are not decorations on one
 * fact. `unresolved` claims nothing. `private-verified` says the author checked the
 * curated text against the underlying issue on a stated date, which is an attestation
 * rather than evidence and renders without a call to action. `public-verified` is the
 * only state that carries a destination, and it means an artifact anyone can open.
 *
 * ## The reachability trap, which this file has already fallen into
 *
 * INFRA-11 was audited as publishable with a public link to the Vreko implementation,
 * on the strength of reading `apps/agent-router/src/linearApi.ts` in `vreko-dev/vreko`.
 * That repository is private. So is `vreko-dev/content`, the only other place the agent
 * lifecycle symbols appear. Both return 404 to a reader who is not signed in.
 *
 * The mistake is an easy one and worth naming: an authenticated author browsing their
 * own organisation sees a working URL, and cannot see that it is working *because they
 * are signed in*. On a page whose entire argument is "open this and check it", a 404 is
 * the worst available outcome, strictly worse than claiming nothing.
 *
 * So `public-verified` requires a destination confirmed to resolve **while signed out**,
 * not merely a URL that loads. INFRA-11 stays `private-verified` until the lifecycle
 * code lands somewhere public. The state exists and is unused, which is the correct
 * shape for a rule that is waiting on a fact rather than on an implementation.
 */
export const LINEAR_RECEIPTS: readonly LinearReceipt[] = [
  {
    identifier: 'META-268',
    title: 'Native delegation versus a custom orchestrator',
    question:
      'Should agent work be handed to Codex through Linear’s own delegation, or through an orchestration layer built alongside it?',
    /*
     * This used to read "Native delegation was kept" and label itself "boundary held",
     * which is a stronger claim than the issue supports. The gate was conditional and
     * the first native proof failed it: the session started and Codex landed in a
     * checkout with no Git remote, so repository context did not survive delegation.
     *
     * Stating that is the better signal anyway. Testing the simpler architecture and
     * declining to declare victory when it missed a gate is the thing worth showing.
     */
    finding:
      'The boundary is conditional: use native Linear to Codex delegation for bounded repository work only when issue and repository context survive the handoff, and keep custom orchestration for routing, governance, cross-tool work and evidence aggregation. The first native proof reached a Linear Agent Session but failed the repository-context gate.',
    compact:
      'Conditional boundary: native Linear to Codex delegation for bounded repository work, only where repository context survives the handoff. The first native proof failed that gate.',
    status: 'Boundary defined · proof incomplete',
    boundary:
      'This establishes an architectural decision boundary and a failed proof gate. It does not establish that native delegation is reliable enough to replace the custom execution path in production.',
    evidence: { state: 'private-verified', checkedAt: '2026-08-26' },
  },
  {
    identifier: 'META-331',
    title: 'Linear as the control plane for execution surfaces',
    question:
      'When several execution surfaces can run the same work, which one is responsible for it, and where does that responsibility get recorded?',
    /*
     * "Implemented · in use" implied more closure than the record carries: the issue is
     * still open and its acceptance criteria are not complete. The routing model is
     * real and is being exercised, which is a different and smaller claim.
     */
    finding:
      'Linear is the control plane for the work graph, ownership, state and durable decision pointers. Specialist surfaces own ambiguity-heavy reasoning, bounded repository execution and multi-agent evaluation. Interlock is being used to validate and harvest this routing model rather than duplicating provider-native execution plumbing.',
    compact:
      'Linear owns the work graph, ownership, state and durable decision pointers; specialist surfaces own reasoning, bounded execution and evaluation. Under validation, not settled.',
    status: 'Operating contract · validation ongoing',
    boundary:
      'This is an operating model in one workspace, not evidence that the same routing contract scales unchanged across teams or concurrent execution surfaces.',
    evidence: { state: 'private-verified', checkedAt: '2026-08-26' },
  },
  {
    identifier: 'INFRA-11',
    title: 'Structured agent lifecycle: thought, progress, completion',
    question:
      'What does an agent have to emit for a human reading the issue later to reconstruct what it did?',
    /*
     * The API layer carries all three activity types plus session status and external
     * URLs. What the code shows is the webhook emitting the opening thought before
     * dispatch, so the finding stops there rather than implying every live run produces
     * the full three-event timeline.
     */
    finding:
      'Implemented a typed Linear agent-lifecycle API covering thought, progress and completion activities, session status, and external URLs. The current webhook path emits the opening thought acknowledgment before repository dispatch.',
    /*
     * The shortest of the three, because the row's own title already names the stages
     * and the sheet should not print them twice in four inches. Session status and
     * external URLs stay in the full finding, where there is room for the API surface.
     */
    compact: 'Typed API for all three stages. Currently emits the opening thought only.',
    status: 'Implemented · lifecycle API',
    boundary:
      'This establishes the integration contract and the current thought emission. It does not establish that every run produces all three lifecycle stages, nor how retries, partial sessions and cancellations behave.',
    /*
     * Not `public-verified`, despite the implementation existing and being the strongest
     * of the three. It lives in a private repository, so a link would 404 for every
     * reader. See the reachability note at the head of this file.
     */
    evidence: { state: 'private-verified', checkedAt: '2026-08-26' },
  },
];

/** Shown beneath the receipts on both the page and the résumé. */
export const LINEAR_RECEIPTS_BOUNDARY =
  "Curated summaries of work in a private Linear workspace, each checked against its issue before publication. That is the author's attestation, not something you can open. None is public.";
