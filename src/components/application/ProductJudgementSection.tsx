import { APPROACH } from '@/content/site';
import { DECISION_RECEIPTS, RECEIPT_SECTIONS } from '@/content/decisions';
import { DecisionReceiptList } from '@/components/decisions/DecisionReceipt';
import { RoleEvidenceMap } from '@/components/role/RoleEvidenceMap';
import { SectionHead, sectionFrameClass } from '@/components/section/SectionFrame';
import { DISCLOSURE_KEYS } from '@/lib/disclosure';
import type { ApplicationLens, SurfaceStep } from '@/lib/types';
import styles from '@/components/role/RoleLens.module.css';

/**
 * Product judgment: the evidence map, the decision receipts, and how an unfamiliar
 * platform gets entered.
 *
 * The same three blocks the durable Role Fit section carries, in the same order, from
 * the same content; this is a reordering of `RoleLensSection`, not a rewrite of it.
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
      aria-labelledby="product-judgment-title"
    >
      <SectionHead
        step={step}
        title={lens.roleFitHeading}
        titleId="product-judgment-title"
      />

      <div className={styles.inner}>
        <ul className={styles.chips}>
          <li className={styles.chipPrimary}>
            ROLE LENS: {lens.roleTitle.toUpperCase()}
          </li>
          <li className={styles.chip}>{lens.organisation.toUpperCase()}</li>
        </ul>

        {/*
         * The mapping, led by the rows this surface promoted.
         *
         * On `/` this table opens the argument and every row is orientation. Here it
         * closes one: the reader has just walked five chapters, and eight rows of
         * problem/evidence/discussion arriving after Interlock read as a second
         * inventory rather than an answer. The five the lens promoted answer "why is
         * this person relevant to this job?" on their own; "show me the whole mapping"
         * is a different question and gets its own control, at its own address.
         *
         * Nothing is dropped and nothing is rewritten: the split counts off the front of
         * the array `prioritiseMapping` returned.
         */}
        <RoleEvidenceMap
          focus={lens.mappingFocus}
          queryKey={DISCLOSURE_KEYS['product-judgment']}
          rows={lens.mapping}
        />

        {/*
         * The receipts, resting closed, with their shape stated above them.
         *
         * Seven collapsed questions are a claim about the reader's own effort: on their
         * own they say decisions were recorded and make finding out what one *contains*
         * cost a click. One receipt used to be served already open to answer that, which
         * worked and cost something else: the section opened on a wall of prose from a
         * single decision, and the one receipt a reader met first was chosen for them.
         *
         * So the argument moves out of the list and above it, where it costs no
         * interaction and no vertical space to read: the lead states that these were
         * recorded rather than reconstructed, and the strip names every part a receipt
         * carries. The strip is read off `RECEIPT_SECTIONS` rather than retyped, so it
         * cannot describe a shape the receipts do not have. A reader who never clicks
         * still leaves knowing what is in one; a reader who does clicks into the
         * question they care about rather than the one that was open.
         */}
        <div className={styles.defend}>
          <h3 className={styles.defendHeading}>{copy.heading}</h3>
          <p className={styles.defendLead}>
            Seven decisions, each recorded at the time it was made rather than
            reconstructed for this page. Every one carries the same six parts, including
            the alternatives that lost and what would change the decision now.
          </p>
          <ul className={styles.receiptShape}>
            {RECEIPT_SECTIONS.map((section) => (
              <li className={styles.receiptShapeItem} key={section}>
                {section}
              </li>
            ))}
          </ul>
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
