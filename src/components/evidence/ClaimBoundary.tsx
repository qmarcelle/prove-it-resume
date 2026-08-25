import { ConceptMark } from '@/components/concept/ConceptMark';
import styles from './ClaimBoundary.module.css';

/**
 * What a piece of evidence does *not* establish.
 *
 * This component exists so that a boundary is never optional decoration. Every proof
 * renders one, always last, always in the same place — a claim whose limits are stated
 * in the same breath is a claim an evaluator can actually use.
 *
 * The mark beside the label is the hero composition's bounded field, cropped: two bounds
 * enclosing a region. A reader has already watched that boundary close once, at the top
 * of the page, around a candidate it deliberately left outside — so by the time it
 * appears here it is a shape they have been taught rather than a decoration they are
 * meeting cold. It replaces a short rule that said only "something begins here".
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
        <ConceptMark className={styles.mark} name="bounded-field" />
        {label}
      </div>
      <p className={styles.body}>{children}</p>
    </div>
  );
}
