import { ProgressiveDisclosure } from '@/components/interactions/ProgressiveDisclosure';
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
export function RoleEvidenceMap({
  rows,
  focus,
  queryKey,
}: {
  rows: readonly RoleEvidenceMapping[];
  /**
   * How many leading rows answer the question on their own, where a surface has decided
   * that fewer read better than all of them.
   *
   * The split is a *display* decision over rows the lens already ordered: `focus` counts
   * off the front of the same array, so it can only ever promote what
   * `prioritiseMapping` promoted. There is no second dataset it could disagree with, and
   * nothing it can drop: the remainder is one control away, at a deterministic address.
   *
   * Absent means show every row, which is what `/` and the role routes do: they open on
   * this table rather than closing on it, and a reader who has read nothing yet needs
   * the whole relation to find their own problem in it.
   */
  focus?: number;
  /** The query key the remainder opens under. Required for a split to render. */
  queryKey?: string;
}) {
  const split = focus !== undefined && queryKey !== undefined && focus < rows.length;
  const lead = split ? rows.slice(0, focus) : rows;
  const rest = split ? rows.slice(focus) : [];

  return (
    <>
      <MapTable
        caption={
          split
            ? 'The engineering problems this work speaks to most directly, mapped to the evidence on this page and what can be discussed in depth. The remaining rows follow, behind a control.'
            : 'Engineering problems mapped to the evidence on this page and what can be discussed in depth.'
        }
        label="Role evidence map"
        rows={lead}
      />

      {rest.length > 0 && queryKey !== undefined ? (
        <ProgressiveDisclosure
          /*
           * The same group label the five chapters use, deliberately. It is one
           * interaction grammar a reader learns once, and it is also what keeps this
           * panel inside the suites that sweep every disclosure on the page for overflow,
           * clipping, touch targets and axe violations.
           */
          label="Questions this mapping can answer"
          paths={[
            {
              id: 'complete',
              /*
               * Specific about what is behind it and how much, which is the rule these
               * invitations are held to. It is also the only honest wording: the panel
               * holds the rows the default view does not, not a second copy of all of
               * them.
               */
              invitation: 'See the rest of the mapping',
              label: 'THE PROBLEMS THIS WORK ALSO TOUCHES',
              content: (
                <MapTable
                  caption="The remaining engineering problems, continuing the mapping above."
                  label="Role evidence map, continued"
                  rows={rest}
                />
              ),
            },
          ]}
          queryKey={queryKey}
        />
      ) : null}
    </>
  );
}

/**
 * One table of the relation.
 *
 * The split renders two of these rather than hiding rows inside one, so each carries its
 * own header row and its own caption. A screen reader landing in the second table hears
 * which column it is in and that it continues the first; rows smuggled into one `tbody`
 * and revealed by a control outside it would announce neither.
 */
function MapTable({
  rows,
  caption,
  label,
}: {
  rows: readonly RoleEvidenceMapping[];
  caption: string;
  label: string;
}) {
  return (
    // Focusable because it scrolls horizontally on narrow viewports.
    <div className={styles.wrap} tabIndex={0} role="region" aria-label={label}>
      <table className={styles.table}>
        <caption className="visually-hidden">{caption}</caption>
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
