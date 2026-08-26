import type { ArmFrame } from '@/lib/interactions';
import styles from './BoundAxis.module.css';

/**
 * Two arms of a comparison drawn against one scale, with the threshold drawn on it.
 *
 * The measurement grammar for Interlock. The load-bearing decision is that the bound is
 * a *single element* spanning the full height of the axis rather than a line repeated
 * per arm: the whole claim is that both arms are measured against the same constraint,
 * and two lines a reader has to trust are aligned is exactly the thing a reader should
 * not have to trust.
 *
 * Everything shown is stated by the artifact, not computed here. Totals in particular
 * are read from the frame rather than summed from the segments: if the two ever
 * disagree, that is a finding about the evidence and it should surface as a visibly
 * wrong bar, not be smoothed over by a component that recomputes what it draws.
 *
 * Segment values carry their labels inside the bar where they fit, and the same values
 * are repeated in the accessible description, so the bar is never the only copy.
 */
export function BoundAxis({
  arms,
  bound,
  boundLabel,
  scaleMax,
}: {
  arms: readonly { id: string; label: string; frame: ArmFrame }[];
  bound: number;
  /** The invariant the bound expresses, in the artifact's own notation. */
  boundLabel: string;
  scaleMax: number;
}) {
  return (
    <div className={styles.axis}>
      <div className={styles.head}>
        <span className={styles.boundName}>
          BOUND {bound} · {boundLabel}
        </span>
      </div>

      <div className={styles.track}>
        <div
          className={styles.marker}
          style={{ left: `${(bound / scaleMax) * 100}%` }}
          aria-hidden="true"
        />

        {arms.map((arm) => (
          <Arm arm={arm} bound={bound} key={arm.id} scaleMax={scaleMax} />
        ))}
      </div>

      <div className={styles.scale} aria-hidden="true">
        <span>0</span>
        <span>{scaleMax}</span>
      </div>
    </div>
  );
}

function Arm({
  arm,
  bound,
  scaleMax,
}: {
  arm: { id: string; label: string; frame: ArmFrame };
  bound: number;
  scaleMax: number;
}) {
  const { frame, label } = arm;

  const description =
    `${label}: ${frame.segments
      .map((s) => `${s.label} ${s.value}${s.pending ? ' pending' : ''}`)
      .join(', ')}. ` +
    `Joint total ${frame.total} against a bound of ${bound}.` +
    (frame.verdict ? ` ${frame.verdict}.` : '');

  return (
    <div className={styles.arm}>
      <div className={styles.armHead}>
        <span className={styles.armLabel}>{label}</span>
        <span className={styles.armTotal}>TOTAL {frame.total}</span>

        {frame.decision ? (
          <span className={styles.decision}>
            {frame.decision}
            {frame.decisionReason ? ` · ${frame.decisionReason}` : ''}
          </span>
        ) : null}

        {frame.verdict ? (
          <span className={frame.holds ? styles.verdictHolds : styles.verdictBreached}>
            {/*
             * The glyph is decorative: the verdict word beside it already says which
             * way this went, and a screen reader should not read out "tick".
             */}
            <span aria-hidden="true">{frame.holds ? '✓' : '✕'}</span> {frame.verdict}
          </span>
        ) : null}
      </div>

      <div aria-label={description} className={styles.bar} role="img">
        {frame.segments.map((segment) => (
          <span
            className={segment.pending ? styles.segmentPending : styles.segment}
            key={segment.id}
            style={{ width: `${(segment.value / scaleMax) * 100}%` }}
          >
            {/*
             * Name and value together. The value is the whole point of the segment:
             * a bar labelled only "alpha" makes the reader measure it off the axis by
             * eye, which is exactly the estimation this section exists to remove.
             */}
            <span className={styles.segmentLabel}>
              {segment.label} {segment.value}
              {segment.pending ? ' pending' : ''}
            </span>
          </span>
        ))}
      </div>

      {/*
       * The same values, out from under the bar.
       *
       * A segment worth 20 against a scale of 160 is an eighth of the axis, and an
       * eighth of a phone is not eight characters of mono. Left inside, `gamma 20`
       * rendered as `gamm`: the reader lost the number the whole comparison turns on,
       * and lost it silently, because the bar clips rather than overflows.
       *
       * So below the width where every label fits, the labels come out and the bar goes
       * back to being pure proportion. Both are `aria-hidden`: the bar is one `role=img`
       * carrying every name and value in its description, so this is the same fact drawn
       * a second way rather than a second announcement of it.
       */}
      <ul aria-hidden="true" className={styles.legend}>
        {frame.segments.map((segment) => (
          <li className={styles.legendItem} key={segment.id}>
            <span className={segment.pending ? styles.swatchPending : styles.swatch} />
            {segment.label} {segment.value}
            {segment.pending ? ' pending' : ''}
          </li>
        ))}
      </ul>

      <p className={styles.note}>{frame.note}</p>
    </div>
  );
}
