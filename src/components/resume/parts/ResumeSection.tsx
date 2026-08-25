import styles from '../ResumeDocument.module.css';

/**
 * A numbered block: the mono label rail on the left, the content on the right.
 *
 * Every section of every projection is one of these, which is the point — the rail
 * width, the label typography, and the 24px gutter are the document's spine, and a
 * section that set its own would be visibly a different document on the same sheet.
 *
 * `grow` marks the last block on a page. It takes the remaining height, which is what
 * gives `margin-top: auto` something to push against; exactly one block per page should
 * carry it.
 *
 * `density` selects the body's internal rhythm. The export sets a different gap on each
 * block — 9px, 12px, 8px — rather than one shared value, and on a fixed page box those
 * 3px differences accumulate into a visibly different bottom edge, so they are named
 * and kept rather than harmonised.
 */
export function ResumeSection({
  labelLines,
  note,
  grow = false,
  page2 = false,
  density = 'default',
  children,
}: {
  labelLines: readonly string[];
  note?: string;
  grow?: boolean;
  page2?: boolean;
  density?: 'default' | 'narrow' | 'tight';
  children: React.ReactNode;
}) {
  const body =
    density === 'narrow'
      ? styles.blockBodyNarrow
      : density === 'tight'
        ? styles.blockBodyTight
        : styles.blockBody;

  return (
    <section className={`${styles.block} ${grow ? styles.blockGrow : ''}`.trim()}>
      <div className={page2 ? styles.blockLabelPage2 : styles.blockLabel}>
        <div>
          {labelLines.map((line, index) => (
            <span key={line}>
              {index > 0 ? <br /> : null}
              {line}
            </span>
          ))}
        </div>
        {note ? <div className={styles.blockLabelNote}>{note}</div> : null}
      </div>
      <div className={body}>{children}</div>
    </section>
  );
}

/**
 * A stated limit, in the document's own boundary voice.
 *
 * `anchored` pins it to the foot of the page. That is right when the boundary closes a
 * sheet, and wrong when another block follows it — which is why it is a prop rather
 * than baked into the class, and why the Linear projection's systems boundary sits
 * inline while the durable résumé's sits on the bottom rule.
 */
export function ResumeBoundary({
  label,
  children,
  anchored = false,
}: {
  label: string;
  children: React.ReactNode;
  anchored?: boolean;
}) {
  return (
    <div className={anchored ? styles.boundary : styles.boundaryInline}>
      <span className={styles.boundaryLabel}>{label}</span>
      <p className={styles.boundaryBody}>{children}</p>
    </div>
  );
}

/** The one-line footnote form of a system: a label, a name, and a sentence. */
export function ResumeCompactEntry({
  label,
  name,
  nameIsCode = false,
  children,
}: {
  label: string;
  name: string;
  nameIsCode?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.also}>
      <span className={styles.alsoLabel}>{label}</span>
      <p className={styles.alsoBody}>
        <strong className={nameIsCode ? styles.alsoNameCode : styles.alsoName}>
          {name}
        </strong>{' '}
        {children}
      </p>
    </div>
  );
}
