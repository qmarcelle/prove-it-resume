import { PROFILES, RESUME, SITE } from '@/content/site';
import { ResumeDownloadLink } from '@/components/resume/ResumeDownloadLink';
import type { RoleLens } from '@/lib/types';
import { isResolved } from '@/lib/evidence';
import styles from './SiteFooter.module.css';

/**
 * Footer.
 *
 * In the design export LinkedIn, Email, and Résumé all pointed at `#resume`, and the
 * Marcelle Labs link pointed at `#`. Rendering those as links would promise
 * destinations that do not exist, so unresolved profiles are shown as plain text marked
 * as not yet published. Restoring one is a matter of setting `href` and `verified` on
 * the record in `content/site.ts`.
 */
export function SiteFooter({ lens }: { lens: RoleLens }) {
  const marcelleLabs = PROFILES.find((profile) => profile.id === 'marcelle-labs');
  const links = PROFILES.filter((profile) => profile.id !== 'marcelle-labs');

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.name}>{SITE.name}</span>

        <nav className={styles.nav} aria-label="Elsewhere">
          <a href={SITE.github} target="_blank" rel="noreferrer noopener">
            GitHub ↗<span className="visually-hidden"> — opens in a new tab</span>
          </a>

          {links.map((profile) =>
            isResolved(profile) && profile.href ? (
              <a
                key={profile.id}
                href={profile.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                {profile.title} ↗
              </a>
            ) : (
              <span className={styles.pending} key={profile.id}>
                {profile.title} — not published
              </span>
            ),
          )}

          {isResolved(RESUME) ? (
            <ResumeDownloadLink lens={lens}>Résumé ↓</ResumeDownloadLink>
          ) : (
            <span className={styles.pending}>Résumé — not published</span>
          )}
        </nav>

        {marcelleLabs && isResolved(marcelleLabs) && marcelleLabs.href ? (
          <a
            className={styles.note}
            href={marcelleLabs.href}
            target="_blank"
            rel="noreferrer noopener"
          >
            {marcelleLabs.title} ↗
          </a>
        ) : (
          <span className={styles.note}>Professional work: Marcelle Labs</span>
        )}
      </div>
    </footer>
  );
}
