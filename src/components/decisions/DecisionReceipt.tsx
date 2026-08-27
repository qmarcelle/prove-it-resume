'use client';

import { useId, useState } from 'react';
import { EvidenceLink } from '@/components/evidence/EvidenceLink';
import { RECEIPT_SECTIONS } from '@/content/decisions';
import { evidenceKindLabel } from '@/lib/evidence';
import type { DecisionReceipt as Receipt } from '@/lib/types';
import { ActionIcon } from '@/components/icon/Icon';
import styles from './DecisionReceipt.module.css';

/**
 * A Decision Receipt.
 *
 * The design prototype made these selectable checkboxes with a "3 selected · bring these
 * to the conversation" counter. That asks the evaluator to do work and gives nothing
 * back: the interaction ends where the interesting part starts. Here each question
 * opens into the receipt itself: constraint, alternatives, decision, tradeoff, evidence,
 * and what would change the decision now.
 *
 * The awaiting branch below is not dead code kept for symmetry. Receipts are populated
 * from recorded reasoning, and a question that has been asked but not yet answered from
 * a real decision record renders its own shape with each section marked as awaiting,
 * which is true and useful, where a fabricated rationale would be neither.
 *
 * `EVIDENCE` renders only when a receipt carries rows. The site's evidence-integrity
 * rule applies unchanged here: `EvidenceLink` is the only thing that can produce an
 * href, so a row without a confirmed artifact states the gap instead of linking.
 */
function ReceiptBody({ receipt }: { receipt: Receipt }) {
  if (!receipt.decision) {
    return (
      <div className={styles.pending}>
        <p className={styles.pendingLead}>
          This receipt has not been written yet. It will answer the question in the
          structure below; nothing is drafted here, because a decision rationale that was
          invented to fill a layout would be worth less than an empty one.
        </p>
        <ul className={styles.shape}>
          {RECEIPT_SECTIONS.map((section) => (
            <li className={styles.shapeRow} key={section}>
              {section}
              <span className={styles.shapeRule} aria-hidden="true" />
              <span className={styles.awaiting}>AWAITING</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <>
      {receipt.constraint ? (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>CONSTRAINT</span>
          <p className={styles.fieldBody}>{receipt.constraint}</p>
        </div>
      ) : null}

      {receipt.alternatives?.length ? (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>ALTERNATIVES CONSIDERED</span>
          <ul className={styles.fieldList}>
            {receipt.alternatives.map((alternative) => (
              <li key={alternative}>{alternative}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={styles.field}>
        <span className={styles.fieldLabel}>DECISION</span>
        <p className={styles.fieldBody}>{receipt.decision}</p>
      </div>

      {receipt.tradeoff ? (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>FAILURE MODE / TRADEOFF</span>
          <p className={styles.fieldBody}>{receipt.tradeoff}</p>
        </div>
      ) : null}

      {receipt.evidence?.length ? (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>EVIDENCE</span>
          <ul className={styles.evidenceList}>
            {receipt.evidence.map((reference) => (
              <li className={styles.evidenceRow} key={reference.id}>
                <span className={styles.evidenceKind}>
                  {evidenceKindLabel(reference.kind)}
                </span>
                <span className={styles.evidenceText}>
                  <span className={styles.evidenceTitle}>{reference.title}</span>
                  {reference.description ? (
                    <span className={styles.evidenceDescription}>
                      {reference.description}
                    </span>
                  ) : null}
                </span>
                <EvidenceLink reference={reference} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {receipt.wouldChangeIf ? (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>WHAT WOULD CHANGE THE DECISION NOW</span>
          <p className={styles.fieldBody}>{receipt.wouldChangeIf}</p>
        </div>
      ) : null}
    </>
  );
}

/**
 * One receipt, and it rests closed.
 *
 * There was an `initiallyOpen` prop here, and a surface used it to serve one receipt
 * already expanded. It is gone rather than merely unused: a receipt that opens itself is
 * a decision about the *page*, and leaving the lever in place means the resting state of
 * this section is one attribute away from changing without anybody re-reading why it is
 * what it is. Every receipt now rests collapsed on every surface, and the section makes
 * its case above the list instead: the shape of a receipt is stated there, in the open,
 * without a reader having to spend an interaction to see it.
 */
export function DecisionReceiptItem({ receipt }: { receipt: Receipt }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const answered = Boolean(receipt.decision);

  return (
    <div className={`${styles.item} ${open ? styles.itemOpen : ''}`.trim()}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.marker} aria-hidden="true">
          <ActionIcon
            affordance={open ? 'collapse-in-place' : 'expand-in-place'}
            placement="alone"
            size={12}
          />
        </span>
        <span className={styles.question}>
          {receipt.question}
          {!answered ? (
            <span className="visually-hidden">, receipt not yet written</span>
          ) : null}
        </span>
      </button>

      {open ? (
        <div className={styles.receipt} id={panelId}>
          <ReceiptBody receipt={receipt} />
        </div>
      ) : null}
    </div>
  );
}

export function DecisionReceiptList({ receipts }: { receipts: readonly Receipt[] }) {
  return (
    /*
     * A named group, so the seven disclosures announce themselves as one set.
     *
     * Without it a screen-reader user meets seven unrelated collapsed controls in a
     * section that also carries the mapping's own control, and nothing says which of them
     * are the recorded decisions. The heading above states it visually; this states it to
     * everyone else.
     */
    <div aria-label="Decision receipts" className={styles.list} role="group">
      {receipts.map((receipt) => (
        <DecisionReceiptItem key={receipt.id} receipt={receipt} />
      ))}
    </div>
  );
}
