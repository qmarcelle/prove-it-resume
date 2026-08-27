import { CAREER, SITE } from '@/content/site';
import type { Proof, SurfaceStep } from '@/lib/types';
import { ActionIcon } from '@/components/icon/Icon';
import { SectionHead, sectionFrameClass } from '@/components/section/SectionFrame';
import styles from './CareerSection.module.css';

/**
 * 06: the production history beneath the recent systems.
 *
 * Deliberately theme-level. The design export notes that themes are surfaced in place
 * of employer-confidential details, and that constraint is kept: no employer names
 * beyond what was supplied, no proprietary metrics, no invented chronology. The
 * conventional record is the résumé's job, and the résumé bridge sits directly below.
 */
export function CareerSection({
  proofs,
  step,
}: {
  proofs: readonly Proof[];
  /** The plan step this section was placed as. Absent on `/`, which has no plan. */
  step?: SurfaceStep;
}) {
  return (
    <section
      className={`${styles.section} ${sectionFrameClass(step)}`.trim()}
      id={step ? step.id : 'career'}
      aria-labelledby="career-title"
    >
      {step ? (
        <SectionHead step={step} title={CAREER.heading} titleId="career-title" />
      ) : null}

      <div className={styles.inner}>
        {step ? null : (
          <>
            <p className={styles.eyebrow}>{CAREER.eyebrow}</p>
            <h2 className={styles.heading} id="career-title">
              {CAREER.heading}
            </h2>
          </>
        )}

        <div className={styles.entries} id="about">
          {CAREER.entries.map((entry, index) => (
            <div
              className={`${styles.entry} ${index === 0 ? styles.entryFirst : ''}`.trim()}
              key={entry.id}
            >
              <div className={styles.entryHead}>
                <h3 className={styles.entryTitle}>{entry.title}</h3>
                <span className={styles.entryMeta}>{entry.meta}</span>
              </div>
              <div className={styles.entryBody}>
                <p className={styles.entryText}>{entry.body}</p>
                {'tags' in entry && entry.tags ? (
                  <ul className={styles.tags}>
                    {entry.tags.map((tag) => (
                      <li className={styles.tag} key={tag}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {'note' in entry && entry.note ? (
                  <p className={styles.note}>{entry.note}</p>
                ) : null}
                {entry.id === 'marcelle-labs' ? (
                  <a
                    className={styles.link}
                    href={SITE.organisation}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Selected Marcelle Labs work
                    <ActionIcon affordance="visit-external-site" size={12} />
                    <span className="visually-hidden">, opens in a new tab</span>
                  </a>
                ) : null}
              </div>
            </div>
          ))}

          <div className={`${styles.entry} ${styles.entryLast}`}>
            <div className={styles.entryHead}>
              <h3 className={styles.entryTitle}>{CAREER.currentHeading}</h3>
              <span className={styles.entryMeta}>{CAREER.currentMeta}</span>
            </div>
            <ul className={styles.current}>
              {proofs.map((proof) => (
                <li className={styles.currentItem} key={proof.id}>
                  <a className={styles.currentLink} href={`#${proof.sectionId}`}>
                    <span
                      className={
                        proof.listing.shortNameIsCode
                          ? styles.currentNameCode
                          : styles.currentName
                      }
                    >
                      {proof.listing.shortName ?? proof.title}
                    </span>
                    <span className={styles.currentStatus}>
                      {proof.listing.shortStatus ?? proof.status.label}
                      <ActionIcon affordance="move-up-page" size={12} />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
