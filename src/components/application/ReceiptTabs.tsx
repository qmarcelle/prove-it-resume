'use client';

import { useId, useRef, useState, useSyncExternalStore } from 'react';
import { ClaimBoundary } from '@/components/evidence/ClaimBoundary';
import { ActionIcon } from '@/components/icon/Icon';
import { UNRESOLVED_LABEL } from '@/lib/evidence';
import type { LinearReceipt } from '@/lib/types';
import styles from './ReceiptTabs.module.css';

/**
 * Whether React has hydrated, without a state-setting effect.
 *
 * The store never changes, so `subscribe` returns a no-op unsubscribe: the only thing
 * being read is *which snapshot React asked for*. The server and the hydration pass get
 * `false`, every render after gets `true`.
 */
const NEVER_CHANGES = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    NEVER_CHANGES,
    () => true,
    () => false,
  );

/**
 * The receipt set, as a tab strip that starts life as a stacked list.
 *
 * ## Why it starts stacked
 *
 * The direction sets this block as three tabs carrying id, name and state, with the
 * selected receipt in a panel beside them. The site's own rule is that the page has to
 * be understandable with JavaScript off, and the direction agrees; it names the
 * degraded form explicitly: "the tab set degrades to three stacked receipts".
 *
 * So the stacked form is not a fallback bolted on afterwards; it is what the server
 * renders and what the first client render reproduces, which is also why there is no
 * hydration mismatch to reconcile. The strip takes over on the render after hydration.
 * With scripting off that render never happens, and all three receipts stay open, each
 * with its own boundary and its own evidence mark.
 *
 * The alternative: server-rendering `role="tab"` buttons and letting them do nothing
 * until hydration: was rejected because a control announced to assistive technology as
 * a tab, that does not switch anything, is a worse failure than a longer page.
 *
 * ## Keyboard behaviour
 *
 * Arrow keys move between tabs and select as they go, with Home and End for the ends:
 * the WAI-ARIA automatic-activation pattern. The direction asks for the panel to take
 * focus on activation, and that is deliberately not done on arrow keys: moving focus
 * into the panel is exactly what would make the next arrow press stop working. Tab
 * reaches the panel, which carries `tabIndex={0}` so its prose is keyboard-scrollable.
 *
 * ## Selection is never carried by colour alone
 *
 * A selected tab changes its edge, its field, its label brightness *and* gains a filled
 * mark, on top of `aria-selected`. Three of those are chromatic and the fourth is not,
 * which is the part that matters.
 */
export function ReceiptTabs({ receipts }: { receipts: readonly LinearReceipt[] }) {
  const hydrated = useHydrated();
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();

  if (!hydrated) {
    return (
      <ol className={styles.receipts}>
        {receipts.map((receipt) => (
          <li className={styles.receipt} key={receipt.identifier}>
            <ReceiptHead receipt={receipt} />
            <ReceiptBody receipt={receipt} />
          </li>
        ))}
      </ol>
    );
  }

  const move = (event: React.KeyboardEvent) => {
    const last = receipts.length - 1;
    const next = {
      ArrowRight: selected === last ? 0 : selected + 1,
      ArrowDown: selected === last ? 0 : selected + 1,
      ArrowLeft: selected === 0 ? last : selected - 1,
      ArrowUp: selected === 0 ? last : selected - 1,
      Home: 0,
      End: last,
    }[event.key];

    if (next === undefined) return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  };

  const receipt = receipts[selected];

  return (
    <div className={styles.tabSet}>
      <div
        aria-label="Workspace receipts"
        className={styles.tabList}
        onKeyDown={move}
        role="tablist"
      >
        {receipts.map((entry, index) => (
          <button
            aria-controls={`${base}-panel`}
            aria-selected={index === selected}
            className={styles.tab}
            id={`${base}-tab-${index}`}
            key={entry.identifier}
            onClick={() => setSelected(index)}
            ref={(node) => {
              tabs.current[index] = node;
            }}
            role="tab"
            tabIndex={index === selected ? 0 : -1}
            type="button"
          >
            {/*
             * The shape that carries selection without hue. Decorative: `aria-selected`
             * on the button already says the same thing to anything not looking at it.
             */}
            <span aria-hidden="true" className={styles.tabMark} />
            <span className={styles.tabId}>{entry.identifier}</span>
            <span className={styles.tabTitle}>{entry.title}</span>
            <span className={styles.tabStatus}>{entry.status}</span>
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`${base}-tab-${selected}`}
        className={styles.tabPanel}
        id={`${base}-panel`}
        role="tabpanel"
        tabIndex={0}
      >
        <ReceiptBody receipt={receipt} />
      </div>
    </div>
  );
}

/**
 * Identifier, title and state.
 *
 * Only the stacked form renders this: in the tab form the same three facts are the tab
 * itself, and printing them again above the panel would be the page saying one thing
 * twice in the space of an inch.
 */
function ReceiptHead({ receipt }: { receipt: LinearReceipt }) {
  return (
    <div className={styles.receiptHead}>
      <span className={styles.receiptId}>{receipt.identifier}</span>
      <h3 className={styles.receiptTitle}>{receipt.title}</h3>
      <span className={styles.receiptStatus}>{receipt.status}</span>
    </div>
  );
}

/**
 * The question, the finding, the boundary, and the mark that says how far it can be
 * checked. Identical in both forms: the layout may change, the disclosure may not.
 */
function ReceiptBody({ receipt }: { receipt: LinearReceipt }) {
  return (
    <>
      <div className={styles.receiptField}>
        <span className={styles.receiptLabel}>QUESTION</span>
        <p className={styles.receiptText}>{receipt.question}</p>
      </div>

      <div className={styles.receiptField}>
        <span className={styles.receiptLabel}>FINDING</span>
        <p className={styles.receiptText}>{receipt.finding}</p>
      </div>

      <ClaimBoundary variant="note">{receipt.boundary}</ClaimBoundary>

      <ReceiptEvidenceMark receipt={receipt} />
    </>
  );
}

/**
 * How far this row can be checked, in the place a call to action would sit.
 *
 * Three states, three visibly different marks, and the differences are load-bearing
 * rather than decorative:
 *
 * - **unresolved** keeps the dashed `[VERIFY BEFORE PUBLISHING]` every unverified row
 *   on this site carries. Nothing has been checked and the mark says so.
 * - **private-verified** is a solid hairline rather than a dash, because the dashed
 *   treatment is this site's mark for *absence* and something was in fact checked. It
 *   still offers nothing to click, and its words name who did the checking and against
 *   what, so it cannot be misread as the guarantee the row below it carries.
 * - **public-verified** is the only one with a destination, because it is the only one
 *   with somewhere honest to send a reader.
 *
 * The middle state is the one to watch in review. Its whole risk is drifting toward
 * looking like the third, and the moment it gains a link or the word "verified" standing
 * on its own, it is claiming something the reader cannot check.
 */
function ReceiptEvidenceMark({ receipt }: { receipt: LinearReceipt }) {
  const { evidence } = receipt;

  if (evidence.state === 'unresolved') {
    return <p className={styles.receiptUnresolved}>{UNRESOLVED_LABEL}</p>;
  }

  if (evidence.state === 'private-verified') {
    return (
      <p className={styles.receiptAttested}>
        PRIVATE SOURCE
        <span className={styles.receiptAttestedNote}>
          checked against the issue {evidence.checkedAt}, not independently verifiable
        </span>
      </p>
    );
  }

  return (
    <a className={styles.receiptEvidence} href={evidence.href}>
      {evidence.label}
      <ActionIcon affordance="inspect-artifact" size={14} />
    </a>
  );
}
