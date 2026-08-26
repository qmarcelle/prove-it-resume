import { ClaimBoundary } from '@/components/evidence/ClaimBoundary';
import { ActionIcon } from '@/components/icon/Icon';
import { SectionHead, sectionFrameClass } from '@/components/section/SectionFrame';
import { PRODUCT_ENGINEERING_HISTORY } from '@/content/history/product-engineering';
import type {
  ApplicationLens,
  HistoryEntry,
  HistoryRecord,
  SurfaceStep,
} from '@/lib/types';
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
 * ## Three registers, and the one that refuses to answer
 *
 * The direction sets this as a progression, an audience register and a discipline
 * register read together, and that structure is kept because it is how the question
 * actually gets asked: how did the work grow, who was it for, how wide did it go.
 *
 * Two of those registers contain entries the fact corpus does not support, and they are
 * rendered as open questions rather than dropped. A page that quietly omits what it
 * cannot prove looks complete; a page that names the gap tells a reader exactly what to
 * ask in the interview. The unresolved entries take the same dashed burnt-orange mark
 * every unverified row on this site takes — never evidence styling, and never a link.
 *
 * It states no new evidence. Every stated line traces to `content/resume/facts.ts`, and
 * `product-history.test.ts` holds it there.
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
  const history = PRODUCT_ENGINEERING_HISTORY;

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
        {/*
         * An ordered list, because this register really is one: the whole claim of the
         * block is that the work grew in a direction. The audience and discipline
         * registers below are unordered, and are marked up that way.
         */}
        <ol className={styles.stages}>
          {history.stages.map((stage) => (
            <li className={styles.stage} key={stage.id}>
              <span className={styles.stageOrdinal}>{stage.ordinal}</span>
              <h3 className={styles.stageTitle}>{stage.title}</h3>
              <span className={styles.stageSpan}>{stage.span}</span>
              <EntryBody entry={stage} />
            </li>
          ))}
        </ol>

        <Register heading={history.audiencesHeading} entries={history.audiences} />
        <Register heading={history.disciplinesHeading} entries={history.disciplines} />

        <ClaimBoundary variant="note">{copy.boundary}</ClaimBoundary>

        <a className={styles.cta} href={`#${nextId}`}>
          Show me what you have built with Linear
          <ActionIcon affordance="move-down-page" size={14} />
        </a>
      </div>
    </section>
  );
}

function Register({
  heading,
  entries,
}: {
  heading: string;
  entries: readonly HistoryEntry[];
}) {
  return (
    <div className={styles.register}>
      <h3 className={styles.registerHeading}>{heading}</h3>
      <ul className={styles.registerList}>
        {entries.map((entry) => (
          <li className={styles.registerItem} key={entry.id}>
            <span className={styles.registerLabel}>{entry.label}</span>
            <EntryBody entry={entry} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * An entry's substance: either what the corpus supports, or the fact that it does not.
 *
 * The unresolved branch reads as a sentence rather than as a status chip with prose
 * beside it. "Not yet evidence" is the claim being made about the line, so it belongs
 * inside the marked region, not next to it — a reader skimming the dashed boxes should
 * come away with the open questions, not with six identical labels.
 */
function EntryBody({ entry }: { entry: HistoryRecord }) {
  if (entry.body) return <p className={styles.entryText}>{entry.body}</p>;
  if (!entry.unresolved) return null;

  return (
    <p className={styles.entryUnresolved}>
      <span className={styles.entryUnresolvedMark}>NOT YET EVIDENCE</span>
      <span className={styles.entryUnresolvedNote}>{entry.unresolved.wants}</span>
    </p>
  );
}
