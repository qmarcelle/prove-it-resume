import styles from './ProofScan.module.css';

export type ScanItem = { label: string; body: string };

/**
 * The scan layer: the whole proof answered in one pass, above the proof itself.
 *
 * The redesign splits each section into a scan layer and a proof layer. The reasoning
 * is about how the page is actually read: an evaluator skimming for fit needs the
 * shape of the argument in a few seconds, and an evaluator who has decided to check it
 * needs the diagram, the run and the artifacts. Making one of them scroll past the
 * other's material is what the old shared template did.
 *
 * So this is deliberately terse — a fixed set of short answers on one strong rule, in a
 * grid that reflows by count rather than a fixed column tally. Nothing here is unique
 * evidence: every item restates something the proof layer below states in full, which
 * is what makes it safe to skim and safe to skip.
 */
export function ProofScan({
  items,
  tone = 'light',
}: {
  items: readonly ScanItem[];
  tone?: 'light' | 'dark';
}) {
  return (
    <dl className={`${styles.scan} ${tone === 'dark' ? styles.dark : ''}`}>
      {items.map((item) => (
        <div className={styles.cell} key={item.label}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.body}>{item.body}</dd>
        </div>
      ))}
    </dl>
  );
}
