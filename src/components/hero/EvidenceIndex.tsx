import { SITE } from '@/content/site';
import { EvidenceStatus } from '@/components/evidence/EvidenceStatus';
import type { IndexEntry } from '@/lib/types';
import styles from './EvidenceIndex.module.css';

/**
 * The Evidence Index: the systems worth opening, above the fold, as ordinary anchors.
 *
 * This is the ten-second answer to "where do I start?", so it stays compact, stays
 * scannable, and stays link-based; it works before hydration, without JavaScript, and
 * from a keyboard with no special handling.
 *
 * ## Why it no longer counts
 *
 * It used to number its own rows `01`, `02`, `03` from their position in this list.
 * That number belonged to nothing: on `/` the index said `01 Vreko` while the section
 * it linked to printed `02`, and on `/linear` it said `01 Repository Intelligence`
 * while the body called that section `04` and gave `01` to a different system entirely.
 * The reader's question (*which `01` is this?*) had no good answer, because the page
 * genuinely had three of them.
 *
 * The number was never carrying information here. A row's name and its status are what
 * a reader picks a starting point on; the sequence they will read in is the page's, and
 * the page states it. So the ordinal is gone and the visible sequence has exactly one
 * owner: the page plan.
 *
 * ## Why the caption is a masthead and not a footer
 *
 * `caption` names what the list is, in place of the count this used to print. It sat
 * under the rows, next to a link to the GitHub profile, in a 42px band, which put the
 * instruction for reading a list *after* the list, and spent the tallest object in the
 * hero's right column on a third copy of a link already in the top nav and in the hero's
 * own action row. Read after the rows, "START ANYWHERE" is advice arriving too late.
 *
 * So it moves up beside the title, the profile link goes, and the band goes with it. The
 * index is the same four rows and the same four statuses, in one panel shorter by the
 * height of a row.
 *
 * ## Why it takes entries rather than proofs
 *
 * On an application surface the most important thing to open may not be one of the
 * three durable proofs. `/linear` promotes Never Ask Twice to the head of its evidence,
 * and an index that structurally could not list it would be advertising the wrong
 * three. Entries are a *listing* shape (name, one line, status, anchor) built by the
 * composition from records it already holds. There is no field here for a claim.
 */
export function EvidenceIndex({
  entries,
  caption,
}: {
  entries: readonly IndexEntry[];
  /** Names what this list is, in place of a count. */
  caption: string;
}) {
  return (
    <nav className={styles.index} aria-label="Evidence index">
      <div className={styles.header}>
        <span className={styles.title}>EVIDENCE INDEX</span>
        <span className={styles.captionDivider} aria-hidden="true">
          ·
        </span>
        <span className={styles.caption}>{caption}</span>
        <span className={styles.revision}>{SITE.revision}</span>
      </div>

      <ul className={styles.list}>
        {entries.map((entry) => (
          <li key={entry.id}>
            <a className={styles.entry} href={`#${entry.id}`}>
              <span className={styles.body}>
                <span className={styles.name}>{entry.title}</span>
                <span
                  className={`${styles.summary} ${entry.summaryIsCode ? styles.summaryCode : ''}`.trim()}
                >
                  {entry.summary}
                </span>
                <EvidenceStatus
                  tone={entry.status.tone}
                  label={entry.status.label}
                  className={styles.status}
                />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
