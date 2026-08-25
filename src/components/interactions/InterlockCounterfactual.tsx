'use client';

import { useId, useMemo, useState } from 'react';
import type { InterlockCounterfactualData, InterlockStage } from '@/lib/interactions';
import { EvidenceLink } from '@/components/evidence/EvidenceLink';
import { StepControl, type Step } from './StepControl';
import { BoundAxis } from '@/components/proof/BoundAxis';
import { useDeepLinkedState } from './useDeepLinkedState';
import styles from './InterlockCounterfactual.module.css';

/**
 * The Interlock counterfactual: two locally valid intents, one bounded constraint.
 *
 * The single most important layout decision here is that **both arms are drawn against
 * one scale, with one constraint marker running through both of them.** The earlier
 * version switched a single panel between arms, which made the reader hold one arm in
 * memory while looking at the other. The claim is a comparison, so the comparison is on
 * screen: same axis, same bound, same clock.
 *
 * The second is that the arms advance together through named stages. The point of the
 * experiment is *when* the decision happens — before shared state is mutated — and a
 * reader cannot see "before" without a time axis.
 *
 * Perturbation is a user action, never autoplay. Removing the coupling evidence flips
 * the coordination decision from WITHHOLD_SERIALIZE to ALLOW_PARALLEL and the joint
 * outcome from 120 to 140, using the same decision function. That is the experiment's
 * strongest control and its most honest finding at once, so it is a control the reader
 * operates rather than a result they are told about.
 *
 * Restraint is deliberate: no flash, no shake, no celebration of the satisfied arm. The
 * uncoordinated arm is a legitimate recorded finding. The numbers carry the argument.
 */

export function InterlockCounterfactual({
  data,
  showControls = true,
  showFooter = true,
}: {
  data: InterlockCounterfactualData;
  /**
   * Whether to render the varied/held-fixed block inline. Off when the section states
   * the same conditions once in its proof layer. Defaults on so the interaction stays
   * self-contained wherever it is dropped.
   */
  showControls?: boolean;
  /**
   * Whether to render the boundary footer. Off when the section states the boundary
   * once in its proof layer. Defaults on so the interaction still carries what the
   * experiment does not establish wherever it is dropped.
   */
  showFooter?: boolean;
}) {
  const panelId = useId();
  const [perturbed, setPerturbed] = useState(false);

  const stageIds = useMemo(() => data.stages.map((s) => s.id), [data.stages]);
  const [stageId, setStageId] = useDeepLinkedState(
    'interlock',
    data.stages[0].id,
    (raw) => (stageIds as readonly string[]).includes(raw),
  );

  /*
   * Perturbation replaces the frames of the stages it affects and leaves the rest
   * alone. The uncoordinated arm is unchanged throughout — it has no decision point to
   * flip — which is itself part of what the control demonstrates.
   */
  const stages: readonly InterlockStage[] = useMemo(() => {
    if (!perturbed) return data.stages;
    return data.stages.map(
      (stage) => data.perturbedStages.find((p) => p.id === stage.id) ?? stage,
    );
  }, [perturbed, data.stages, data.perturbedStages]);

  const steps: readonly Step[] = stages.map((s) => ({ id: s.id, label: s.label }));
  const index = Math.max(
    0,
    stages.findIndex((s) => s.id === stageId),
  );
  const stage = stages[index];
  const condition = perturbed
    ? data.evidenceConditions.perturbed
    : data.evidenceConditions.baseline;

  return (
    <section className={styles.wrap} aria-labelledby={`${panelId}-title`}>
      <div className={styles.header}>
        <h3 className={styles.title} id={`${panelId}-title`}>
          Interlock counterfactual
        </h3>
        <span className={styles.headerCode}>{data.experiment}</span>
      </div>

      <p className={styles.question}>{data.question}</p>

      {showControls ? (
        <div className={styles.controls}>
          <div className={styles.controlBlock}>
            <span className={styles.controlLabel}>VARIED</span>
            <p className={styles.controlBody}>{data.controls.varied}</p>
          </div>
          <div className={styles.controlBlock}>
            <span className={styles.controlLabel}>HELD FIXED</span>
            <ul className={styles.fixedList}>
              {data.controls.heldFixed.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <StepControl
        label="Experiment stage"
        steps={steps}
        activeId={stage.id}
        onChange={setStageId}
        controls={panelId}
      />

      <p className="visually-hidden" role="status">
        Stage {index + 1} of {stages.length}: {stage.label}.{' '}
        {data.armLabels.uncoordinated}, joint total {stage.frames.uncoordinated.total}.{' '}
        {data.armLabels.interlocked}, joint total {stage.frames.interlocked.total}. Bound{' '}
        {data.bound}.
      </p>

      <div className={styles.panel} id={panelId}>
        <p className={styles.caption}>{stage.caption}</p>

        <BoundAxis
          arms={(['uncoordinated', 'interlocked'] as const).map((armId) => ({
            id: armId,
            label: data.armLabels[armId],
            frame: stage.frames[armId],
          }))}
          bound={data.bound}
          boundLabel={data.invariant}
          scaleMax={data.scaleMax}
        />

        {/* ---- The evidence condition, and the control that changes it ---- */}
        <div className={styles.evidenceBar}>
          <div className={styles.evidenceState}>
            <span className={styles.evidenceStateLabel}>
              COUPLING EVIDENCE ·{' '}
              {condition.present ? 'OBSERVED' : 'NOT OBSERVED IN HISTORY'}
            </span>
            <p className={styles.evidenceSummary}>{condition.summary}</p>
            {condition.files ? (
              <p className={styles.evidenceFiles}>
                {condition.files.join(' ↔ ')} · support {condition.support} across{' '}
                {condition.occurrences} occurrences
              </p>
            ) : null}
            <p className={styles.evidenceBasis}>
              basis {condition.basisRevision} · {condition.digest}
            </p>
          </div>

          <button
            type="button"
            className={styles.perturb}
            aria-pressed={perturbed}
            onClick={() => setPerturbed((value) => !value)}
          >
            {perturbed ? 'Restore evidence' : 'Perturb the evidence'}
          </button>
        </div>

        {perturbed ? (
          <p className={styles.perturbNote}>
            Same decision function, same intents, same policy, identical final tree — and
            the opposite decision, because the evidence changed. In this history alpha and
            beta are still coupled; the commit graph simply never showed it.
          </p>
        ) : null}

        {/* ---- Decision trace: what each arm did, stage by stage ---- */}
        <div className={styles.trace}>
          <span className={styles.sectionLabel}>Decision trace</span>
          <ol className={styles.traceList}>
            {stages.slice(0, index + 1).map((traced) => (
              <li className={styles.traceStage} key={traced.id}>
                <span className={styles.traceStageLabel}>{traced.label}</span>
                <div className={styles.traceArms}>
                  {(['uncoordinated', 'interlocked'] as const).map((armId) => (
                    <p className={styles.traceLine} key={armId}>
                      <span className={styles.traceArmName}>{data.armLabels[armId]}</span>
                      {traced.frames[armId].decision ? (
                        <span className={styles.traceDecision}>
                          {traced.frames[armId].decision}
                          {traced.frames[armId].decisionReason
                            ? ` · ${traced.frames[armId].decisionReason}`
                            : ''}
                        </span>
                      ) : null}
                      {traced.frames[armId].note}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {stage.id === 'evidence' ? (
          <div className={styles.packet}>
            <span className={styles.sectionLabel}>Frozen evidence packet</span>
            <ul className={styles.distinctions}>
              {data.distinctions.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {data.verification ? (
              <>
                <p className={styles.verifyMethod}>{data.verification.method}</p>
                {data.verification.command ? (
                  <code className={styles.command}>{data.verification.command}</code>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      {showFooter ? (
        <div className={styles.footer}>
          <p className={styles.boundary}>
            <span className={styles.boundaryLabel}>WHAT THIS DOES NOT SHOW</span>
            {data.boundary}
          </p>
          <EvidenceLink reference={data.artifact} cta="INSPECT FROZEN EXPERIMENT" />
        </div>
      ) : null}
    </section>
  );
}

/** One arm: a stacked bar on the shared scale, plus the numbers in text. */
