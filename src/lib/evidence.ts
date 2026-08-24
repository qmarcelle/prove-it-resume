import type { EvidenceKind, EvidenceRef, EvidenceSummaryRow } from './types';

/**
 * The evidence-integrity rule, in one place.
 *
 * No evidence call to action without evidence. A row is linkable only when it names a
 * destination *and* that destination has been confirmed to be the artifact the row
 * claims. Everything else is unresolved and renders as a stated gap, because an
 * evaluator who clicks "Inspect source" and lands on a profile page learns something
 * worse than nothing.
 *
 * Centralising this means a future contributor cannot add a link by accident: the
 * components have no other way to produce an href.
 */
export type ResolvedEvidence =
  { status: 'resolved'; href: string } | { status: 'unresolved' };

export function resolveEvidence(ref: {
  href?: string;
  verified: boolean;
}): ResolvedEvidence {
  if (ref.verified && ref.href) {
    return { status: 'resolved', href: ref.href };
  }
  return { status: 'unresolved' };
}

export function isResolved(ref: { href?: string; verified: boolean }): boolean {
  return resolveEvidence(ref).status === 'resolved';
}

/** Shown wherever a call to action would otherwise be. Matches the design export. */
export const UNRESOLVED_LABEL = '[VERIFY BEFORE PUBLISHING]';

const EVIDENCE_KIND_LABELS: Record<EvidenceKind, string> = {
  source: 'SOURCE',
  specification: 'SPECIFICATION',
  experiment: 'EXPERIMENT',
  observed: 'OBSERVED',
  deployed: 'DEPLOYED',
  research: 'RESEARCH',
  boundary: 'BOUNDARY',
};

export function evidenceKindLabel(kind: EvidenceKind): string {
  return EVIDENCE_KIND_LABELS[kind];
}

/**
 * Counts of what an evaluator can actually go and look at, for the panel footer.
 * Reported honestly: if nothing is resolved yet, the panel says so.
 */
export function countResolved(rows: ReadonlyArray<EvidenceRef | EvidenceSummaryRow>): {
  resolved: number;
  total: number;
} {
  return {
    resolved: rows.filter(isResolved).length,
    total: rows.length,
  };
}
