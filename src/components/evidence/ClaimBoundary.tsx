import styles from './ClaimBoundary.module.css';

/**
 * What a piece of evidence does *not* establish.
 *
 * This component exists so that a boundary is never optional decoration. Every proof
 * renders one, always last, always in the same place — a claim whose limits are stated
 * in the same breath is a claim an evaluator can actually use.
 */
export function ClaimBoundary({
  children,
  variant = 'row',
  label = 'BOUNDARY',
}: {
  children: React.ReactNode;
  /** `row` sits inside an evidence drawer; `note` stands alone beside a panel. */
  variant?: 'row' | 'note';
  label?: string;
}) {
  return (
    <div className={`${styles.boundary} ${variant === 'note' ? styles.note : ''}`.trim()}>
      <div className={styles.label}>
        <span className={styles.rule} aria-hidden="true" />
        {label}
      </div>
      <p className={styles.body}>{children}</p>
    </div>
  );
}
