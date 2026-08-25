import { PROFILES, RESUME, RESUME_BRIDGE } from '@/content/site';
import { RESUME_DOCUMENT } from '@/content/resume';
import { ResumeDownloadLink } from '@/components/resume/ResumeDownloadLink';
import type { RoleLens } from '@/lib/types';
import { isResolved } from '@/lib/evidence';
import { ActionIcon } from '@/components/icon/Icon';
import styles from './ResumeBridge.module.css';

/**
 * The bridge to the conventional résumé — now a completion state.
 *
 * This section spent its whole life stating a gap: no file had been supplied, so where
 * a download button belonged there was a dashed box reading "RÉSUMÉ PDF — NOT YET
 * PUBLISHED". The redesign's handoff listed that copy for removal *once the PDF lands*,
 * and it has: the document is generated from `content/resume.ts` and committed to
 * `public/`. So the button is real, and it says how long the thing behind it is,
 * because "how many pages" is the first question anyone asks of a résumé.
 *
 * The unresolved branches stay. Nothing renders them today, but they are the mechanism
 * that stops a future edit which clears an `href` from shipping a link to a 404 — and
 * this is the section where that failure would be most costly.
 *
 * LinkedIn sits under the download rather than beside it. The redesign shows a single
 * call to action here and it is right about the hierarchy: this section exists to hand
 * over one artifact. But a profile is what several hiring processes ask for next, and
 * burying it in the footer alone makes the reader go hunting, so it renders as the
 * quiet second line.
 */
export function ResumeBridge({ lens }: { lens: RoleLens }) {
  const resumeAvailable = isResolved(RESUME);
  const linkedin = PROFILES.find((profile) => profile.id === 'linkedin');
  const linkedinAvailable = linkedin ? isResolved(linkedin) : false;

  return (
    <section className={styles.section} id="resume" aria-labelledby="resume-title">
      <div className={styles.inner}>
        <div className={styles.body}>
          <span className={styles.eyebrow}>COMPANION ARTIFACT</span>
          <h2 className={styles.heading} id="resume-title">
            {RESUME_BRIDGE.heading}
          </h2>
          <p className={styles.text}>{RESUME_BRIDGE.body}</p>
        </div>

        <div className={styles.actions}>
          {resumeAvailable ? (
            <ResumeDownloadLink
              className={styles.primary}
              label="RÉSUMÉ · PDF"
              lens={lens}
            >
              <span className={styles.pageCount}>{RESUME_DOCUMENT.pages} PP</span>
            </ResumeDownloadLink>
          ) : (
            <span className={styles.pending}>RÉSUMÉ PDF — NOT YET PUBLISHED</span>
          )}

          {linkedinAvailable && linkedin?.href ? (
            <a
              className={styles.secondary}
              href={linkedin.href}
              target="_blank"
              rel="noreferrer noopener"
            >
              View LinkedIn
              <ActionIcon affordance="visit-external-site" size={12} />
              <span className="visually-hidden"> — opens in a new tab</span>
            </a>
          ) : (
            <span className={styles.pending}>LINKEDIN — NOT PUBLISHED</span>
          )}

          {!resumeAvailable || !linkedinAvailable ? (
            <p className={styles.note}>
              These are wired but unpublished. The evidence above is complete without
              them; a link that resolves to nothing would be worse than its absence.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
