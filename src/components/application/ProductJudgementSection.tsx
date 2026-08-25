import { APPROACH } from '@/content/site';
import { DECISION_RECEIPTS } from '@/content/decisions';
import { DecisionReceiptList } from '@/components/decisions/DecisionReceipt';
import { RoleEvidenceMap } from '@/components/role/RoleEvidenceMap';
import { SectionHead, sectionFrameClass } from '@/components/section/SectionFrame';
import type { ApplicationLens, SurfaceStep } from '@/lib/types';
import styles from '@/components/role/RoleLens.module.css';

/**
 * Product judgment: the evidence map, the decision receipts, and how an unfamiliar
 * platform gets entered.
 *
 * The same three blocks the durable Role Fit section carries, in the same order, from
 * the same content — this is a reordering of `RoleLensSection`, not a rewrite of it.
 * What changes is where it sits. On `/` it comes early, because a reader arriving cold
 * needs to be told what the systems have to do with their problem before they will read
 * one. On an application surface the reader has already read three; this closes the
 * argument instead of opening it.
 *
 * It shares `RoleLens.module.css` deliberately. The two sections are the same section
 * at different positions, and a second stylesheet would let them drift into looking
 * like different claims about the same evidence.
 */
export function ProductJudgementSection({
  lens,
  step,
}: {
  lens: ApplicationLens;
  step: SurfaceStep;
}) {
  const copy = lens.sections.judgement;

  return (
    <section
      className={sectionFrameClass(step)}
      id={step.id}
      aria-labelledby="lin-judgement-title"
    >
      <SectionHead
        step={step}
        title={lens.roleFitHeading}
        titleId="lin-judgement-title"
      />

      <div className={styles.inner}>
        <ul className={styles.chips}>
          <li className={styles.chipPrimary}>
            ROLE LENS: {lens.roleTitle.toUpperCase()}
          </li>
          <li className={styles.chip}>{lens.organisation.toUpperCase()}</li>
        </ul>

        <RoleEvidenceMap rows={lens.mapping} />

        <div className={styles.defend}>
          <h3 className={styles.defendHeading}>{copy.heading}</h3>
          <p className={styles.defendLead}>
            Open any of these to see the decision receipt: the constraint, what else was
            considered, what was chosen, what it costs, and what would change it now.
          </p>
          <DecisionReceiptList receipts={DECISION_RECEIPTS} />
        </div>

        <div className={styles.approach}>
          <p className={styles.approachKicker}>{APPROACH.kicker}</p>
          <h3 className={styles.approachHeading}>{APPROACH.heading}</h3>
          <ol className={styles.steps}>
            {APPROACH.steps.map((step) => (
              <li className={styles.step} key={step.n}>
                <span className={styles.stepNumber}>{step.n}</span>
                <h4 className={styles.stepTitle}>{step.title}</h4>
                <p className={styles.stepBody}>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
