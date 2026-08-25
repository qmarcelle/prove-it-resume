'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './BoundedField.module.css';

/**
 * The hero composition: four unconnected nodes resolve into one labelled path.
 *
 * Ported from `design/reference/claude/Prove It Resume - Hero Concept B.dc.html`, whose
 * governing rule is the reason this is worth building at all: **geometry in SVG, labels
 * in DOM**. Nothing in the drawing is a word, a number, or a claim. The four station
 * labels beneath it are real text positioned against the stage, so the copy stays
 * selectable, translatable, and readable by a screen reader while the picture carries
 * only shape and motion.
 *
 * The settled frame is the artifact, and it has to survive being screenshotted. The
 * export's second pass exists because the first one did not: it resolved into two rules,
 * a black bar, and an amber square — geometry that communicated craft and nothing
 * specific, and that lost its meaning the moment the motion stopped. Naming the nodes
 * costs one line of the composition's purity and buys a resting state a cold reader can
 * describe in five seconds: repository, evidence, agent, decision, with the middle two
 * enclosed and the decision the only saturated mark on the stage.
 *
 * Every fallback is that same picture rather than a degraded one: no JavaScript, reduced
 * motion, and the end of the sequence are all frame B3.
 *
 * It plays **once**, on the stage's first meaningful entry into the viewport, and takes
 * about three seconds. There are no controls and no replay: this is a thing the page
 * says on arrival, not a thing the reader operates.
 *
 * Motion admission (`docs/interaction-contract.md`), one category per beat:
 *   B1 — **Causality.** The nodes settle onto one axis and repository feeds evidence.
 *   B2 — **Boundary.** A bracket encloses evidence and agent, and one node falls outside.
 *   B3 — **State.** The decision is the output, and the only saturated thing on the stage.
 *
 * No animation library. Every transition below is a CSS transition keyed off `data-beat`.
 */

/** The stage's coordinate system, from the export. Every number here is in its units. */
const VIEW = { x: 0, y: 14, width: 640, height: 126 } as const;

/** The axis every node settles onto. */
const AXIS_Y = 86;

/** Where the sequence rests. Also the server-rendered frame, and the reduced-motion one. */
const SETTLED = 3;

/**
 * Beat length. Four beats — a hold, then three — so the last one is triggered at
 * `BEAT_MS * 3` and its own 340ms transform settles a third of a second after that: 2.7s
 * to the final beat, ~3.0s to rest. The export's prototype ships 800ms, which lands at
 * 2.4s and 2.7s; this is one notch slower so the whole thing sits inside the 2.5–4s
 * window the sequence is specified to occupy however you measure it.
 */
const BEAT_MS = 900;

/**
 * How much of the stage has to be in the viewport before the sequence counts as seen.
 * Half: enough that a reader has actually arrived at the figure rather than caught its
 * top edge on the way past, and low enough that it can never be unreachable — the stage
 * is a 640×126 box and is not capable of being taller than the window.
 */
const VISIBLE_FRACTION = 0.5;

/**
 * How the excluded node behaves once the bracket closes.
 *
 * `exclusion` is the export as authored: the stray slides outward and is gone by B3.
 * `constraint` holds it still, outside the bound, at low opacity.
 *
 * This flag exists because `docs/decisions/0009-a-fourth-animated-treatment.md` shipped
 * `constraint` against the export, on the grounds that a hero whose last beat erased what
 * it ruled out would contradict a page that puts `boundary` inside `EvidenceKind` on
 * purpose. The second pass changes that argument's premise rather than answering it. In
 * the first composition the stray sat inside the same labelled field as everything else,
 * so holding it visible read as "the system knows what lies outside its boundary". Here
 * the four stations are named and the stray is not: it sits past DECISION, outside the
 * bracket and outside the vocabulary, so at rest it is an unlabelled dashed box after the
 * answer. That costs exactly the legibility the second pass was drawn to buy.
 *
 * The boundary itself is still rendered and still named — the bracket and its BOUND label
 * are what survive to B3 — so the principle the ADR was protecting is intact. What is
 * dropped is an anonymous mark, not a claim boundary.
 *
 * Kept as a flag so the comparison can be made again rather than taken on trust.
 */
const STRAY_TREATMENT: 'exclusion' | 'constraint' = 'exclusion';

/** Node columns, left to right. Index 3 is the decision, and it is a square. */
const NODE_X = [80, 260, 420, 570] as const;

/** Beat-0 scatter: each node off the axis and off its column. */
const SCATTER = [
  { x: 14, y: -46 },
  { x: -22, y: 40 },
  { x: 26, y: -58 },
  { x: -16, y: 34 },
] as const;

/**
 * The stations. DOM text, never drawn: this is the layer that tells a reader what the
 * geometry is about, and baking it into the picture would make it unreadable to a screen
 * reader and untranslatable to everyone else.
 */
const STATIONS = ['REPOSITORY', 'EVIDENCE', 'AGENT', 'DECISION'] as const;

const STAGE_LABEL = ['UNRESOLVED', 'ON EVIDENCE', 'BOUNDED', 'SETTLED'] as const;

/** What each beat asserts. Condensed from the export's own beat sheet. */
const STAGE_NOTE = [
  'Four things exist. Nothing relates them yet.',
  'Repository material becomes evidence, and causality runs left to right.',
  'The agent decides inside a bounded evidence surface.',
  'The decision is the output, and the only saturated thing on the stage.',
] as const;

/** The picture, in words, for anyone who cannot see it. Verbatim from the export. */
const ALT = [
  'Four dashed hollow nodes scattered off a common axis, unconnected.',
  'The nodes have settled onto one axis and repository connects to evidence.',
  'A bracket encloses evidence and agent, evidence connects to agent, and a stray node outside the bracket is gone.',
  'A four-node diagram: repository to evidence to agent to a filled amber decision square, with evidence and agent enclosed by a bracket labelled bound.',
] as const;

/**
 * The three edges, each drawn as a line that scales horizontally from its own start point.
 * Endpoints clear the node they leave and stop short of the arrowhead they feed.
 */
const EDGES = [0, 1, 2].map((i) => ({
  from: NODE_X[i] + 14,
  to: NODE_X[i + 1] - 16,
}));

/** The bracket, as one stroke: up, across, down. */
const BOUND_PATH = 'M 250 96 L 250 126 L 420 126 L 420 96';

/** Midpoint of the bracket, which is where its label hangs. */
const BOUND_LABEL_X = 335;

function percentOf(x: number): string {
  return `${((x - VIEW.x) / VIEW.width) * 100}%`;
}

export function BoundedField() {
  /*
   * Starts settled, which is what the server renders and what hydration must match. The
   * sequence is a rewind: the effect drops back to B0 with transitions suppressed, then
   * plays forward once the stage is actually on screen. A reader who never gets that far
   * — no JavaScript, reduced motion — keeps the finished composition, which is the whole
   * point of it being the fallback.
   */
  const [beat, setBeat] = useState(SETTLED);
  const [playing, setPlaying] = useState(false);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const element = stage.current;
    if (!element) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let observer: IntersectionObserver | undefined;
    let attach = 0;

    const play = () => {
      attach = requestAnimationFrame(() => {
        setPlaying(true);
        [1, 2, 3].forEach((next, index) => {
          timers.push(setTimeout(() => setBeat(next), BEAT_MS * (index + 1)));
        });
      });
    };

    /*
     * Two frames, and the gap between them is load-bearing. The first rewinds to B0
     * while `playing` is still false, so no transitions are attached and the jump back
     * from the settled frame is instant rather than an animation played in reverse. The
     * second attaches them and starts the sequence forward.
     *
     * The rewind happens on mount and the play waits for the viewport, which is the
     * right way round. Rewinding on entry instead would mean a reader scrolling down met
     * the finished diagram and then watched it snap back to scattered — the sequence
     * running backwards in front of them, which is the one thing the double frame exists
     * to prevent. Rewound early and off screen, it is simply waiting at its first frame.
     */
    const rewind = requestAnimationFrame(() => {
      setBeat(0);

      /* No observer, no gate: play rather than strand the reader on beat zero. */
      if (typeof IntersectionObserver !== 'function') {
        play();
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;

          // Once. The sequence is not a scroll effect and never replays.
          observer?.disconnect();
          play();
        },
        { threshold: VISIBLE_FRACTION },
      );
      observer.observe(element);
    });

    return () => {
      cancelAnimationFrame(rewind);
      cancelAnimationFrame(attach);
      observer?.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  const dropped = beat >= 1;
  const bounded = beat >= 2;
  const merged = beat >= SETTLED;

  const strayGone = bounded && STRAY_TREATMENT === 'exclusion';

  return (
    <figure className={styles.figure}>
      <div className={styles.stage} ref={stage}>
        <svg
          aria-label={ALT[beat]}
          className={`${styles.svg} ${playing ? styles.playing : ''}`.trim()}
          data-beat={beat}
          role="img"
          viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`}
        >
          {EDGES.map((edge, index) => {
            /* Each edge waits for the beat that earns it: repo→ev, ev→agent, agent→dec. */
            const on = index === 0 ? dropped : index === 1 ? bounded : merged;
            const accent = index === EDGES.length - 1;

            return (
              <g key={edge.from}>
                {/* Draw-on, left to right, by scaling the line from its own start point. */}
                <g
                  className={styles.edgeDraw}
                  transform={`translate(${edge.from} 0) scale(${on ? 1 : 0} 1) translate(${-edge.from} 0)`}
                >
                  <line
                    className={styles.edge}
                    data-accent={accent}
                    x1={edge.from}
                    x2={edge.to}
                    y1={AXIS_Y}
                    y2={AXIS_Y}
                  />
                </g>
                <path
                  className={styles.edgeHead}
                  d={`M ${edge.to - 6} ${AXIS_Y - 5} L ${edge.to} ${AXIS_Y} L ${edge.to - 6} ${AXIS_Y + 5}`}
                  data-accent={accent}
                  opacity={on ? 1 : 0}
                />
              </g>
            );
          })}

          {/* The bracket. It rises into place, so it reads as enclosing rather than as a
              container that was always there. */}
          <path
            className={styles.bound}
            d={BOUND_PATH}
            opacity={bounded ? 1 : 0}
            transform={`translate(0 ${bounded ? 0 : -10})`}
          />

          {/* The node outside the bracket. It exits outward, never inward. */}
          <rect
            className={styles.stray}
            height="24"
            opacity={strayGone ? 0 : bounded ? 0.35 : 1}
            transform={`translate(${strayGone ? 26 : 0} 0)`}
            width="40"
            x="592"
            y="74"
          />

          {NODE_X.map((x, index) => {
            const decision = index === NODE_X.length - 1;
            const live = decision ? merged : dropped;
            const offset = dropped ? { x: 0, y: 0 } : SCATTER[index];

            return (
              <g
                className={styles.nodeGroup}
                key={x}
                transform={`translate(${offset.x} ${offset.y})`}
              >
                {decision ? (
                  <rect
                    className={`${styles.node} ${styles.decision}`}
                    data-live={live}
                    data-solid={dropped}
                    height="20"
                    width="20"
                    x={x - 10}
                    y={AXIS_Y - 10}
                  />
                ) : (
                  <circle
                    className={styles.node}
                    cx={x}
                    cy={AXIS_Y}
                    data-live={live}
                    data-solid={dropped}
                    r="7"
                  />
                )}
              </g>
            );
          })}
        </svg>

        <div className={styles.stations}>
          {STATIONS.map((station, index) => (
            <span
              className={styles.station}
              data-reached={index === STATIONS.length - 1 ? merged : dropped}
              key={station}
              style={{ left: percentOf(NODE_X[index]) }}
            >
              {station}
            </span>
          ))}

          {/* The bracket's name. It labels geometry, so it lives beside the stations
              rather than inside the drawing, on the same rule as everything else here. */}
          <span
            className={styles.boundLabel}
            data-shown={bounded}
            style={{ left: percentOf(BOUND_LABEL_X) }}
          >
            BOUND
          </span>
        </div>
      </div>

      <figcaption className={styles.caption}>
        <span className={styles.captionState}>{STAGE_LABEL[beat]}</span>
        <span className={styles.captionNote}>{STAGE_NOTE[beat]}</span>
      </figcaption>
    </figure>
  );
}
