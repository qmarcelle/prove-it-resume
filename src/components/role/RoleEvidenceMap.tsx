import type { RoleEvidenceMapping } from '@/lib/types';
import styles from './RoleEvidenceMap.module.css';

/**
 * Maps an engineering problem to the evidence that speaks to it.
 *
 * A `<table>` because it is a three-column relation with meaningful headers, and a
 * screen-reader user moving cell to cell should hear which column they are in. The
 * design's flexbox rows looked identical but conveyed none of that.
 *
 * Rows come from the role lens. The lens chooses the order; it does not author the
 * evidence.
 */
export function RoleEvidenceMap({ rows }: { rows: readonly RoleEvidenceMapping[] }) {
  return (
    // Focusable because it scrolls horizontally on narrow viewports.
    <div
      className={styles.wrap}
      tabIndex={0}
      role="region"
      aria-label="Role evidence map"
    >
      <table className={styles.table}>
        <caption className="visually-hidden">
          Engineering problems mapped to the evidence on this page and what can be
          discussed in depth.
        </caption>
        <thead>
          <tr>
            <th scope="col">YOUR ENGINEERING PROBLEM</th>
            <th scope="col">RELEVANT EVIDENCE</th>
            <th scope="col">WHAT I CAN DISCUSS IN DEPTH</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.problem}>
              <th className={styles.problem} scope="row">
                {row.problem}
              </th>
              <td className={styles.evidence}>{row.evidence}</td>
              <td className={styles.discuss}>{row.discuss}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
