import type { LinearReceipt } from '@/lib/types';
import styles from '../ResumeDocument.module.css';

/**
 * Agent-platform receipts, on paper.
 *
 * Each row is an identifier, what it was answering, and what came of it. The
 * identifier is printed because it is what makes the claim checkable *in the room* —
 * an interviewer can ask about META-268 by name — and it is the only part of the
 * private workspace this document carries.
 *
 * There is no link, and that is the honest rendering rather than an omission: no public
 * artifact stands behind these, so under this site's own evidence rule they are stated
 * claims. The block's boundary says so in as many words, on the sheet, where a reader
 * meets the claim rather than three clicks away from it.
 */
export function ResumeAgentPlatformSection({
  receipts,
}: {
  receipts: readonly LinearReceipt[];
}) {
  return (
    <>
      {receipts.map((receipt, index) => (
        <article
          className={index === 0 ? styles.receiptLead : styles.receipt}
          key={receipt.identifier}
        >
          <div className={styles.receiptHead}>
            <span className={styles.receiptId}>{receipt.identifier}</span>
            <h3 className={styles.receiptTitle}>{receipt.title}</h3>
            <span className={styles.receiptStatus}>{receipt.status}</span>
          </div>
          <p className={styles.receiptBody}>{receipt.finding}</p>
        </article>
      ))}
    </>
  );
}
