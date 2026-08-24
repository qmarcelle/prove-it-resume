'use client';

import { useId, useState } from 'react';
import { CLAIMS } from '@/content/claims';
import styles from './ClaimLedger.module.css';

/**
 * The Claim Ledger: every claim on the page with its basis and its limit.
 *
 * Collapsed by default and kept visually quiet on purpose. It exists so a skeptical
 * evaluator can audit the argument, not so the evidence framework becomes the subject.
 * If this section ever starts to feel like the main event, the page has drifted.
 *
 * A real `<table>`, because this is genuinely tabular: three related values per row,
 * with headers that a screen reader should associate with each cell.
 */
export function ClaimLedger() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section className={styles.section} id="ledger" aria-labelledby={`${panelId}-label`}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        id={`${panelId}-label`}
      >
        {open ? 'HIDE CLAIM LEDGER −' : 'SHOW CLAIM LEDGER +'}
        <span className={styles.toggleMeta}>CLAIM · EVIDENCE · BOUNDARY</span>
      </button>

      {/*
        The wrapper scrolls horizontally on narrow viewports, so it must be focusable —
        otherwise its content is unreachable without a pointer. `role="region"` plus a
        name is what turns that focus stop into something meaningful to announce.
      */}
      {open ? (
        <div
          className={styles.tableWrap}
          id={panelId}
          tabIndex={0}
          role="region"
          aria-label="Claim ledger"
        >
          <table className={styles.table}>
            <caption className="visually-hidden">
              Every claim made on this page, the evidence behind it, and what it does not
              establish.
            </caption>
            <thead>
              <tr>
                <th scope="col">CLAIM</th>
                <th scope="col">EVIDENCE</th>
                <th scope="col">BOUNDARY</th>
              </tr>
            </thead>
            <tbody>
              {CLAIMS.map((row) => (
                <tr key={row.id}>
                  <td className={styles.claim}>{row.claim}</td>
                  <td className={styles.evidence}>{row.evidence}</td>
                  <td className={styles.boundary}>{row.boundary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
