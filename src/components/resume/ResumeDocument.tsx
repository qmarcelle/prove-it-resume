import { RESUME_DOCUMENT } from '@/content/resume';
import styles from './ResumeDocument.module.css';

/**
 * The two-page letter résumé, as one printable document.
 *
 * Ported from the Claude Design export's `<doc-page size="letter">` with explicit
 * pagination: two fixed page boxes rather than a single reflowing text stream. That
 * choice is load-bearing. The design places a boundary note at the foot of page one and
 * a footer at the foot of page two using `margin-top: auto`, which only means anything
 * inside a box of known height — let the browser paginate this and both float upward
 * into the middle of whatever page they land on.
 *
 * So each page is exactly `8.5in × 11in` with `overflow: hidden`, and the print rules
 * pin `@page` to the same geometry with zero margin (the insets live on the page's own
 * padding). Chromium then renders one sheet per section, which is what makes the PDF
 * identical to what this route shows on screen.
 *
 * A Server Component with no interactivity: this ships no JavaScript, and the PDF build
 * gets a fully-rendered document without waiting on hydration.
 */
export function ResumeDocument({ targetTitle }: { targetTitle: string }) {
  const d = RESUME_DOCUMENT;

  return (
    <div className={styles.document}>
      {/* ─────────────────────────── PAGE 1 ─────────────────────────── */}
      <section className={styles.page} id="resume-page-1">
        <header className={styles.masthead}>
          <div className={styles.mastheadTop}>
            <h1 className={styles.name}>{d.name}</h1>
            <span className={styles.pageMeta}>{d.revision} · PAGE 01 / 02</span>
          </div>
          <div className={styles.targetRow}>
            <span className={styles.targetTitle}>{targetTitle}</span>
            <span className={styles.domains}>{d.domains}</span>
          </div>
          <div className={styles.contactRow}>
            <span>{d.location}</span>
            {d.links.map((link) => (
              <a className={styles.contactLink} href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </header>

        <section className={styles.block}>
          <div className={styles.blockLabel}>01 / PROFILE</div>
          <div className={styles.blockBodyNarrow}>
            <h2 className={styles.profileHeading}>{d.profile.heading}</h2>
            <p className={styles.profileBody}>{d.profile.body}</p>
          </div>
        </section>

        <section className={`${styles.block} ${styles.blockGrow}`}>
          <div className={styles.blockLabel}>
            <div>
              02 / SELECTED
              <br />
              SYSTEMS
            </div>
            <div className={styles.blockLabelNote}>{d.systemsNote}</div>
          </div>

          <div className={styles.blockBody}>
            {d.systems.map((system, index) => (
              <article
                className={index === 0 ? styles.systemLead : styles.system}
                key={system.id}
              >
                <div className={styles.systemHead}>
                  <h3
                    className={
                      system.nameIsCode ? styles.systemNameCode : styles.systemName
                    }
                  >
                    {system.name}
                  </h3>
                  <span className={styles.systemSummary}>{system.summary}</span>
                  <a className={styles.verify} href={system.verifyHref}>
                    VERIFY ↗
                  </a>
                </div>
                <ul className={styles.bullets}>
                  {system.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <div className={styles.stackLine}>{system.stack}</div>
              </article>
            ))}

            <div className={styles.also}>
              <span className={styles.alsoLabel}>{d.alsoLabel}</span>
              <p className={styles.alsoBody}>
                <strong className={styles.alsoName}>{d.also.name}</strong> {d.also.body}
              </p>
            </div>

            <div className={styles.boundary}>
              <span className={styles.boundaryLabel}>{d.boundaryLabel}</span>
              <p className={styles.boundaryBody}>{d.boundary}</p>
            </div>
          </div>
        </section>
      </section>

      {/* ─────────────────────────── PAGE 2 ─────────────────────────── */}
      <section className={styles.page} id="resume-page-2">
        <header className={styles.runningHead}>
          <span className={styles.runningName}>{d.name}</span>
          <span className={styles.pageMeta}>{d.revision} · PAGE 02 / 02</span>
        </header>

        <section className={styles.block}>
          <div className={styles.blockLabelPage2}>
            <div>
              03 / ENTERPRISE
              <br />
              EXPERIENCE
            </div>
            <div className={styles.blockLabelNote}>{d.employer.note}</div>
          </div>

          <div className={styles.blockBodyTight}>
            <div className={styles.employerHead}>
              <h3 className={styles.employerName}>{d.employer.name}</h3>
              <span className={styles.employerSpan}>{d.employer.span}</span>
              <span className={styles.employerLocation}>{d.employer.location}</span>
            </div>

            {d.roles.map((role, index) =>
              role.bullets ? (
                <article
                  className={index === 0 ? styles.roleLead : styles.role}
                  key={role.id}
                >
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
          </div>
        </section>

        <section className={`${styles.block} ${styles.blockGrow}`}>
          <div className={styles.blockLabelPage2}>04 / FOUNDATION</div>

          <div className={styles.blockBodyNarrow}>
            <div className={styles.foundationLead}>
              <div className={styles.foundationLabel}>{d.stackLabel}</div>
              <p className={styles.foundationStack}>{d.stack}</p>
            </div>

            <div className={styles.foundation}>
              <div className={styles.foundationLabel}>{d.educationLabel}</div>
              <div className={styles.foundationRows}>
                {d.education.map((entry) => (
                  <div className={styles.educationRow} key={entry.id}>
                    <span className={styles.degree}>{entry.degree}</span>
                    <span className={styles.institution}>{entry.institution}</span>
                    <span className={styles.educationDates}>{entry.dates}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.foundation}>
              <div className={styles.foundationLabel}>{d.certificationsLabel}</div>
              <p className={styles.certifications}>
                {d.certifications}{' '}
                <span className={styles.certificationsEarlier}>
                  {d.certificationsEarlier}
                </span>
              </p>
            </div>

            <div className={styles.foundation}>
              <div className={styles.foundationLabel}>{d.nonprofitLabel}</div>
              <div className={styles.foundationRowsTight}>
                <div className={styles.educationRow}>
                  <span className={styles.degree}>{d.nonprofit.title}</span>
                  <span className={styles.institution}>{d.nonprofit.organisation}</span>
                  <span className={styles.educationDates}>{d.nonprofit.dates}</span>
                </div>
                <p className={styles.nonprofitBody}>{d.nonprofit.body}</p>
              </div>
            </div>

            <div className={styles.docFooter}>
              <span>{d.footerLead}</span>
              <a className={styles.footerLink} href={d.footerLink.href}>
                {d.footerLink.label}
              </a>
              <span className={styles.footerTrailing}>{d.footerTrailing}</span>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
