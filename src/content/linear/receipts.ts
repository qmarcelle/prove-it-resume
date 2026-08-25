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
 * browser only ever receives the last one. Deliberately not implemented in this pass —
 * see ADR 0010 — because three receipts do not justify a credentialled build step, and
 * the seam is worth more written down than half-built.
 *
 * ## What a reader can and cannot check
 *
 * These carry no `publicEvidenceHref`, because no public artifact exists behind them.
 * Under this site's own evidence rule that makes them *unverified* — they render as
 * stated claims with no call to action, exactly like every other row whose artifact is
 * not inspectable. That is the honest rendering, and it is why they sit in their own
 * section with their own boundary rather than being mixed into the proof evidence.
 */
export const LINEAR_RECEIPTS: readonly LinearReceipt[] = [
  {
    identifier: 'META-268',
    title: 'Native delegation versus a custom orchestrator',
    question:
      'Should agent work be handed to Codex through Linear’s own delegation, or through an orchestration layer built alongside it?',
    finding:
      'Native delegation was kept; the custom boundary was drawn around what Linear does not own — local execution, repository context, and the evidence written back.',
    status: 'Decided · boundary held',
    boundary:
      'A decision record about one workspace’s configuration. It does not establish throughput, adoption, or that the same boundary is right for a team with different execution surfaces.',
    verifiedAt: '2026-08-25',
  },
  {
    identifier: 'META-331',
    title: 'Linear as the control plane for execution surfaces',
    question:
      'When several execution surfaces can run the same work, which one is responsible for it, and where does that responsibility get recorded?',
    finding:
      'An execution-surface responsibility model with Linear as the control plane: the issue is the one place work is assigned, tracked, and closed, and runners stay interchangeable beneath it.',
    status: 'Implemented · in use',
    boundary:
      'Describes a model in operation in one workspace. It does not establish multi-team behaviour, nor how the model degrades when two surfaces claim the same issue concurrently.',
    verifiedAt: '2026-08-25',
  },
  {
    identifier: 'INFRA-11',
    title: 'Structured agent lifecycle: thought → progress → completion',
    question:
      'What does an agent have to emit for a human reading the issue later to reconstruct what it did?',
    finding:
      'Agent lifecycle integration structured as thought → progress → completion, so a session leaves a readable trace on the issue rather than one terminal comment.',
    status: 'Implemented',
    boundary:
      'Establishes the integration shape, not its reliability under failure: partial sessions, retries, and cancelled runs are not characterised here.',
    verifiedAt: '2026-08-25',
  },
];

/** Shown beneath the receipts on both the page and the résumé. */
export const LINEAR_RECEIPTS_BOUNDARY =
  'Curated summaries of private workspace decisions, written for publication rather than exported. No public artifact stands behind them: stated claims, not verified evidence.';
