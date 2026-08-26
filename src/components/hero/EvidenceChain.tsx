import styles from './EvidenceChain.module.css';

/**
 * The hero figure for an application surface: how work becomes evidence.
 *
 * ## What it argues
 *
 * Five stations in one direction — a product someone depends on, the context resolved
 * for it, the agent that acts inside a boundary, the decision that changed, and the
 * frozen artifact that proves it. The last one is the only saturated mark on the page,
 * which is the whole thesis stated in a colour: evidence is what survives the chain,
 * and amber is spent where it was earned rather than sprinkled for emphasis.
 *
 * The durable page's hero figure argues something else — that a decision is bounded —
 * and stays where it is. This surface opens on the pipeline instead because the reader
 * it is written for already operates one.
 *
 * ## Why this is a Server Component
 *
 * The composition is text and CSS. There is no JavaScript here, and the settled frame
 * is the authored DOM state: every rule below describes the *finished* chain, and the
 * keyframes animate in from a hidden start with `fill-mode: both`. Delete the animation
 * and nothing about the figure changes.
 *
 * That is what makes the reduced-motion and no-JavaScript cases free rather than
 * special. `prefers-reduced-motion` sets `animation: none` and the reader gets the
 * settled chain immediately; with scripting off it was never involved.
 *
 * ## The text alternative is the figure
 *
 * The direction asks for an alternative naming the five stations in order. Rather than
 * writing one, the stations *are* an ordered list of real DOM text, and the connectors
 * between them are decorative pseudo-elements. A screen reader gets the sequence and
 * each station's sentence, which is more than any alt string would have carried.
 */

/**
 * Framing copy. It names no system, states no metric, and makes no claim a proof below
 * does not already carry — the same standard the hero's words are held to.
 */
const STATIONS: readonly {
  id: string;
  name: string;
  body: string;
  /** The one earned end of the chain, and the only saturated mark in the figure. */
  verified?: boolean;
}[] = [
  {
    id: '01',
    name: 'PRODUCT',
    body: 'A customer-facing surface someone depends on.',
  },
  {
    id: '02',
    name: 'CONTEXT',
    body: 'Repository and memory evidence, resolved rather than guessed.',
  },
  {
    id: '03',
    name: 'AGENT',
    body: 'Delegated execution inside a stated boundary.',
  },
  {
    id: '04',
    name: 'DECISION',
    body: 'A recorded change in what the system chose to do.',
  },
  {
    id: '05',
    name: 'VERIFIED',
    body: 'A frozen artifact, digest-checked, with its limits written down.',
    verified: true,
  },
];

export function EvidenceChain() {
  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>
        <span className={styles.captionTitle}>HOW WORK BECOMES EVIDENCE</span>
        <span className={styles.captionMeta}>ONE PASS · SETTLES</span>
      </figcaption>

      <ol className={styles.chain}>
        {STATIONS.map((station, index) => (
          <li
            className={station.verified ? styles.stationVerified : styles.station}
            key={station.id}
            /*
             * The stagger index, as a custom property rather than five hand-written
             * delay rules. The connector before each station reads the same number, so
             * the two can never fall out of step.
             */
            style={{ '--step': index } as React.CSSProperties}
          >
            <span aria-hidden="true" className={styles.mark} />
            <span className={styles.stationName}>
              {station.id} {station.name}
            </span>
            <span className={styles.stationBody}>{station.body}</span>
          </li>
        ))}
      </ol>

      <p className={styles.thesis}>
        THE CHAIN IS THE ARGUMENT
        <span className={styles.legend}>
          Amber marks the verified end, only where earned
        </span>
      </p>
    </figure>
  );
}
