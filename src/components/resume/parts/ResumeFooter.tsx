import styles from '../ResumeDocument.module.css';

/**
 * The document footer, pinned to the bottom rule of page two.
 *
 * It is the handover: the sheet states claims, and this says where every one of them
 * can be checked. The destination is the projection's, because a Linear reader who
 * opens the personal site should land on the surface written for them rather than on
 * the durable index and have to find it.
 */
export function ResumeFooter({
  lead,
  link,
  trailing,
}: {
  lead: string;
  link: { label: string; href: string };
  trailing: string;
}) {
  return (
    <div className={styles.docFooter}>
      <span>{lead}</span>
      <a className={styles.footerLink} href={link.href}>
        {link.label}
      </a>
      <span className={styles.footerTrailing}>{trailing}</span>
    </div>
  );
}
