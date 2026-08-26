import type { ProofStatusTone } from '@/lib/types';
import styles from './EvidenceStatus.module.css';

/**
 * A status marker: shipped, implemented, or controlled evidence.
 *
 * Three tones, three glyph shapes, three colours. The shape carries the distinction on
 * its own, so status is never encoded by colour alone.
 *
 * `tone` and `label` are separate props because they vary independently: an evidence
 * panel header reuses a proof's tone under the text "VERIFY THIS".
 */
export function EvidenceStatus({
  tone,
  label,
  className,
}: {
  tone: ProofStatusTone;
  label: string;
  className?: string;
}) {
  return (
    <span className={[styles.status, styles[tone], className].filter(Boolean).join(' ')}>
      <span className={styles.mark} aria-hidden="true" />
      {label}
    </span>
  );
}
