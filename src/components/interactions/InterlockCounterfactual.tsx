'use client';

import { useId, useState } from 'react';
import { interlockArms } from '@/content/proofs/interlock';
import styles from './InterlockCounterfactual.module.css';

/**
 * The Interlock counterfactual: evidence → coordination decision → bounded outcome.
 *
 * The design showed both arms statically, side by side. The section's actual claim is
 * that coordination *changes the outcome*, and a change is best shown by making it
 * happen — so this is an OFF/ON switch over one panel rather than two panels the reader
 * has to diff by eye.
 *
 * Both arms are rendered, and the inactive one is removed from the DOM rather than
 * hidden, so assistive technology and the visible page agree on what is being asserted.
 * The switch is two `aria-pressed` buttons rather than a checkbox: the states are named
 * (`WITHOUT` / `WITH INTERLOCK`), not on/off, and a screen-reader user should hear the
 * name.
 *
 * The values shown are carried over from the design prototype and are *not* bound to a
 * published evidence packet. The provenance strip below says so, and will keep saying so
 * until the packet exists. See docs/content-audit.md.
 */
export function InterlockCounterfactual() {
  const [withInterlock, setWithInterlock] = useState(false);
  const panelId = useId();

  const arm = interlockArms[withInterlock ? 1 : 0];

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <div className={styles.switch} role="group" aria-label="Coordination arm">
          <button
            type="button"
            className={styles.option}
            aria-pressed={!withInterlock}
            aria-controls={panelId}
            onClick={() => setWithInterlock(false)}
          >
            WITHOUT COORDINATION
          </button>
          <button
            type="button"
            className={styles.option}
            aria-pressed={withInterlock}
            aria-controls={panelId}
            onClick={() => setWithInterlock(true)}
          >
            WITH INTERLOCK
          </button>
        </div>
        <span className={styles.hint}>REPRODUCIBLE EVIDENCE &gt; DEMO</span>
      </div>

      <div
        className={`${styles.arm} ${arm.satisfied ? styles.armActive : ''}`.trim()}
        id={panelId}
        aria-live="polite"
      >
        <div className={styles.armHeader}>{arm.heading}</div>
        <div className={styles.armBody}>
          {arm.lines.map((line) => (
            <p className={styles.line} key={line}>
              {line}
            </p>
          ))}
          {arm.decision ? <span className={styles.decision}>{arm.decision}</span> : null}
          <p className={styles.figure}>{arm.figure}</p>
        </div>
        <div className={styles.armFooter}>
          <span
            className={arm.satisfied ? styles.markSatisfied : styles.markInvalid}
            aria-hidden="true"
          />
          {arm.outcome}
        </div>
      </div>

      <p className={styles.provenance}>
        PROTOTYPE VALUES — carried over from the design draft. These figures illustrate
        the shape of the comparison; they are not yet bound to the published evidence
        packet, and should not be read as a measured result.
      </p>
    </div>
  );
}
