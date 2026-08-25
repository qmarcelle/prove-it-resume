import { describe, expect, it } from 'vitest';
import { ICON_GEOMETRY, type IconName } from './paths';
import { AFFORDANCE_ICON, type Affordance } from './semantics';

const affordances = Object.keys(AFFORDANCE_ICON) as Affordance[];
const icons = Object.values(AFFORDANCE_ICON);

describe('the affordance map', () => {
  /*
   * The rule this file exists to enforce: one meaning, one icon.
   *
   * Semantic discipline is what separates an interface that was designed from one that
   * was decorated, and it is exactly the kind of rule that decays quietly — someone
   * reuses `external-link` for "visit a profile" because it is already imported, and a
   * year later the mark predicts nothing. Stated as a convention it survives about as
   * long as reviewer attention does. Stated here it fails the suite.
   */
  it('never lets one icon carry two meanings', () => {
    const duplicates = icons.filter((icon, i) => icons.indexOf(icon) !== i);

    expect(duplicates).toEqual([]);
  });

  it('has a shape for every affordance', () => {
    const missing = affordances.filter((a) => !AFFORDANCE_ICON[a]);

    expect(missing).toEqual([]);
  });

  /*
   * A vendored set has no upstream to fall back on, so an affordance pointing at a
   * shape nobody copied across is a blank space on the page rather than a build error.
   */
  it('only names shapes that were actually vendored', () => {
    const available = new Set(Object.keys(ICON_GEOMETRY) as IconName[]);
    const dangling = icons.filter((icon) => !available.has(icon));

    expect(dangling).toEqual([]);
  });

  /*
   * Not a tidiness check. Every vendored shape costs bytes in every document that
   * renders it, and a shape no affordance points at is a shape being carried for a use
   * that was abandoned — the icon-set equivalent of dead code.
   */
  it('vendors no shape that no affordance uses', () => {
    const used = new Set(icons);
    const unused = (Object.keys(ICON_GEOMETRY) as IconName[]).filter((n) => !used.has(n));

    expect(unused).toEqual([]);
  });
});
