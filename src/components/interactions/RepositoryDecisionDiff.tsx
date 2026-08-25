'use client';

import { useId, useMemo } from 'react';
import type { PlanStepChange, RepositoryDecisionDiffData } from '@/lib/interactions';
import { EvidenceLink } from '@/components/evidence/EvidenceLink';
import { StepControl, type Step } from './StepControl';
import { useDeepLinkedState } from './useDeepLinkedState';
import styles from './RepositoryDecisionDiff.module.css';

/**
 * Repository Decision Diff — did evidence available at decision time change the plan?
 *
 * The argument only works if the comparison is *controlled*, so the controls are the
 * first thing on screen and stay there: what varied, and what was held fixed. A plan
 * pair with nothing pinned would be an anecdote.
 *
 * Four things this component deliberately does not do:
 *
 * - **It does not compute the diff.** The rows come from the source artifact's own
 *   delta records, with its `kind`, `reason` and attribution. A diff derived here would
 *   be this codebase deciding what changed, which is the experiment's job.
 * - **It does not assume an evidence taxonomy.** `kind` is whatever the artifact called
 *   it. The run it is bound to contains no co-change evidence at all, and one of its
 *   evidence rows says so.
 * - **It does not render a plan pair when none is bound.** With no `data`, the
 *   component states the gap. Fabricating the pair would fabricate the result.
 * - **It does not rely on colour to mark changed rows.** Every row carries a mono glyph
 *   and a spelled-out change label, and screen readers get the change as row text.
 *
 * Motion: two properties, opacity and height, on newly disclosed blocks only. It marks
 * that evidence arrived *before* the plan changed — the causal ordering is the claim.
 * Under `prefers-reduced-motion: reduce` the transitions are removed in CSS and every
 * stage still renders identically, because the stage, not the animation, is the state.
 */

type StageId = 'baseline' | 'evidence' | 'comparison' | 'attribution';

const STAGES: readonly (Step & { id: StageId })[] = [
  { id: 'baseline', label: 'Baseline plan' },
  { id: 'evidence', label: 'Add repository evidence' },
  { id: 'comparison', label: 'Compare plans' },
  { id: 'attribution', label: 'Attribute the change' },
];

const STAGE_ORDER: readonly StageId[] = [
  'baseline',
  'evidence',
  'comparison',
  'attribution',
];

const CHANGE_GLYPH: Record<PlanStepChange, string> = {
  added: '+',
  removed: '−',
  constrained: '~',
  unchanged: '=',
};

const CHANGE_LABEL: Record<PlanStepChange, string> = {
  added: 'ADDED',
  removed: 'REMOVED',
  constrained: 'CONSTRAINED',
  unchanged: 'UNCHANGED',
};

export function RepositoryDecisionDiff({
  data,
  code = 'EV-WSJ',
}: {
  data?: RepositoryDecisionDiffData;
  code?: string;
}) {
  const panelId = useId();
  const [stage, setStage] = useDeepLinkedState('decision', 'baseline', (raw) =>
    STAGE_ORDER.includes(raw as StageId),
  );

  const reached = useMemo(() => {
    const index = STAGE_ORDER.indexOf(stage as StageId);
    const at = index === -1 ? 0 : index;
    return (target: StageId) => STAGE_ORDER.indexOf(target) <= at;
  }, [stage]);

  /** Row-local evidence codes (E1, E2…) so attribution is scannable without colour. */
  const evidenceCode = useMemo(() => {
    const map = new Map<string, string>();
    data?.evidence.forEach((item, index) => map.set(item.id, `E${index + 1}`));
    return map;
  }, [data]);

  if (!data) {
    return <UnboundDiff code={code} panelId={panelId} />;
  }

  const activeStage = STAGES.find((s) => s.id === stage) ?? STAGES[0];

  return (
    <section className={styles.wrap} aria-labelledby={`${panelId}-title`}>
      <div className={styles.header}>
        <h3 className={styles.title} id={`${panelId}-title`}>
          Repository decision diff
        </h3>
        <span className={styles.headerCode}>
          {code} · {data.experiment}
        </span>
      </div>

      <p className={styles.question}>{data.question}</p>

      {/*
       * The controls sit above the stage selector rather than inside a later stage.
       * "What was held fixed" is not a reward for stepping forward; it is the reason
       * the comparison is worth looking at.
       */}
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

      <StepControl
        label="Comparison stage"
        steps={STAGES}
        activeId={activeStage.id}
        onChange={setStage}
        controls={panelId}
      />

      {/*
       * A dedicated status node rather than aria-live on the panel: the panel is large
       * and cumulative, so live-regioning it would re-read paragraphs the reader
       * already has. This announces only what changed.
       */}
      <p className="visually-hidden" role="status">
        Stage {STAGE_ORDER.indexOf(activeStage.id) + 1} of {STAGES.length}:{' '}
        {activeStage.label}
      </p>

      <div className={styles.panel} id={panelId}>
        <div className={styles.plan}>
          <span className={styles.planLabel}>{data.baselineLabel}</span>
          <ol className={styles.planSteps}>
            {data.baselineSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        {reached('evidence') ? (
          <div className={styles.disclosed}>
            <span className={styles.sectionLabel}>
              Repository evidence available at decision time
            </span>
            <ul className={styles.evidenceList}>
              {data.evidence.map((item) => (
                <li className={styles.evidenceItem} key={item.id}>
                  <div className={styles.evidenceHead}>
                    <span className={styles.evidenceCode}>
                      {evidenceCode.get(item.id)}
                    </span>
                    <span className={styles.evidenceLabel}>{item.label}</span>
                    <span className={styles.evidenceKind}>{item.kind}</span>
                  </div>
                  <p className={styles.evidenceObservation}>{item.observation}</p>

                  {reached('attribution') ? (
                    <dl className={styles.provenance}>
                      <div className={styles.provenanceRow}>
                        <dt>SOURCE</dt>
                        <dd>{item.provenance.source}</dd>
                      </div>
                      {item.provenance.revision ? (
                        <div className={styles.provenanceRow}>
                          <dt>REVISION</dt>
                          <dd className={styles.mono}>{item.provenance.revision}</dd>
                        </div>
                      ) : null}
                      {item.provenance.producer ? (
                        <div className={styles.provenanceRow}>
                          <dt>PRODUCER</dt>
                          <dd className={styles.mono}>{item.provenance.producer}</dd>
                        </div>
                      ) : null}
                      {item.verification?.command ? (
                        <div className={styles.provenanceRow}>
                          <dt>RE-CHECK</dt>
                          <dd className={styles.mono}>{item.verification.command}</dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}

                  {item.boundary ? (
                    <p className={styles.evidenceBoundary}>{item.boundary}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {reached('comparison') ? (
          <div className={styles.disclosed}>
            <div className={styles.plan}>
              <span className={styles.planLabel}>{data.informedLabel}</span>
              <ol className={styles.planSteps}>
                {data.informedSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <span className={styles.sectionLabel}>What changed</span>
            <ul className={styles.diff}>
              {data.diff.map((row) => (
                <li className={styles[row.change]} key={row.id}>
                  <div className={styles.diffRow}>
                    <span className={styles.diffGlyph} aria-hidden="true">
                      {CHANGE_GLYPH[row.change]}
                    </span>
                    <span className={styles.diffChange}>{CHANGE_LABEL[row.change]}</span>
                    <span className={styles.diffText}>{row.text}</span>
                  </div>

                  {reached('attribution') ? (
                    <div className={styles.attribution}>
                      <span className={styles.attributionLabel}>
                        BECAUSE OF{' '}
                        {row.attributedTo
                          .map((id) => evidenceCode.get(id) ?? id)
                          .join(' + ')}
                      </span>
                      {row.reason ? (
                        <p className={styles.attributionReason}>{row.reason}</p>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {reached('attribution') && data.verification ? (
          <div className={styles.disclosed}>
            <div className={styles.verify}>
              <span className={styles.sectionLabel}>Re-check this run</span>
              <p className={styles.verifyMethod}>{data.verification.method}</p>
              {data.verification.command ? (
                <code className={styles.command}>{data.verification.command}</code>
              ) : null}
              {data.artifactDigest ? (
                <span className={styles.digest}>{data.artifactDigest}</span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className={styles.footer}>
        <p className={styles.boundary}>
          <span className={styles.boundaryLabel}>WHAT THIS DOES NOT SHOW</span>
          {data.boundary}
        </p>
        <EvidenceLink reference={data.artifact} cta="INSPECT FROZEN RUN" />
      </div>
    </section>
  );
}

/**
 * The unbound state.
 *
 * Kept rather than deleted: this component shipped structure-first while no paired run
 * was published, and a future lens or role page that has no bound experiment should
 * degrade to a stated gap rather than to an empty box.
 */
function UnboundDiff({ code, panelId }: { code: string; panelId: string }) {
  return (
    <section className={styles.wrap} aria-labelledby={`${panelId}-title`}>
      <div className={styles.header}>
        <h3 className={styles.title} id={`${panelId}-title`}>
          Repository decision diff
        </h3>
        <span className={styles.headerCode}>{code}</span>
      </div>
      <div className={styles.empty} id={panelId}>
        <p className={styles.emptyLead}>
          The comparison this section describes — the same task planned with and without
          committed repository evidence — is implemented but not populated here. No plan
          pair is bound, and showing an invented one would fabricate the result the
          comparison exists to test.
        </p>
        <span className={styles.awaiting}>
          [VERIFY BEFORE PUBLISHING] paired plan comparison
        </span>
      </div>
    </section>
  );
}
