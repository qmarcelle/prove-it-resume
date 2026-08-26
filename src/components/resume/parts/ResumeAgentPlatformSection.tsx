import type { LinearReceipt } from '@/lib/types';
import styles from '../ResumeDocument.module.css';

/**
 * Agent-platform receipts, on paper.
 *
 * Each row is an identifier, what it was answering, and what came of it. The
 * identifier is printed because it is what makes the claim checkable *in the room*
 * (an interviewer can ask about META-268 by name) and it is the only part of the
 * private workspace this document carries.
 *
 * There is no link, and that is the honest rendering rather than an omission: no receipt
 * currently has a public artifact behind it, so there is nowhere to send a reader. The
 * block's boundary says who checked these and what that is worth, on the sheet, where a
 * reader meets the claim rather than three clicks away from it.
 *
 * The sheet carries no per-row evidence mark, which is why `resume.test.ts` fails if any
 * receipt gains a destination: at that point the page would be offering something the
 * printed version silently withholds.
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
          {/*
           * The compact finding where one exists. Not a truncation: a durable short form
           * written for this sheet, so the printed claim carries its own hedges rather
           * than losing them at a character count.
           */}
          <p className={styles.receiptBody}>{receipt.compact ?? receipt.finding}</p>
        </article>
      ))}
    </>
  );
}
