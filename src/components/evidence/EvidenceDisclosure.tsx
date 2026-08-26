'use client';

import { useId, useState } from 'react';
import { evidenceKindLabel } from '@/lib/evidence';
import { ActionIcon } from '@/components/icon/Icon';
import type { EvidenceRef } from '@/lib/types';
import { ClaimBoundary } from './ClaimBoundary';
import { EvidenceLink } from './EvidenceLink';
import { EvidenceSource } from './EvidenceSource';
import styles from './EvidenceDisclosure.module.css';

/**
 * The evidence drawer: typed rows plus the proof's boundary.
 *
 * Built from a real `<button>` and a plain conditional render rather than `<details>`,
 * because the trigger sits inside the evidence panel while the drawer opens below the
 * whole two-column block: a relationship `<details>` cannot express without moving one
 * of them. `aria-controls` and `aria-expanded` restore the association that
 * `<details>` would have given for free.
 *
 * No height animation. The drawer's job is to make evidence retrievable, and a
 * transition on a variable-height container costs a reflow and buys nothing.
 */
export function EvidenceDisclosure({
  code,
  rows,
  boundary,
  defaultOpen = false,
}: {
  /** Panel identifier from the design, e.g. `EV-VRK`. */
  code: string;
  rows: readonly EvidenceRef[];
  boundary: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Close evidence' : 'Inspect evidence'}
        <ActionIcon
          affordance={open ? 'collapse-in-place' : 'expand-in-place'}
          size={12}
        />
        <span className="visually-hidden"> for {code}</span>
      </button>

      {open ? (
        <div className={styles.panel} id={panelId}>
          <div className={styles.header}>
            <span>EVIDENCE DRAWER</span>
            <span className={styles.headerCode}>{code}</span>
          </div>

          {rows.map((row) => (
            <div className={styles.row} key={row.id}>
              <div className={styles.kind}>{evidenceKindLabel(row.kind)}</div>
              <div className={styles.rowBody}>
                <span className={styles.rowTitle}>
                  {row.title}
                  <EvidenceLink reference={row} />
                </span>
                {row.description ? (
                  <span className={styles.rowDetail}>{row.description}</span>
                ) : null}
                <EvidenceSource reference={row} />
              </div>
            </div>
          ))}

          <ClaimBoundary>{boundary}</ClaimBoundary>
        </div>
      ) : null}
    </>
  );
}
