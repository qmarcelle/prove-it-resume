'use client';

import { useProofNav } from './ProofNavProvider';
import { ActionIcon } from '@/components/icon/Icon';
import styles from './GuidedProofNav.module.css';

/**
 * Optional guided controls, shown only after the reader chooses "Walk the proof".
 *
 * Deliberately additive: it does not lock scrolling, hijack the wheel, or convert the
 * page into slides. It is a bookmark plus two shortcuts, and dismissing it leaves the
 * reader exactly where they are.
 *
 * The dock announces stage changes politely so a screen-reader user who presses NEXT is
 * told where they landed — scrolling on its own tells them nothing.
 */
export function GuidedProofNav() {
  const { guided, activeIndex, steps, next, previous, exitGuided } = useProofNav();

  if (!guided) return null;

  const total = String(steps.length).padStart(2, '0');
  const position = String(activeIndex + 1).padStart(2, '0');

  return (
    <div className={styles.dock} role="group" aria-label="Guided proof navigation">
      <button
        type="button"
        className={styles.control}
        onClick={previous}
        disabled={activeIndex === 0}
      >
        <ActionIcon affordance="reverse-sequence" placement="leading" size={12} />
        PREV
      </button>
      <span className={styles.position} aria-live="polite">
        <span className="visually-hidden">Stage </span>
        {position} / {total}
        <span className="visually-hidden">: {steps[activeIndex].label}</span>
      </span>
      <button
        type="button"
        className={styles.control}
        onClick={next}
        disabled={activeIndex === steps.length - 1}
      >
        NEXT
        <ActionIcon affordance="advance-sequence" size={12} />
      </button>
      <button
        type="button"
        className={`${styles.control} ${styles.exit}`}
        onClick={exitGuided}
        aria-label="Exit guided mode"
      >
        <ActionIcon affordance="exit-mode" placement="alone" size={12} />
      </button>
    </div>
  );
}
