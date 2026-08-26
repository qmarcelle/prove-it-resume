import styles from '../ResumeDocument.module.css';

export type MastheadLink = { label: string; href: string };

/**
 * Page one's masthead: identity, target, contact.
 *
 * Three fixed rows, in that order, on every projection. The target row is the only
 * place a lens shows through: the title is the lens's, the domains string is the
 * projection's, and both share one fixed 7.3in measure, which is why
 * `resume.spec.ts` asserts headroom on that row rather than merely counting lines.
 *
 * Location sits with the name, not in the contact row. It answers "who and where",
 * which is identity; the row below answers "how to reach me", which is all digital.
 * Keeping a place name among the URLs made the row read as a list of addresses with
 * one odd entry in it.
 */
export function ResumeMasthead({
  name,
  location,
  meta,
  targetTitle,
  domains,
  links,
}: {
  name: string;
  location: string;
  meta: string;
  targetTitle: string;
  domains: string;
  links: readonly MastheadLink[];
}) {
  return (
    <header className={styles.masthead}>
      <div className={styles.mastheadTop}>
        <div className={styles.identity}>
          <h1 className={styles.name}>{name}</h1>
          <span className={styles.location}>{location}</span>
        </div>
        <span className={styles.pageMeta}>{meta}</span>
      </div>
      <div className={styles.targetRow}>
        <span className={styles.targetTitle}>{targetTitle}</span>
        <span className={styles.domains}>{domains}</span>
      </div>
      <div className={styles.contactRow}>
        {links.map((link) => (
          <a className={styles.contactLink} href={link.href} key={link.href}>
            {link.label}
          </a>
        ))}
      </div>
    </header>
  );
}

/** Page two's running head. */
export function ResumeRunningHead({ name, meta }: { name: string; meta: string }) {
  return (
    <header className={styles.runningHead}>
      <span className={styles.runningName}>{name}</span>
      <span className={styles.pageMeta}>{meta}</span>
    </header>
  );
}
