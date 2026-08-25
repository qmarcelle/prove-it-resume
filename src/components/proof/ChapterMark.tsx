import styles from './ChapterMark.module.css';

/**
 * The chapter number, and the orientation it is read in.
 *
 * The redesign gives each proof its own spatial grammar while holding the measure
 * constant: every section is still `--page-max` wide, and what varies is scale,
 * orientation and density. This component is where that variation is declared, so the
 * difference between the three proofs is a prop rather than three hand-built headers
 * that will drift.
 *
 * - `horizontal` — an oversized number beside the title. Vreko, which opens the sequence.
 * - `inline` — number and run identifier on one metadata line, title beneath. Repository
 *   Intelligence, whose dark treatment is already carrying the emphasis and does not
 *   need a second loud element.
 * - `vertical` — the number over a rule with the label rotated alongside. Interlock,
 *   which is read against a horizontal axis and wants its chapter furniture out of that
 *   axis's way.
 *
 * `tone` exists because Repository Intelligence inverts: the same structure has to sit
 * on graphite without the light-surface colours going invisible.
 */
export function ChapterMark({
  stage,
  label,
  title,
  titleId,
  orientation = 'horizontal',
  tone = 'light',
  meta,
}: {
  stage: string;
  label: string;
  title?: string;
  titleId?: string;
  orientation?: 'horizontal' | 'inline' | 'vertical';
  tone?: 'light' | 'dark';
  /** A second metadata string, shown only by `inline`. */
  meta?: string;
}) {
  const className = `${styles.mark} ${styles[orientation]} ${tone === 'dark' ? styles.dark : ''}`;

  if (orientation === 'vertical') {
    return (
      <div className={className}>
        <span className={styles.number} aria-hidden="true">
          {stage}
        </span>
        <span className={styles.rule} aria-hidden="true" />
        <span className={styles.verticalLabel}>{label}</span>
      </div>
    );
  }

  if (orientation === 'inline') {
    return (
      <div className={className}>
        <div className={styles.metaRow}>
          <span className={styles.inlineLabel}>
            {stage} / {label}
          </span>
          {meta ? <span className={styles.metaSecondary}>{meta}</span> : null}
        </div>
        {title ? (
          <h2 className={styles.title} id={titleId}>
            {title}
          </h2>
        ) : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <span className={styles.number} aria-hidden="true">
        {stage}
      </span>
      <div className={styles.stack}>
        <span className={styles.label}>{label}</span>
        {title ? (
          <h2 className={styles.title} id={titleId}>
            {title}
          </h2>
        ) : null}
      </div>
    </div>
  );
}
