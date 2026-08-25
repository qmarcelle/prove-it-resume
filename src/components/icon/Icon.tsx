import type { IconName } from './paths';
import { ICON_GEOMETRY } from './paths';
import type { Affordance } from './semantics';
import { AFFORDANCE_ICON } from './semantics';
import styles from './Icon.module.css';

/** The grid every vendored path is drawn on. */
const VIEW_BOX = 24;

/**
 * The three sizes this site draws at. Not a number, so a call site cannot invent a
 * fourth: an icon set with arbitrary sizes is a set that will drift out of alignment
 * with the type it sits beside.
 *
 * 12 for the mono metadata face (11.5–12.5px), 14 for buttons and call-to-action
 * labels, 16 for the rare section-level mark.
 */
export type IconSize = 12 | 14 | 16;

/**
 * Where the icon sits relative to the words it belongs to.
 *
 * The gap between a label and its mark is a single number for the whole site, and it
 * lives here rather than in each caller's stylesheet, because thirty call sites each
 * nudging their own margin is how an icon set stops looking like one set. It is
 * expressed in `em` so it tracks whatever type size it was dropped into.
 *
 * `alone` is for the icon-only control, where there is no label to space against.
 */
export type IconPlacement = 'trailing' | 'leading' | 'alone';

/**
 * The stroke width, in view-box units, that renders as exactly one pixel.
 *
 * The whole page is built out of 1px rules — `--rule`, `--rule-quiet`, the 1px borders
 * on every panel — and a stroke that lands anywhere else reads as a second, competing
 * weight. Because the view box is 24 units wide and the rendered box is `size` pixels,
 * the scale factor is `size / 24`, so `24 / size` units always draw one pixel. That is
 * why the number changes with the size: keeping `strokeWidth` constant is what makes
 * most icon sets look heavier as they get smaller.
 */
export function hairlineStrokeWidth(size: IconSize): number {
  return VIEW_BOX / size;
}

/**
 * A single icon.
 *
 * Always decorative. There is no `label` prop and no way to make one of these carry
 * meaning on its own, because the rule on this page is that a mark never replaces a
 * word — status, actions, and evidence all keep their spelled-out text and the icon
 * adds a second channel beside it. The one icon-only control on the site
 * (`GuidedProofNav`'s exit button) names itself with `aria-label` on the button, not on
 * the glyph.
 *
 * `currentColor` rather than a colour token, so an icon inside a dark panel inverts
 * with the text around it and no icon needs to know which surface it landed on.
 *
 * Explicit `width` and `height` attributes rather than CSS sizing: the box exists
 * before any stylesheet resolves, which is what keeps this out of the CLS budget.
 */
export function Icon({
  name,
  size = 14,
  placement = 'trailing',
  className,
}: {
  name: IconName;
  size?: IconSize;
  placement?: IconPlacement;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={[styles.icon, styles[placement], className].filter(Boolean).join(' ')}
      fill="none"
      focusable="false"
      height={size}
      stroke="currentColor"
      strokeLinecap="square"
      strokeLinejoin="miter"
      strokeWidth={hairlineStrokeWidth(size)}
      viewBox={`0 0 ${VIEW_BOX} ${VIEW_BOX}`}
      width={size}
    >
      {ICON_GEOMETRY[name]}
    </svg>
  );
}

export type { Affordance, IconName };

/**
 * An icon chosen by what it promises rather than by what it looks like.
 *
 * This is the entry point call sites should use. Reaching for `Icon` directly and
 * naming a shape is possible, but it routes around the one-meaning-one-icon guarantee,
 * so it is reserved for the concept marks that have no affordance behind them.
 */
export function ActionIcon({
  affordance,
  size,
  placement,
  className,
}: {
  affordance: Affordance;
  size?: IconSize;
  placement?: IconPlacement;
  className?: string;
}) {
  return (
    <Icon
      className={className}
      name={AFFORDANCE_ICON[affordance]}
      placement={placement}
      size={size}
    />
  );
}
