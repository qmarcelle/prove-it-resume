import { CONCEPT_GEOMETRY, CONCEPT_LABEL, type ConceptName } from './marks';
import styles from './ConceptMark.module.css';

/** The export's mark grid. Every crop is drawn in these units. */
const VIEW = { width: 64, height: 40 };

/**
 * Two renderings of the same grid. `sm` sits inline against 11.5px mono metadata, which
 * is where most of these land; `md` is for a mark that has a block to itself. Both keep
 * the 8:5 ratio of the composition they were cut from; a mark that stretched would stop
 * being a crop.
 */
const SIZE = { sm: 24, md: 32 } as const;

export type ConceptMarkSize = keyof typeof SIZE;

/**
 * A concept mark: a still crop of the hero composition, placed beside the claim it names.
 *
 * Decorative, like every other mark on this page. The words beside it carry the meaning:
 * "change is never colour alone" generalises to marks, and a boundary that announced
 * itself only by a drawing would be a boundary a screen-reader user never learns about.
 */
export function ConceptMark({
  name,
  size = 'sm',
  className,
}: {
  name: ConceptName;
  size?: ConceptMarkSize;
  className?: string;
}) {
  const width = SIZE[size];

  return (
    <svg
      aria-hidden="true"
      className={[styles.mark, className].filter(Boolean).join(' ')}
      focusable="false"
      height={(width * VIEW.height) / VIEW.width}
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      width={width}
    >
      {CONCEPT_GEOMETRY[name]}
    </svg>
  );
}

export { CONCEPT_LABEL, type ConceptName };
