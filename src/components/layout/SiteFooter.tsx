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
 * destinations that do not exist, so an unresolved profile is shown as plain text
 * marked as not yet published. All of them resolve now, but the branch stays: it is the
 * mechanism that keeps a future record from shipping as a dead link, and deleting it
 * because nothing currently needs it is how that guarantee gets lost.
 *
 * Email is the one destination that does not open a page, so it renders without the
 * new-tab affordance — the `↗` and its screen-reader note both describe navigating to a
 * site, and neither is true of handing the address to a mail client.
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

          {links.map((profile) => {
            if (!isResolved(profile) || !profile.href) {
              return (
                <span className={styles.pending} key={profile.id}>
                  {profile.title} — not published
                </span>
              );
            }

            return profile.href.startsWith('mailto:') ? (
              <a href={profile.href} key={profile.id}>
                {profile.title}
              </a>
            ) : (
              <a
                key={profile.id}
                href={profile.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                {profile.title} ↗
                <span className="visually-hidden"> — opens in a new tab</span>
              </a>
            );
          })}

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
