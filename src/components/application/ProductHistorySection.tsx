import { ClaimBoundary } from '@/components/evidence/ClaimBoundary';
import { ActionIcon } from '@/components/icon/Icon';
import { ProgressiveDisclosure } from '@/components/interactions/ProgressiveDisclosure';
import { SectionHead, sectionFrameClass } from '@/components/section/SectionFrame';
import { DISCLOSURE_KEYS, requirePath } from '@/lib/disclosure';
import { PRODUCT_ENGINEERING_HISTORY } from '@/content/history/product-engineering';
import type {
  ApplicationLens,
  DisclosureCopy,
  HistoryEntry,
  HistoryRecord,
  ProductHistory,
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
 * ## What the reader meets, and in what order
 *
 * The section used to state all three registers at once: a four-stage progression, who
 * the products served, and the disciplines the work spanned. Every line of it was
 * traceable, and reading it still cost more than a reader will spend before they have
 * decided the person is interesting. So the progression stays visible, because *the
 * work grew in a direction* is the claim, and the two flat registers move behind the
 * question that actually asks for them.
 *
 * ## Two projections over one record, not a second record
 *
 * `stageSummaries`, `surfaces` and `capabilities` are all keyed by the durable entry
 * they compress, so the deep layer cannot name an audience or a discipline the record
 * does not have, and a row added to `product-engineering.ts` cannot silently fail to
 * appear here. `product-history.test.ts` holds both directions. The long-form durable
 * bodies are not deleted; where a projection exists it is simply the shorter way to
 * read the same row, and the underlying facts remain in the résumé corpus.
 *
 * ## The unresolved branch
 *
 * Two of those registers used to contain entries the fact corpus could not support, and
 * they rendered as open questions rather than being dropped. A page that quietly omits
 * what it cannot prove looks complete; a page that names the gap tells a reader exactly
 * what to ask in the interview. Every one of those questions has since been answered by
 * the record, so the page currently states all three registers in full.
 *
 * The unresolved branch stays. It takes the same dashed burnt-orange mark every
 * unverified row on this site takes, never evidence styling and never a link, and a
 * fixture test keeps it working for the next question this page cannot answer.
 *
 * Its number, its eyebrow and its frame come from `step`, which is the surface's page
 * plan. This section does not know where it sits, and that is the point: the sequence
 * is one list, in one file, and nothing on the page is allowed a second opinion.
 */
export function ProductHistorySection({
  copy,
  step,
  nextId,
  history = PRODUCT_ENGINEERING_HISTORY,
}: {
  copy: ApplicationLens['sections']['history'];
  step: SurfaceStep;
  /** The section the closing call to action moves the reader to. */
  nextId: string;
  /**
   * The records to render. Defaults to the durable history, and exists as a parameter
   * for one reason: `UNVERIFIED` is empty as of the final fact pass, so nothing on the
   * real page currently takes the unresolved branch below. A rendering path with no
   * instance is a rendering path that quietly rots, and this one has to work the next
   * time the record cannot answer a question. `ProductHistorySection.test.tsx` renders
   * an unresolved fixture through it.
   */
  history?: ProductHistory;
}) {
  const path = (id: string): DisclosureCopy => requirePath(copy.paths, id);

  return (
    <section
      className={sectionFrameClass(step)}
      id={step.id}
      aria-labelledby="product-history-title"
    >
      <SectionHead
        step={step}
        title={copy.heading}
        titleId="product-history-title"
        lead={copy.body}
      />

      <div className={styles.inner}>
        {copy.secondBeat ? <p className={styles.body}>{copy.secondBeat}</p> : null}

        {/*
         * An ordered list, because this register really is one: the whole claim of the
         * block is that the work grew in a direction. The two flat registers behind the
         * first curiosity path are unordered, and are marked up that way.
         *
         * Each stage prints the projection where the surface supplies one and the
         * durable body where it does not, so this renders correctly for a lens that has
         * not written summaries as well as for one that has.
         */}
        <ol className={styles.stages}>
          {history.stages.map((stage) => (
            <li className={styles.stage} key={stage.id}>
              <span className={styles.stageOrdinal}>{stage.ordinal}</span>
              <h3 className={styles.stageTitle}>{stage.title}</h3>
              <span className={styles.stageSpan}>{stage.span}</span>
              {copy.stageSummaries?.[stage.id] ? (
                <p className={styles.entryText}>{copy.stageSummaries[stage.id]}</p>
              ) : (
                <EntryBody entry={stage} />
              )}
            </li>
          ))}
        </ol>

        <ProgressiveDisclosure
          label="Questions this history can answer"
          queryKey={DISCLOSURE_KEYS['product-history']}
          paths={[
            {
              id: path('built').id,
              invitation: path('built').invitation,
              label: path('built').label,
              content: (
                <div className={styles.deepLayer}>
                  <Register
                    entries={history.audiences}
                    heading={history.audiencesHeading}
                    projection={copy.surfaces}
                  />

                  {copy.capabilities?.length ? (
                    <div className={styles.register}>
                      <h4 className={styles.registerHeading}>
                        {history.disciplinesHeading}
                      </h4>
                      <dl className={styles.capabilities}>
                        {copy.capabilities.map((capability) => (
                          <div className={styles.capability} key={capability.id}>
                            <dt className={styles.registerLabel}>{capability.label}</dt>
                            <dd className={styles.capabilityItems}>{capability.items}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ) : (
                    <Register
                      entries={history.disciplines}
                      heading={history.disciplinesHeading}
                    />
                  )}

                  <ClaimBoundary variant="note">{copy.boundary}</ClaimBoundary>
                </div>
              ),
            },
            {
              id: path('leadership').id,
              invitation: path('leadership').invitation,
              label: path('leadership').label,
              content: (
                <div className={styles.deepLayer}>
                  <div className={styles.deepProse}>
                    {path('leadership').paragraphs?.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <ClaimBoundary variant="note">{copy.boundary}</ClaimBoundary>
                </div>
              ),
            },
          ]}
        />

        <a className={styles.cta} href={`#${nextId}`}>
          Show me what you have built with Linear
          <ActionIcon affordance="move-down-page" size={14} />
        </a>
      </div>
    </section>
  );
}

/**
 * One flat register: who the work was for, or what it spanned.
 *
 * Prints the surface's one-line projection where there is one and the durable body
 * where there is not, so the same component serves a lens that has compressed the
 * record and one that has not.
 */
function Register({
  heading,
  entries,
  projection,
}: {
  heading: string;
  entries: readonly HistoryEntry[];
  projection?: Readonly<Record<string, string>>;
}) {
  return (
    <div className={styles.register}>
      <h4 className={styles.registerHeading}>{heading}</h4>
      <ul className={styles.registerList}>
        {entries.map((entry) => (
          <li className={styles.registerItem} key={entry.id}>
            <span className={styles.registerLabel}>{entry.label}</span>
            {projection?.[entry.id] ? (
              <p className={styles.entryText}>{projection[entry.id]}</p>
            ) : (
              <EntryBody entry={entry} />
            )}
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
 * inside the marked region, not next to it: a reader skimming the dashed boxes should
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
