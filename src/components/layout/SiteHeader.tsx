import { RESUME, SITE } from '@/content/site';
import { ResumeDownloadLink } from '@/components/resume/ResumeDownloadLink';
import type { AnyLens } from '@/lib/types';
import { isResolved } from '@/lib/evidence';
import { ActionIcon } from '@/components/icon/Icon';
import styles from './SiteHeader.module.css';

/**
 * Sticky header. Server Component; nothing here needs client JavaScript.
 *
 * The in-page nav is a real `<nav>` of ordinary anchors, so it works before hydration
 * and without JavaScript entirely.
 */
const DURABLE_NAV = [
  { label: 'Proof', href: '#vreko' },
  { label: 'Systems', href: '#repository-intelligence' },
  { label: 'Role Fit', href: '#role-fit' },
  { label: 'Career', href: '#career' },
  { label: 'About', href: '#about' },
] as const;

export function SiteHeader({
  showAvailability,
  lens,
  availability = SITE.availability,
  nav = DURABLE_NAV,
}: {
  showAvailability: boolean;
  lens: AnyLens;
  /** Overridden by an application lens, whose open role is a different one. */
  availability?: string;
  /**
   * The in-page nav. A surface that renders different sections in a different order
   * needs a nav that points at them; passing it in beats a header that has to know
   * which route it is on.
   */
  nav?: readonly { label: string; href: string }[];
}) {
  const resumeAvailable = isResolved(RESUME);

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <a className={styles.wordmark} href="#top">
          <span className={styles.wordmarkName}>{SITE.wordmark}</span>
          <span className={styles.wordmarkSuffix}>{SITE.wordmarkSuffix}</span>
        </a>

        <nav className={styles.nav} aria-label="Sections">
          {nav.map((entry) => (
            <a href={entry.href} key={entry.href}>
              {entry.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <a href={SITE.github} target="_blank" rel="noreferrer noopener">
            GitHub
            <ActionIcon affordance="visit-external-site" size={12} />
            <span className="visually-hidden">, opens in a new tab</span>
          </a>
          {resumeAvailable ? (
            <ResumeDownloadLink
              className={styles.resume}
              label="Résumé PDF"
              lens={lens}
            />
          ) : (
            <span className={styles.resumeUnavailable}>Résumé, not yet published</span>
          )}
        </div>
      </div>

      {showAvailability ? (
        <div className={styles.availability}>
          <p className={styles.availabilityInner}>
            <span className={styles.availabilityMark} aria-hidden="true" />
            {availability}
          </p>
        </div>
      ) : null}
    </header>
  );
}
