'use client';

import { useRef } from 'react';
import { ActionIcon } from '@/components/icon/Icon';
import { CopyViewLink } from './CopyViewLink';
import styles from './StepControl.module.css';

export type Step = {
  /** Internal identifier. Never rendered. */
  id: string;
  /** The production label. This is what the reader sees and hears. */
  label: string;
};

/**
 * The stage selector shared by the Repository Decision Diff and the Interlock
 * counterfactual.
 *
 * Three decisions worth defending:
 *
 * **One tab stop, not N.** The stage buttons are a roving-tabindex group, so Tab moves
 * past the whole control and arrow keys move within it. Five stages should not cost
 * five tab stops on the way to the evidence links below.
 *
 * **Explicit Previous and Next, always.** The design showed a mobile swipe affordance.
 * Swipe is not discoverable and not operable by keyboard, so the ordinal controls are
 * the real interface at every width and swipe was not implemented at all. Nothing here
 * is reachable only by gesture.
 *
 * **`aria-pressed`, not tabs.** These stages are cumulative disclosure over one
 * subject, not alternative panels. Tab semantics would promise a panel swap that does
 * not happen, and `role="radiogroup"` would imply a form value.
 *
 * `shareAnchor` puts the "copy this view" control on the ordinal row. It belongs beside
 * the stage counter because that is where the state a reader might want to hand on is
 * displayed, and because the alternative (a floating page-level share control) would
 * be a general affordance for something that only means anything in three places.
 */
export function StepControl({
  label,
  steps,
  activeId,
  onChange,
  controls,
  shareAnchor,
}: {
  /** Accessible name for the group, e.g. "Comparison stage". */
  label: string;
  steps: readonly Step[];
  activeId: string;
  onChange: (id: string) => void;
  /** id of the region this control drives. */
  controls?: string;
  /**
   * Section anchor for the shareable address, e.g. `interlock`. Absent means this
   * control is somewhere a link back to it would not land, so no control is offered
   * rather than one producing an address that misses.
   */
  shareAnchor?: string;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const index = steps.findIndex((step) => step.id === activeId);
  const active = index === -1 ? 0 : index;

  /** Moves selection and follows it with focus, which is what makes arrow keys usable. */
  const move = (next: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, next));
    onChange(steps[clamped].id);
    const buttons =
      groupRef.current?.querySelectorAll<HTMLButtonElement>('[data-step-button]');
    buttons?.[clamped]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        move(active + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        move(active - 1);
        break;
      case 'Home':
        event.preventDefault();
        move(0);
        break;
      case 'End':
        event.preventDefault();
        move(steps.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.wrap}>
      <div
        className={styles.group}
        role="group"
        aria-label={label}
        onKeyDown={onKeyDown}
        ref={groupRef}
      >
        {steps.map((step, stepIndex) => {
          const isActive = stepIndex === active;
          return (
            <button
              type="button"
              key={step.id}
              data-step-button=""
              className={styles.step}
              aria-pressed={isActive}
              aria-controls={controls}
              /* Roving tabindex: only the active stage is in the tab order. */
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(step.id)}
            >
              <span className={styles.ordinal} aria-hidden="true">
                {stepIndex + 1}
              </span>
              {step.label}
            </button>
          );
        })}
      </div>

      <div className={styles.ordinalControls}>
        <button
          type="button"
          className={styles.nudge}
          onClick={() => onChange(steps[Math.max(0, active - 1)].id)}
          disabled={active === 0}
          aria-controls={controls}
        >
          <ActionIcon affordance="reverse-sequence" placement="leading" size={12} />
          Previous
        </button>
        <span className={styles.position} aria-hidden="true">
          {active + 1} / {steps.length}
        </span>
        <button
          type="button"
          className={styles.nudge}
          onClick={() => onChange(steps[Math.min(steps.length - 1, active + 1)].id)}
          disabled={active === steps.length - 1}
          aria-controls={controls}
        >
          Next
          <ActionIcon affordance="advance-sequence" size={12} />
        </button>

        {shareAnchor ? (
          <span className={styles.share}>
            <CopyViewLink anchor={shareAnchor} />
          </span>
        ) : null}
      </div>
    </div>
  );
}
