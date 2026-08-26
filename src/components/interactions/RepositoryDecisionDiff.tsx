'use client';

import { useId, useMemo, useState } from 'react';
import type { PlanStepChange, RepositoryDecisionDiffData } from '@/lib/interactions';
import { EvidenceLink } from '@/components/evidence/EvidenceLink';
import { StepControl, type Step } from './StepControl';
import { useDeepLinkedState } from './useDeepLinkedState';
import { CopyableCommand } from './CopyableCommand';
import styles from './RepositoryDecisionDiff.module.css';

/**
 * Repository Decision Diff: did evidence available at decision time change the plan?
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
 * ## Why later stages compress earlier ones
 *
 * The panel used to be purely additive: every stage kept the previous stage at full
 * size beneath it. By `Compare` that meant roughly 600px of evidence bodies sitting
 * between the control the reader had just pressed and the plan pair the press was
 * supposed to reveal, so on a laptop the answer to "did the plan change?" was below
 * the fold behind the payload that caused it.
 *
 * So a stage now compresses the question it has finished answering. On `Compare` the
 * evidence bodies fold into a persistent receipt that still names every piece of
 * evidence and its kind; on `Attribute` the plan pair folds into a one-line changed
 * decision. Neither is removed and neither is hidden behind a hover or a summary that
 * loses its content: each carries an explicit control that puts it back, and the codes
 * the attributions point at (E1, E2, …) stay legible in the collapsed form, so the
 * causal chain is readable at every stage. What drops is visual weight, not provenance.
 *
 * A reader who expands a compressed block keeps it expanded across later stages. The
 * stage supplies a default, not a verdict.
 *
 * Motion: two properties, opacity and height, on newly disclosed blocks only. It marks
 * that evidence arrived *before* the plan changed, and that causal ordering is the
 * claim. Under `prefers-reduced-motion: reduce` the transitions are removed in CSS and
 * every stage still renders identically, because the stage, not the animation, is the
 * state.
 */

type StageId = 'baseline' | 'evidence' | 'comparison' | 'attribution';

const STAGES: readonly (Step & { id: StageId })[] = [
  { id: 'baseline', label: 'Baseline' },
  { id: 'evidence', label: 'Add evidence' },
  { id: 'comparison', label: 'Compare' },
  { id: 'attribution', label: 'Attribute' },
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
  showControls = true,
  showFooter = true,
  shareAnchor,
}: {
  data?: RepositoryDecisionDiffData;
  code?: string;
  /**
   * Whether to render the varied/held-fixed block inline. Off when the section puts
   * the same conditions in a `HeldFixedRail` beside the comparison, so the reader is
   * not told twice: the rail is strictly better placement, but this stays the default
   * so the interaction is still self-contained wherever it is dropped.
   */
  /**
   * Section anchor for the shareable address. Passed through to `StepControl`, which
   * is where the control sits; absent means this panel offers no share control.
   */
  shareAnchor?: string;
  showControls?: boolean;
  /**
   * Whether to render the boundary and the artifact link in a footer. Off for the same
   * reason and under the same rule: the section states the boundary once, in its proof
   * layer. Defaults on, so dropping this component anywhere still carries what the run
   * does not establish: a boundary that can be switched off by accident would be the
   * one piece of this interaction that must never go missing.
   */
  showFooter?: boolean;
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

  /*
   * `null` means "whatever this stage wants". Pressing a re-expand control replaces the
   * stage default with the reader's decision and keeps it there for the rest of the
   * session, because a reader who has asked twice to see the evidence should not have
   * to ask a third time on the next stage.
   */
  const [evidenceOpen, setEvidenceOpen] = useState<boolean | null>(null);
  const [plansOpen, setPlansOpen] = useState<boolean | null>(null);

  const showEvidenceBody = evidenceOpen ?? !reached('comparison');
  const showPlans = plansOpen ?? !reached('attribution');

  /*
   * The collapsed plan pair's one line. Counted from the artifact's own delta rows and
   * their own `change` values, in their own order; nothing is diffed, inferred, or
   * relabelled here. If the artifact records four rows, this says four.
   */
  const changeCounts = useMemo(() => {
    const order: PlanStepChange[] = ['removed', 'added', 'constrained', 'unchanged'];
    const tally = new Map<PlanStepChange, number>();
    data?.diff.forEach((row) => tally.set(row.change, (tally.get(row.change) ?? 0) + 1));
    return order
      .filter((change) => tally.has(change))
      .map((change) => `${tally.get(change)} ${CHANGE_LABEL[change].toLowerCase()}`)
      .join(', ');
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
        label="Comparison stage"
        steps={STAGES}
        activeId={activeStage.id}
        onChange={setStage}
        controls={panelId}
        shareAnchor={shareAnchor}
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
        {/*
         * The baseline plan, and the head of the collapsible plan pair.
         *
         * The pair is one unit with two positions, because the causal order is the
         * argument: plan without evidence, then the evidence, then the plan with it.
         * Rendering both plans adjacently would put the changed plan above its own
         * cause. So the two halves fold and unfold together and stay where they are.
         */}
        {showPlans ? (
          <div className={styles.plan}>
            <span className={styles.planLabel}>{data.baselineLabel}</span>
            <ol className={styles.planSteps}>
              {data.baselineSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        ) : null}

        {reached('evidence') ? (
          showEvidenceBody ? (
            <div className={styles.disclosed} id={`${panelId}-evidence`}>
              <div className={styles.receiptHead}>
                <span className={styles.sectionLabel}>
                  Repository evidence available at decision time
                </span>
                {reached('comparison') ? (
                  <CollapseButton
                    controls={`${panelId}-evidence`}
                    expanded
                    onClick={() => setEvidenceOpen(false)}
                  >
                    Fold the evidence
                  </CollapseButton>
                ) : null}
              </div>
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
          ) : (
            /*
             * The receipt, not a summary of one. Every piece of evidence keeps its code,
             * its name and its kind, so `BECAUSE OF E1 + E2` below is still resolvable
             * without expanding anything. What is folded away is the observation, the
             * provenance and the per-item boundary: detail the reader has already been
             * shown and can put back in one press.
             */
            <div className={styles.receipt} id={`${panelId}-evidence`}>
              <div className={styles.receiptHead}>
                {/*
                 * Deliberately not "evidence added": the diff rows below are labelled
                 * ADDED, REMOVED and CONSTRAINED, and a receipt heading sharing that
                 * word would make "added" mean two different things a few lines apart.
                 */}
                <span className={styles.sectionLabel}>
                  Repository evidence ({data.evidence.length})
                </span>
                <CollapseButton
                  controls={`${panelId}-evidence`}
                  expanded={false}
                  onClick={() => setEvidenceOpen(true)}
                >
                  Show evidence detail
                </CollapseButton>
              </div>
              <ul className={styles.receiptList}>
                {data.evidence.map((item) => (
                  <li className={styles.receiptItem} key={item.id}>
                    <span className={styles.evidenceCode}>
                      {evidenceCode.get(item.id)}
                    </span>
                    <span className={styles.receiptLabel}>{item.label}</span>
                    <span className={styles.evidenceKind}>{item.kind}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        ) : null}

        {reached('comparison') ? (
          <div className={styles.disclosed}>
            {showPlans ? (
              <div
                className={`${styles.plan} ${styles.planInformed}`}
                id={`${panelId}-plans`}
              >
                <span className={styles.planLabel}>{data.informedLabel}</span>
                <ol className={styles.planSteps}>
                  {data.informedSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                {reached('attribution') ? (
                  <CollapseButton
                    controls={`${panelId}-plans`}
                    expanded
                    onClick={() => setPlansOpen(false)}
                  >
                    Fold the plan pair
                  </CollapseButton>
                ) : null}
              </div>
            ) : (
              /*
               * The folded pair. It states the decision that changed and how many rows
               * changed with it, so the reader who has moved on to attribution still has
               * the result in front of them rather than only the evidence for it.
               */
              <div className={styles.receipt} id={`${panelId}-plans`}>
                <div className={styles.receiptHead}>
                  <span className={styles.sectionLabel}>CHANGED DECISION</span>
                  <CollapseButton
                    controls={`${panelId}-plans`}
                    expanded={false}
                    onClick={() => setPlansOpen(true)}
                  >
                    Show both plans
                  </CollapseButton>
                </div>
                <p className={styles.planSummary}>
                  <span className={styles.planSummaryFrom}>{data.baselineLabel}</span>
                  <span aria-hidden="true" className={styles.planSummaryArrow}>
                    →
                  </span>
                  <span className={styles.planSummaryTo}>{data.informedLabel}</span>
                </p>
                <span className={styles.planSummaryCount}>{changeCounts}</span>
              </div>
            )}

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
                <CopyableCommand
                  className={styles.command}
                  command={data.verification.command}
                />
              ) : null}
              {data.artifactDigest ? (
                <span className={styles.digest}>{data.artifactDigest}</span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {showFooter ? (
        <div className={styles.footer}>
          <p className={styles.boundary}>
            <span className={styles.boundaryLabel}>WHAT THIS DOES NOT SHOW</span>
            {data.boundary}
          </p>
          <EvidenceLink reference={data.artifact} cta="INSPECT FROZEN RUN" />
        </div>
      ) : null}
    </section>
  );
}

/**
 * The control that folds a block away or puts it back.
 *
 * A real `<button>` with `aria-expanded` and `aria-controls`, not a `<details>`: the
 * open state here is partly owned by the stage, and a native disclosure would fight the
 * stage for it. It is deliberately plain and quiet. The reader should be able to find
 * it when they want the detail back and not read it as the next thing to press.
 */
function CollapseButton({
  children,
  controls,
  expanded,
  onClick,
}: {
  children: React.ReactNode;
  controls: string;
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-controls={controls}
      aria-expanded={expanded}
      className={styles.collapseButton}
      onClick={onClick}
      type="button"
    >
      <span aria-hidden="true" className={styles.collapseGlyph}>
        {expanded ? '−' : '+'}
      </span>
      {children}
    </button>
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
          The comparison this section describes (the same task planned with and without
          committed repository evidence) is implemented but not populated here. No plan
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
