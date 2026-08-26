import styles from '../ResumeDocument.module.css';

/**
 * One sheet.
 *
 * Explicitly sized at 8.5in × 11in with `overflow: hidden`, which is the whole reason
 * this document paginates itself instead of letting the print engine do it: the
 * boundary note and the footer are pinned to the foot of their page with
 * `margin-top: auto`, and that means nothing inside a box of unknown height.
 *
 * The consequence is that this component fails by clipping rather than by reflowing,
 * so `tests/e2e/resume.spec.ts` asserts that no page's content exceeds its box for
 * every projection, not only for the one whose layout was tuned by hand.
 */
export function ResumePage({ n, children }: { n: 1 | 2; children: React.ReactNode }) {
  return (
    <section className={styles.page} id={`resume-page-${n}`}>
      {children}
    </section>
  );
}

/** The outer stack: page cards on screen, one sheet per section at print. */
export function ResumeSheet({ children }: { children: React.ReactNode }) {
  return <div className={styles.document}>{children}</div>;
}
