'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './BoundedField.module.css';

/**
 * The hero composition: three fragments become one deployable unit inside a boundary.
 *
 * Ported from `design/reference/claude/Prove It Resume - Hero Concept B.dc.html`, whose
 * governing rule is the reason this is worth building at all: **geometry in SVG, labels
 * in DOM**. Nothing in the drawing is a word, a number, or a claim. The four station
 * labels beneath it are real text positioned against the stage, so the copy stays
 * selectable, translatable, and readable by a screen reader while the picture carries
 * only shape and motion.
 *
 * The settled frame is the artifact. It is a composition worth looking at with the
 * animation switched off, which is what makes every fallback here the same picture
 * rather than a degraded one: no JavaScript, reduced motion, and the end of the sequence
 * are all frame B3.
 *
 * Motion admission (`docs/interaction-contract.md`), one category per beat:
 *   B1 — **Causality.** The evidence baseline draws first and the fragments align to it.
 *   B2 — **Boundary.** A decision boundary closes, and something falls outside it.
 *   B3 — **State.** One unit, bounded, on the evidence.
 *
 * No animation library. Every transition below is a CSS transition keyed off `data-beat`.
 */

/** The stage's coordinate system, from the export. Every number here is in its units. */
const VIEW_WIDTH = 640;

/** Where the sequence rests. Also the server-rendered frame, and the reduced-motion one. */
const SETTLED = 3;

/** Beat length. The export's prototype ships 800ms, for a 3.2s sequence plus its hold. */
const BEAT_MS = 800;

/**
 * How the excluded fragment behaves once the boundary closes.
 *
 * `exclusion` is the export as authored: the stray slides outward and fades to nothing.
 * `constraint` holds it still, outside the bound, at low opacity.
 *
 * Shipping `constraint`, and the reason is not that it is gentler. This page puts
 * `boundary` inside `EvidenceKind` on purpose — "what a piece of evidence fails to
 * establish is evidence about the claim, and typing it separately would let it drift out
 * of view" (`src/lib/types.ts`) — and the interaction contract adds that claim boundaries
 * are "rendered, never collapsed to make an interaction tidier". A hero whose last beat
 * erases what it ruled out would contradict every section beneath it. Held visible, the
 * beat says the system knows what lies outside its decision boundary; faded to zero, it
 * says the outside stopped existing.
 *
 * The export's own layer note is still satisfied: the stray never moves inward, and it
 * is never absorbed.
 */
const STRAY_TREATMENT: 'constraint' | 'exclusion' = 'constraint';

/** Fragment offsets at beat 0, before the baseline exists to align to. */
const SCATTER = [
  { x: 6, y: -74 },
  { x: 44, y: -108 },
  { x: 32, y: -58 },
] as const;

/** Fragment spacing once dropped, before they close into one unit. */
const SPACED = [0, 20, 40] as const;

const FRAGMENT_X = [100, 200, 300] as const;
const TICK_X = [100, 200, 300, 400] as const;

/**
 * The stations. DOM text, never drawn: this is the layer that tells a reader what the
 * geometry is about, and baking it into the picture would make it unreadable to a screen
 * reader and untranslatable to everyone else.
 */
const STATIONS = ['AGENT', 'CONTEXT', 'BOUNDARY', 'PRODUCTION'] as const;

const STAGE_LABEL = ['FRAGMENTED', 'ALIGNED ON EVIDENCE', 'BOUNDED', 'SETTLED'] as const;

/** What each beat asserts. Carried over from the export's own beat sheet. */
const STAGE_NOTE = [
  'Three fragments, unrelated, and nothing yet to align them to.',
  'Evidence arrives first, and the fragments align to it.',
  'A decision boundary closes. One candidate is left outside it.',
  'One unit, bounded, on the evidence.',
] as const;

/** The picture, in words, for anyone who cannot see it. Verbatim from the export. */
const ALT = [
  'Three dashed rectangles scattered above an empty field.',
  'The three rectangles have dropped onto a common baseline.',
  'Two vertical boundary lines enclose the field; a stray rectangle sits outside them.',
  'The three rectangles have closed into one solid unit on an amber baseline, with a filled terminus mark at its right.',
] as const;

function fragmentTransform(index: number, beat: number): string {
  const dropped = beat >= 1;
  const merged = beat >= SETTLED;
  const dx = merged ? 0 : SPACED[index] + (dropped ? 0 : SCATTER[index].x);
  const dy = dropped ? 0 : SCATTER[index].y;

  return `translate(${dx} ${dy})`;
}

function strayOpacity(beat: number): number {
  if (beat < 2) return 1;

  return STRAY_TREATMENT === 'constraint' ? 0.35 : 0;
}

export function BoundedField() {
  /*
   * Starts settled, which is what the server renders and what hydration must match. The
   * sequence is a rewind: the effect drops back to B0 with transitions suppressed, then
   * plays forward. A reader who never gets that far — no JavaScript, reduced motion —
   * keeps the finished composition, which is the whole point of it being the fallback.
   */
  const [beat, setBeat] = useState(SETTLED);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /*
     * Two frames, and the gap between them is load-bearing. The first rewinds to B0
     * while `playing` is still false, so no transitions are attached and the jump back
     * from the settled frame is instant rather than an animation played in reverse. The
     * second attaches them and starts the sequence forward.
     */
    let attach = 0;
    const rewind = requestAnimationFrame(() => {
      setBeat(0);
      attach = requestAnimationFrame(() => {
        setPlaying(true);
        timers.current = [1, 2, 3].map((next, index) =>
          setTimeout(() => setBeat(next), BEAT_MS * (index + 1)),
        );
      });
    });

    return () => {
      cancelAnimationFrame(rewind);
      cancelAnimationFrame(attach);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const dropped = beat >= 1;
  const merged = beat >= SETTLED;

  return (
    <figure className={styles.figure}>
      <div className={styles.stage}>
        <svg
          aria-label={ALT[beat]}
          className={`${styles.svg} ${playing ? styles.playing : ''}`.trim()}
          data-beat={beat}
          role="img"
          viewBox={`0 0 ${VIEW_WIDTH} 300`}
        >
          <line className={styles.bound} x1="80" x2="80" y1="48" y2="252" />
          <line className={styles.bound} x1="560" x2="560" y1="48" y2="252" />

          <rect
            className={styles.baseline}
            height="1.5"
            transform={`translate(100 0) scale(${dropped ? 1 : 0} 1) translate(-100 0)`}
            width="300"
            x="100"
            y="209"
          />

          <rect
            className={styles.stray}
            height="28"
            opacity={strayOpacity(beat)}
            width="48"
            x="576"
            y="176"
          />

          {FRAGMENT_X.map((x, index) => (
            <rect
              className={styles.fragment}
              height="40"
              key={x}
              transform={fragmentTransform(index, beat)}
              width="100"
              x={x}
              y="160"
            />
          ))}

          <rect
            className={styles.terminus}
            height="18"
            opacity={merged ? 1 : 0}
            transform={`translate(${merged ? 0 : -10} 0)`}
            width="18"
            x="412"
            y="192"
          />

          {TICK_X.map((x, index) => (
            <rect
              className={styles.tick}
              height="10"
              key={x}
              opacity={index <= beat ? 1 : 0.3}
              width="1.5"
              x={x}
              y="240"
            />
          ))}
        </svg>

        <div className={styles.stations}>
          {STATIONS.map((station, index) => (
            <span
              className={styles.station}
              data-reached={index <= beat}
              key={station}
              style={{ left: `${((FRAGMENT_X[0] + index * 100) / VIEW_WIDTH) * 100}%` }}
            >
              {station}
            </span>
          ))}
        </div>
      </div>

      <figcaption className={styles.caption}>
        <span className={styles.captionState}>{STAGE_LABEL[beat]}</span>
        <span className={styles.captionNote}>{STAGE_NOTE[beat]}</span>
      </figcaption>
    </figure>
  );
}
