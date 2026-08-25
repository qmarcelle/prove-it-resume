import type { SurfaceStep } from '@/lib/types';
import styles from './SectionFrame.module.css';

/**
 * One outer section frame, and one index rail, for every section of a lens surface.
 *
 * Before this existed, an application surface was five different section shells sharing
 * a page: the editorial sections carried the application stylesheet's rhythm, the proof
 * sections carried the proof shell's, the promoted supporting entry carried its own, and
 * the compact and inverted treatments each started from wherever their component
 * happened to begin. The numbers sat at four different horizontal positions and two of
 * the sections had no number at all.
 *
 * So the frame is normalised *before* any visual treatment is applied to it. What every
 * section shares now:
 *
 * - the same content origin — the section's own left edge, which every block below the
 *   head is set from;
 * - the same index rail — a fixed column at that origin holding the sequence number, so
 *   headings across editorial, receipts, proof, compact and banded sections land on one
 *   vertical line rather than four;
 * - the same head grammar — index, eyebrow, title, lead — sourced from the page plan.
 *
 * `frame` is the only axis of variation, and it is declared by the plan rather than by
 * the section, because how loudly a section is set is a decision about the page.
 *
 * The band frame is inset rather than full-bleed. The measure and the gutters belong to
 * the layout shell, and a section reaching past them would have to overlap the progress
 * rail sitting beside it; the ground changes without the measure moving, which is the
 * same trade the durable page's one dark chapter already makes.
 */
export function sectionFrameClass(step: SurfaceStep | undefined): string {
  return step ? styles[step.frame] : '';
}

/**
 * The head: index number, eyebrow, title, and the lead that shares its row.
 *
 * `titleId` is required because every section on this surface is named by its heading
 * through `aria-labelledby`, and a head that rendered the title without publishing its
 * id would quietly break that link for the section that owns it.
 */
export function SectionHead({
  step,
  title,
  titleId,
  lead,
  ruled,
}: {
  step: SurfaceStep;
  title: string;
  titleId: string;
  /** The one-paragraph statement that shares the head's row. */
  lead?: React.ReactNode;
  /**
   * Whether the head closes with a rule. Defaults to the frame's answer.
   *
   * Only the standard frame rules its head. A band already states its own edges, a
   * compact section is about to be followed by its figure, and an inline head is the
   * demotion — a rule under any of the three would be a second boundary in the same
   * place, which is how a page ends up looking ruled rather than structured.
   */
  ruled?: boolean;
}) {
  const closed = ruled ?? step.frame === 'standard';

  return (
    <div
      className={`${styles.head} ${closed ? styles.headRuled : ''}`.trim()}
      data-section-head={step.frame}
    >
      {/*
       * The number is decorative here and only here: the same sequence is announced by
       * the progress rail's `aria-current` and by the header nav's labels, and reading
       * "zero six" before every heading would be noise. `data-section-index` is the
       * handle the alignment test reaches for, so that assertion does not depend on a
       * hashed class name.
       */}
      <span className={styles.index} aria-hidden="true" data-section-index={step.n}>
        {step.n}
      </span>

      <div className={styles.headBody}>
        <div className={styles.origin}>
          <span className={styles.eyebrow}>{step.eyebrow}</span>
          <h2 className={styles.title} id={titleId}>
            {title}
          </h2>
        </div>
        {lead ? <p className={styles.lead}>{lead}</p> : null}
      </div>
    </div>
  );
}
