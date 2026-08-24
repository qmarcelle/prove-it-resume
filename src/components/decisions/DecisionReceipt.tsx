'use client';

import { useId, useState } from 'react';
import { RECEIPT_SECTIONS } from '@/content/decisions';
import type { DecisionReceipt as Receipt } from '@/lib/types';
import styles from './DecisionReceipt.module.css';

/**
 * A Decision Receipt.
 *
 * The design prototype made these selectable checkboxes with a "3 selected · bring these
 * to the conversation" counter. That asks the evaluator to do work and gives nothing
 * back — the interaction ends where the interesting part starts. Here each question
 * opens into the receipt itself: constraint, alternatives, decision, tradeoff, evidence,
 * and what would change the decision now.
 *
 * Every receipt is currently unanswered, because the supplied material contains the
 * questions but none of the reasoning. Rather than hide that, an unanswered receipt
 * shows its own shape with each section marked as awaiting. An evaluator learns what
 * they would get and that it is not written yet, which is true and useful; a fabricated
 * rationale would be neither.
 */
function ReceiptBody({ receipt }: { receipt: Receipt }) {
  if (!receipt.decision) {
    return (
      <div className={styles.pending}>
        <p className={styles.pendingLead}>
          This receipt has not been written yet. It will answer the question in the
          structure below — nothing is drafted here, because a decision rationale that was
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

      {receipt.wouldChangeIf ? (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>WHAT WOULD CHANGE THE DECISION NOW</span>
          <p className={styles.fieldBody}>{receipt.wouldChangeIf}</p>
        </div>
      ) : null}
    </>
  );
}

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
          {open ? '▾' : '▸'}
        </span>
        <span className={styles.question}>
          {receipt.question}
          {!answered ? (
            <span className="visually-hidden"> — receipt not yet written</span>
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
    <div className={styles.list}>
      {receipts.map((receipt) => (
        <DecisionReceiptItem key={receipt.id} receipt={receipt} />
      ))}
    </div>
  );
}
