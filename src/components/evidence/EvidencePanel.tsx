import { ConceptMark } from '@/components/concept/ConceptMark';
import { countResolved } from '@/lib/evidence';
import type { EvidenceRef, EvidenceSummaryRow, ProofStatus } from '@/lib/types';
import { EvidenceDisclosure } from './EvidenceDisclosure';
import { EvidenceLink } from './EvidenceLink';
import { EvidenceSource } from './EvidenceSource';
import { EvidenceStatus } from './EvidenceStatus';
import styles from './EvidencePanel.module.css';

/**
 * The "VERIFY THIS" panel beside each proof — the scannable evidence list, with the
 * fuller typed drawer underneath.
 *
 * A Server Component wrapping one client leaf. Only the disclosure needs interactivity;
 * the rows, links, and counts render on the server and ship no JavaScript.
 *
 * The footer reports how much of this panel is actually inspectable today. Saying
 * "0 of 4" is the honest reading when no exact URLs have been supplied, and it is far
 * more useful to a skeptical evaluator than an unqualified "evidence source" line.
 */
export function EvidencePanel({
  status,
  code,
  rows,
  evidence,
  boundary,
  sourceNote,
}: {
  status: ProofStatus;
  code: string;
  rows: readonly EvidenceSummaryRow[];
  evidence: readonly EvidenceRef[];
  boundary: string;
  sourceNote?: string;
}) {
  const counts = countResolved([...rows, ...evidence]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <EvidenceStatus tone={status.tone} label="VERIFY THIS" />
        <span className={styles.code}>{code}</span>
      </div>

      {rows.map((row) => (
        <div className={styles.row} key={row.id}>
          <span className={styles.label}>{row.label}</span>
          <div className={styles.rowHead}>
            {row.detail ? (
              <span
                className={`${styles.detail} ${row.detailIsCode ? styles.detailCode : ''}`.trim()}
              >
                {row.detail}
              </span>
            ) : null}
            <EvidenceLink reference={row} cta={row.cta} />
          </div>
          <EvidenceSource reference={row} />
        </div>
      ))}

      <div className={styles.footer}>
        {/*
         * The composition's settled state, cropped: one node feeding another. It marks
         * the one line on the panel that says how much of this actually resolves — the
         * count of evidence rows that reach an artifact rather than stopping at a claim.
         */}
        <ConceptMark className={styles.footerMark} name="one-edge" />
        {sourceNote ??
          `${counts.resolved} of ${counts.total} evidence items resolve to an inspectable artifact`}
      </div>

      <EvidenceDisclosure code={code} rows={evidence} boundary={boundary} />
    </div>
  );
}
