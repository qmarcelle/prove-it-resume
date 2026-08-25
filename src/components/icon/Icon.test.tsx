import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ActionIcon, Icon, hairlineStrokeWidth } from './Icon';
import { ICON_GEOMETRY, type IconName } from './paths';

const SIZES = [12, 14, 16] as const;
const NAMES = Object.keys(ICON_GEOMETRY) as IconName[];

function draw(ui: React.ReactElement): SVGSVGElement {
  const { container } = render(ui);
  const svg = container.querySelector('svg');
  if (!svg) throw new Error('no svg rendered');
  return svg as SVGSVGElement;
}

describe('Icon', () => {
  it('is decorative, and cannot be reached by the keyboard', () => {
    const svg = draw(<Icon name="external-link" />);

    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
  });

  /*
   * The layout contract. `docs/performance.md` records CLS 0.0000 and the rule behind
   * it — "decorative content cannot shift layout" — which holds only while the box is
   * declared on the element rather than applied by a stylesheet that resolves later.
   */
  it.each(SIZES)('reserves its box on the element at %ipx', (size) => {
    const svg = draw(<Icon name="check" size={size} />);

    expect(svg).toHaveAttribute('width', String(size));
    expect(svg).toHaveAttribute('height', String(size));
  });

  /*
   * The weight contract. Every rule on this page is 1px; an icon drawn at any other
   * weight introduces a second one. Because the view box is 24 units and the rendered
   * box is `size` pixels, a stroke renders at exactly one pixel when its width in units
   * times the scale factor equals one — which is what this asserts, at every size.
   */
  it.each(SIZES)('draws a one-pixel stroke at %ipx', (size) => {
    const svg = draw(<Icon name="arrow-right" size={size} />);
    const width = Number(svg.getAttribute('stroke-width'));

    expect(width).toBe(hairlineStrokeWidth(size));
    expect(width * (size / 24)).toBeCloseTo(1, 10);
  });

  it('inherits its colour rather than naming one', () => {
    const svg = draw(<Icon name="mail" />);

    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveAttribute('fill', 'none');
  });

  /*
   * The house adaptation. Lucide ships round caps and round joins; this page has no
   * circles in it and every rule on it terminates flat, so the geometry is upstream's
   * and the rendering is not.
   */
  it('terminates flat, like every other rule on the page', () => {
    const svg = draw(<Icon name="x" />);

    expect(svg).toHaveAttribute('stroke-linecap', 'square');
    expect(svg).toHaveAttribute('stroke-linejoin', 'miter');
  });

  it.each(NAMES)('draws geometry for %s', (name) => {
    const svg = draw(<Icon name={name} />);

    expect(
      svg.querySelectorAll('path, rect, line, circle, polyline').length,
    ).toBeGreaterThan(0);
  });

  it('draws every path on the 24-unit grid the vendored geometry assumes', () => {
    const svg = draw(<Icon name="file-text" size={16} />);

    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });
});

describe('ActionIcon', () => {
  it('draws the shape its affordance maps to', () => {
    const byMeaning = draw(<ActionIcon affordance="inspect-artifact" />);
    const byName = draw(<Icon name="external-link" />);

    expect(byMeaning.innerHTML).toBe(byName.innerHTML);
  });
});
