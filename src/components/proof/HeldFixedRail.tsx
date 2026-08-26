import styles from './HeldFixedRail.module.css';

/**
 * The invariant conditions of a controlled comparison, as a rail beside it.
 *
 * These used to sit above the stage selector inside the interaction. That placement
 * was right about one thing: what was held fixed is the reason the comparison is
 * worth looking at, not a reward for stepping forward, and wrong about another: read
 * once and scrolled past, it stops being available exactly when the reader is looking
 * at the result and wondering what else moved.
 *
 * As a rail it stays beside the decision for the whole comparison. The varied input is
 * pinned to the foot of it, under its own rule, because "one thing changed" is the
 * claim the rest of the list exists to support.
 *
 * Entries are rendered as `term: detail` where the content supplies both: the field
 * name reads as a label and the value as data, without the content having to carry two
 * fields for what is one recorded condition.
 *
 * The delimiter is a colon rather than an em dash because the same strings are also
 * rendered flat (`InterlockSection` lists them as lines rather than as a rail) and a
 * delimiter that only some consumers split has to read as punctuation in the ones that
 * do not. It splits on the first `: ` only, so a value carrying its own colons
 * (`urn:li:dataset:…`, `sha256:…`) survives the round trip intact.
 */
export function HeldFixedRail({
  heldFixed,
  varied,
  label = 'HELD FIXED',
  variedLabel = 'VARIED · ONE THING',
}: {
  heldFixed: readonly string[];
  varied: string;
  label?: string;
  variedLabel?: string;
}) {
  return (
    <aside className={styles.rail} aria-label={label}>
      <span className={styles.label}>{label}</span>

      <dl className={styles.list}>
        {heldFixed.map((entry) => {
          const [term, ...rest] = entry.split(': ');
          const detail = rest.join(': ');
          return (
            <div className={styles.row} key={entry}>
              <dt className={styles.term}>{term}</dt>
              {detail ? <dd className={styles.detail}>{detail}</dd> : null}
            </div>
          );
        })}
      </dl>

      <div className={styles.varied}>
        <span className={styles.label}>{variedLabel}</span>
        <p className={styles.variedBody}>{varied}</p>
      </div>
    </aside>
  );
}
