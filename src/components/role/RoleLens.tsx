import { APPROACH } from '@/content/site';
import { DECISION_RECEIPTS } from '@/content/decisions';
import { DecisionReceiptList } from '@/components/decisions/DecisionReceipt';
import type { RoleLens as Lens } from '@/lib/types';
import { RoleEvidenceMap } from './RoleEvidenceMap';
import styles from './RoleLens.module.css';

/**
 * 05 — Role Fit. The projection layer, and the only section a role lens changes.
 *
 * Everything above this point is identical on every route. That is the design: an
 * evaluator comparing `/` with `/role/athenahealth-yoh` should find the same systems,
 * the same evidence, and the same boundaries, presented in an order chosen for them.
 * A lens that could change a claim would make every lens worthless.
 */
export function RoleLensSection({ lens }: { lens: Lens }) {
  return (
    <section className={styles.section} id="sec-05" aria-labelledby="sec-05-title">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>05 / APPLY THE EVIDENCE</p>

        <ul className={styles.chips}>
          <li className={styles.chipPrimary}>
            ROLE LENS: {lens.roleTitle.toUpperCase()}
          </li>
          {lens.organisation ? (
            <li className={styles.chip}>{lens.organisation.toUpperCase()}</li>
          ) : null}
        </ul>

        <h2 className={styles.heading} id="sec-05-title">
          {lens.roleFitHeading}
        </h2>

        <RoleEvidenceMap rows={lens.mapping} />

        <div className={styles.defend}>
          <h3 className={styles.defendHeading}>Ask me to defend a decision.</h3>
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
