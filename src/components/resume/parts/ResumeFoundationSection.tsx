import type { ResolvedResume } from '@/content/resume';
import styles from '../ResumeDocument.module.css';

/**
 * The foundation block: capabilities, education, and whatever credentials the
 * projection could afford to keep.
 *
 * The stack renders two ways. One undifferentiated mono run is what the durable résumé
 * uses and what most readers expect; grouped rows are what a reader looking for a
 * specific competence needs, because a 22-item list gives them no way to answer "does
 * this person do the frontend as well as the platform?" without reading all of it.
 * Both are the same facts — `resume.test.ts` asserts every grouped item also appears
 * in the durable run or in a system's stack.
 */
export function ResumeFoundationSection({
  stack,
  education,
  educationLabel,
  certifications,
  nonprofit,
}: {
  stack: ResolvedResume['foundation']['stack'];
  education: ResolvedResume['foundation']['education'];
  educationLabel: string;
  certifications: ResolvedResume['foundation']['certifications'];
  nonprofit: ResolvedResume['foundation']['nonprofit'];
}) {
  return (
    <>
      {'line' in stack ? (
        <div className={styles.foundationLead}>
          <div className={styles.foundationLabel}>{stack.label}</div>
          <p className={styles.foundationStack}>{stack.line}</p>
        </div>
      ) : (
        /*
         * The grouped form stacks its heading above the rows rather than beside them.
         *
         * Beside them it would nest a second label column inside the block's own 140px
         * rail, leaving each capability run about 200px to wrap in — every row went to
         * two lines and the block cost a third of page two to say five short things.
         */
        <div className={styles.capabilityBlock}>
          <div className={styles.capabilityBlockLabel}>{stack.label}</div>
          <div className={styles.capabilityRows}>
            {stack.groups.map((group) => (
              <div className={styles.capabilityRow} key={group.id}>
                <span className={styles.capabilityLabel}>{group.label}</span>
                <span className={styles.capabilityItems}>{group.items}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.foundation}>
        <div className={styles.foundationLabel}>{educationLabel}</div>
        <div className={styles.foundationRows}>
          {education.map((entry) => (
            <div className={styles.educationRow} key={entry.id}>
              <span className={styles.degree}>{entry.degree}</span>
              <span className={styles.institution}>{entry.institution}</span>
              <span className={styles.educationDates}>{entry.dates}</span>
            </div>
          ))}
        </div>
      </div>

      {certifications ? (
        <div className={styles.foundation}>
          <div className={styles.foundationLabel}>{certifications.label}</div>
          <p className={styles.certifications}>
            {certifications.primary}{' '}
            <span className={styles.certificationsEarlier}>{certifications.earlier}</span>
          </p>
        </div>
      ) : null}

      {nonprofit ? (
        <div className={styles.foundation}>
          <div className={styles.foundationLabel}>{nonprofit.label}</div>
          <div className={styles.foundationRowsTight}>
            <div className={styles.educationRow}>
              <span className={styles.degree}>{nonprofit.title}</span>
              <span className={styles.institution}>{nonprofit.organisation}</span>
              <span className={styles.educationDates}>{nonprofit.dates}</span>
            </div>
            <p className={styles.nonprofitBody}>{nonprofit.body}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
