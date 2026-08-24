'use client';

import { useId, useState } from 'react';
import styles from './RepositoryDecisionDiff.module.css';

/**
 * Repository Decision Diff — does repository evidence change the agent's plan?
 *
 * The interaction: hold the task fixed, introduce the repository evidence, and show
 * which plan steps change and because of what. A claim that context "helps" is
 * unfalsifiable; a diff between two plans is not.
 *
 * **This ships as structure only.** The design export contains no plan-A/plan-B content,
 * and inventing a plan change would fabricate exactly the experimental result the
 * component exists to demonstrate. The state machine, the switch semantics, and the
 * accessibility behaviour are complete; passing a populated `data` prop lights it up
 * with no further changes.
 */
export type DecisionPlan = {
  label: string;
  steps: readonly string[];
  /** Indices of `steps` that differ from the baseline plan. */
  changedSteps?: readonly number[];
};

export type RepositoryDecisionDiffData = {
  /** The plan produced without repository evidence. */
  baseline: DecisionPlan;
  /** The plan produced once repository evidence is available. */
  informed: DecisionPlan;
  /** The exact evidence that accounts for the difference. */
  changedBecause: string;
};

export function RepositoryDecisionDiff({
  data,
  code = 'EV-WSJ',
}: {
  data?: RepositoryDecisionDiffData;
  code?: string;
}) {
  const [informed, setInformed] = useState(false);
  const panelId = useId();

  const plan = data ? (informed ? data.informed : data.baseline) : undefined;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span>REPOSITORY DECISION DIFF</span>
        <span className={styles.headerCode}>{code}</span>
      </div>

      <div className={styles.controls}>
        <div className={styles.switch} role="group" aria-label="Repository evidence">
          <button
            type="button"
            className={styles.option}
            aria-pressed={!informed}
            aria-controls={panelId}
            disabled={!data}
            onClick={() => setInformed(false)}
          >
            WITHOUT REPOSITORY EVIDENCE
          </button>
          <button
            type="button"
            className={styles.option}
            aria-pressed={informed}
            aria-controls={panelId}
            disabled={!data}
            onClick={() => setInformed(true)}
          >
            WITH REPOSITORY EVIDENCE
          </button>
        </div>
      </div>

      {plan ? (
        <div className={styles.plan} id={panelId} aria-live="polite">
          <span className={styles.planLabel}>{plan.label}</span>
          <ol className={styles.steps}>
            {plan.steps.map((step, index) => {
              const changed = plan.changedSteps?.includes(index) ?? false;
              return (
                <li className={changed ? styles.changed : undefined} key={step}>
                  {changed ? (
                    <span className="visually-hidden">Changed step: </span>
                  ) : null}
                  {step}
                </li>
              );
            })}
          </ol>
          {informed && data ? (
            <p className={styles.emptyLead}>
              <strong>Changed because:</strong> {data.changedBecause}
            </p>
          ) : null}
        </div>
      ) : (
        <div className={styles.empty} id={panelId}>
          <p className={styles.emptyLead}>
            The comparison this section describes — the same task planned with and without
            committed repository evidence — is implemented but not yet populated. No plan
            pair has been published, and showing an invented one would fabricate the
            result the comparison exists to test.
          </p>
          <div className={styles.shape} aria-hidden="true">
            <span className={styles.shapeNode}>REPOSITORY</span>
            <span>→</span>
            <span className={`${styles.shapeNode} ${styles.shapeNodeAccent}`}>
              .agents/workspace.json
            </span>
            <span>→</span>
            <span className={styles.shapeNode}>PLAN</span>
            <span>→</span>
            <span className={styles.shapeNode}>DIFF</span>
          </div>
          <span className={styles.awaiting}>
            [VERIFY BEFORE PUBLISHING] paired plan comparison
          </span>
        </div>
      )}
    </div>
  );
}
