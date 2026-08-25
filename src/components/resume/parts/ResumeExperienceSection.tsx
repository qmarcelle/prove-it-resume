import type { ResolvedResume } from '@/content/resume';
import styles from '../ResumeDocument.module.css';

/**
 * The employment record: one employer head, then the roles beneath it.
 *
 * A role with no bullets renders as a single compact row rather than as an empty
 * article. That is the 2016–2019 developer period, and the compact form is a deliberate
 * statement: the title and dates are established, and nothing beneath them is. Padding
 * it out would be the one edit this document exists to argue against.
 */
export function ResumeExperienceSection({
  employer,
  roles,
}: {
  employer: ResolvedResume['experience']['employer'];
  roles: ResolvedResume['experience']['roles'];
}) {
  return (
    <>
      <div className={styles.employerHead}>
        <h3 className={styles.employerName}>{employer.name}</h3>
        <span className={styles.employerSpan}>{employer.span}</span>
        <span className={styles.employerLocation}>{employer.location}</span>
      </div>

      {roles.map((role, index) =>
        role.bullets.length > 0 ? (
          <article className={index === 0 ? styles.roleLead : styles.role} key={role.id}>
            <div className={styles.roleHead}>
              <h4 className={styles.roleTitle}>{role.title}</h4>
              <span className={styles.roleDates}>{role.dates}</span>
            </div>
            <ul className={styles.bullets}>
              {role.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </article>
        ) : (
          <article className={styles.roleCompact} key={role.id}>
            <h4 className={styles.roleTitle}>{role.title}</h4>
            <span className={styles.roleDates}>{role.dates}</span>
          </article>
        ),
      )}
    </>
  );
}
