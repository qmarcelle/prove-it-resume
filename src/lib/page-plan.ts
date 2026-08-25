import type { SurfaceSection, SurfaceStep } from './types';

/**
 * Stamping a page plan with its own sequence.
 *
 * The defect this exists to make unrepresentable: a surface where the rail counts one
 * way, the header nav counts another, and each section prints whatever number it
 * happened to be given somewhere else. On `/linear` all three disagreed — the proof
 * sections printed their durable `/` stage (Vreko `02`, Repository Intelligence `03`)
 * while the rail counted their position on this page (`06`, `05`), and the sections the
 * plan did not know about printed no number at all.
 *
 * The fix is to stop authoring the number. It is derived from position here, once, and
 * every consumer — the rail, the nav, the section header, the skip link — reads the
 * stamped list. A section cannot disagree with the plan because it is not told anything
 * the plan did not compute.
 */
export function numberSections(plan: readonly SurfaceSection[]): readonly SurfaceStep[] {
  return plan.map((section, index) => ({
    ...section,
    n: String(index + 1).padStart(2, '0'),
  }));
}

/**
 * The stamped steps, addressable by section id.
 *
 * Sections are composed by name rather than by index — `ApplicationSurface` renders
 * `ProductHistorySection` and then looks up the step it was planned as — so that adding
 * a section to the plan and forgetting to render it is a missing lookup rather than a
 * silently shifted number on some unrelated block.
 */
export function stepsById(
  steps: readonly SurfaceStep[],
): ReadonlyMap<string, SurfaceStep> {
  return new Map(steps.map((step) => [step.id, step]));
}

/**
 * The step a section was planned as, or a thrown error naming what is missing.
 *
 * Deliberately fatal rather than forgiving. A surface that renders a section the plan
 * does not list is exactly the state this module exists to prevent, and returning
 * `undefined` would let it render unnumbered — which is the bug, not the fallback.
 */
export function requireStep(
  steps: ReadonlyMap<string, SurfaceStep>,
  id: string,
): SurfaceStep {
  const step = steps.get(id);
  if (!step) {
    throw new Error(
      `Section "${id}" is rendered but absent from the page plan. Add it to the lens's ` +
        "pagePlan, or stop rendering it — the plan is the surface's only sequence.",
    );
  }
  return step;
}
