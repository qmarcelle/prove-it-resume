import { PROBLEM_SECTION } from '@/content/site';
import styles from './ProblemSection.module.css';

/**
 * 01 — the operating thesis. The problem the three proofs are all about.
 *
 * "Show me what you built" is an anchor rather than a button: it goes to a fixed place
 * and has no state, so it should be a link. That also makes it work without JavaScript.
 */
export function ProblemSection() {
  return (
    <section className={styles.section} id="sec-01" aria-labelledby="sec-01-title">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{PROBLEM_SECTION.eyebrow}</p>
        <h2 className={styles.heading} id="sec-01-title">
          {PROBLEM_SECTION.heading}
        </h2>

        <ul className={styles.facets}>
          {PROBLEM_SECTION.facets.map((facet) => (
            <li className={styles.facet} key={facet.title}>
              <h3 className={styles.facetTitle}>{facet.title}</h3>
              <p className={styles.facetBody}>{facet.body}</p>
            </li>
          ))}
        </ul>

        <p className={styles.pullquote}>{PROBLEM_SECTION.pullquote}</p>

        <a className={styles.cta} href="#sec-02">
          Show me what you built ↓
        </a>
      </div>
    </section>
  );
}
