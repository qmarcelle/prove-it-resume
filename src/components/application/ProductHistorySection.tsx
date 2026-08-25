import { ClaimBoundary } from '@/components/evidence/ClaimBoundary';
import { ActionIcon } from '@/components/icon/Icon';
import { SectionHead, sectionFrameClass } from '@/components/section/SectionFrame';
import type { ApplicationLens, SurfaceStep } from '@/lib/types';
import styles from './ApplicationSection.module.css';

/**
 * The opening section of an application surface: the production history the recent
 * systems sit on.
 *
 * This replaces the operating-thesis section on `/`. That section argues *why the
 * problem is hard*, which is the right opening for a reader who arrived without a role
 * in mind, and the wrong one for a reader who already builds agent infrastructure and
 * knows. What they do not know is whether the person has shipped customer-facing
 * software at scale before, so that is what opens here.
 *
 * It states no new evidence. Every fact it names — the initiatives, the span, the
 * regulated environment — is in the résumé chronology below and in the durable career
 * section; the boundary immediately underneath says what the section is not claiming,
 * in the same voice every other boundary on this site uses.
 *
 * Its number, its eyebrow and its frame come from `step`, which is the surface's page
 * plan. This section does not know where it sits, and that is the point: the sequence
 * is one list, in one file, and nothing on the page is allowed a second opinion.
 */
export function ProductHistorySection({
  copy,
  step,
  nextId,
}: {
  copy: ApplicationLens['sections']['history'];
  step: SurfaceStep;
  /** The section the closing call to action moves the reader to. */
  nextId: string;
}) {
  return (
    <section
      className={sectionFrameClass(step)}
      id={step.id}
      aria-labelledby="lin-history-title"
    >
      <SectionHead
        step={step}
        title={copy.heading}
        titleId="lin-history-title"
        lead={copy.body}
      />

      <div className={styles.inner}>
        <ClaimBoundary variant="note">{copy.boundary}</ClaimBoundary>

        <a className={styles.cta} href={`#${nextId}`}>
          Show me what you have built with Linear
          <ActionIcon affordance="move-down-page" size={14} />
        </a>
      </div>
    </section>
  );
}
