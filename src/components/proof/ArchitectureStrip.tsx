import styles from './ArchitectureStrip.module.css';

export type ArchitectureNode = string | { label: string; accent?: boolean };

/**
 * An ordered chain of architecture layers or pipeline stages.
 *
 * An `<ol>`, because the order *is* the content: these are stages in sequence, and a
 * screen reader should hear them as such. The arrows and rules are decorative and hidden
 * from the accessibility tree — list semantics already convey the sequence, and reading
 * "right arrow" between every stage would add noise without adding meaning.
 *
 * No animation. Nothing about this diagram is clearer in motion than at rest.
 */
export function ArchitectureStrip({
  label,
  nodes,
  orientation = 'horizontal',
}: {
  label?: string;
  nodes: readonly ArchitectureNode[];
  orientation?: 'horizontal' | 'vertical';
}) {
  const arrow = orientation === 'horizontal' ? '→' : '↓';

  const chain = (
    <ol className={`${styles.chain} ${styles[orientation]}`}>
      {nodes.map((node, index) => {
        const item = typeof node === 'string' ? { label: node } : node;
        const isLast = index === nodes.length - 1;

        return (
          <li className={styles.item} key={item.label}>
            <span className={`${styles.node} ${item.accent ? styles.accent : ''}`.trim()}>
              {item.label}
            </span>
            {!isLast ? (
              <>
                {orientation === 'horizontal' ? (
                  <span className={styles.rule} aria-hidden="true" />
                ) : null}
                <span className={styles.connector} aria-hidden="true">
                  {arrow}
                </span>
              </>
            ) : null}
          </li>
        );
      })}
    </ol>
  );

  /*
   * Only the horizontal chain can overflow, so only it needs a focus stop — a
   * scrollable container that cannot be focused is unreachable without a pointer. The
   * stop goes on a wrapper rather than on the <ol> itself, because `role="region"` on
   * the list would replace its list semantics, and the sequence is the content here.
   */
  const body =
    orientation === 'horizontal' ? (
      <div
        className={styles.scroller}
        tabIndex={0}
        role="region"
        aria-label={label ?? 'Architecture'}
      >
        {chain}
      </div>
    ) : (
      chain
    );

  if (!label) return body;

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      {body}
    </div>
  );
}
