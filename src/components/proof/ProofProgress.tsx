'use client';

import { useProofNav } from './ProofNavProvider';
import styles from './ProofProgress.module.css';

/**
 * The proof rail. Sticky and vertical on desktop, a compact horizontal strip below
 * 900px.
 *
 * `<nav>` with a list and real buttons, so a keyboard reaches every stage in order and
 * a screen reader is told which one is current. The active state is carried by
 * `aria-current="step"` rather than by colour alone; the styling hangs off that
 * attribute, which keeps the two from drifting apart.
 */
export function ProofProgress() {
  const { steps, activeIndex, goTo } = useProofNav();

  return (
    <nav className={styles.rail} aria-label="Proof progress">
      <div className={styles.label} id="proof-progress-label">
        PROOF PROGRESS
      </div>
      <ol className={styles.steps} aria-labelledby="proof-progress-label">
        {steps.map((step, index) => (
          <li key={step.id} className={styles.stepItem}>
            <button
              type="button"
              className={styles.step}
              aria-current={index === activeIndex ? 'step' : undefined}
              onClick={() => goTo(index)}
            >
              <span className={styles.number}>{step.n}</span>
              <span className={styles.stepLabel}>{step.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
