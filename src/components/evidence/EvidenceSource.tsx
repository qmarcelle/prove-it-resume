import { resolveSource } from '@/lib/evidence';
import type { SourcePin } from '@/lib/types';
import styles from './EvidenceSource.module.css';

/**
 * The quiet secondary citation beside an evidence call to action.
 *
 * The call to action goes to the published site or docs, because that is what a person
 * can actually read. This renders the frozen artifact the claim was written against —
 * a commit-pinned file, a versioned schema — so that "inspect the run" and "cite the
 * evidence" stop competing for the same link.
 *
 * Rendered as `source: <label> ↗` in the metadata face, deliberately below the CTA in
 * visual weight. It is for the reader who wants to check the claim, not the reader
 * deciding whether to.
 */
export function EvidenceSource({ reference }: { reference: SourcePin }) {
  const source = resolveSource(reference);
  if (!source) return null;

  return (
    <a
      className={styles.source}
      href={source.href}
      target="_blank"
      rel="noreferrer noopener"
    >
      <span className={styles.prefix}>source:</span> {source.label} ↗
      {/*
       * The row title is deliberately not repeated here. `EvidenceLink` already
       * announces it on the call to action immediately before this one, and the
       * source label is itself unique, so restating it made every row announce its
       * title twice.
       */}
      <span className="visually-hidden"> — pinned source, opens in a new tab</span>
    </a>
  );
}
