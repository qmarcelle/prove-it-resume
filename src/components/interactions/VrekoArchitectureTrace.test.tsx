import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { vrekoArchitecture } from '@/content/experiments/vreko-architecture';
import { VrekoArchitectureTrace } from './VrekoArchitectureTrace';

/**
 * The behaviours worth pinning after the containment redesign.
 *
 * The diagram no longer expands and no longer steps a trace, so the old contract — zoom
 * in, walk hop by hop — is gone. What replaced it has to keep the same guarantees:
 * nothing moves without a user, the publication state of every layer is stated rather
 * than left to the stroke, and the panel tells you what a crossing withholds.
 */
describe('VrekoArchitectureTrace', () => {
  const renderTrace = () => render(<VrekoArchitectureTrace data={vrekoArchitecture} />);

  const panel = () => screen.getByRole('complementary');

  it('draws every layer at rest, inside and outside the boundary', () => {
    renderTrace();

    // Asserted as controls, not as text: the selected layer's name also appears as the
    // panel heading, and the point here is that all six are reachable in the diagram.
    for (const name of [
      'AI coding assistant',
      'Hosted edge',
      'Local edge',
      'MCP protocol surface',
      'Vreko platform',
      'Your workspace',
    ]) {
      expect(screen.getByRole('button', { name: new RegExp(name) })).toBeVisible();
    }
  });

  it('opens on a selected layer, so the panel is never empty', () => {
    renderTrace();

    expect(within(panel()).getByRole('heading', { name: 'Hosted edge' })).toBeVisible();
    expect(screen.getByRole('button', { name: /Hosted edge/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('moves the panel to whichever layer is chosen', async () => {
    const user = userEvent.setup();
    renderTrace();

    await user.click(screen.getByRole('button', { name: /Vreko platform/ }));

    expect(
      within(panel()).getByRole('heading', { name: 'Vreko platform' }),
    ).toBeVisible();
    expect(within(panel()).getByText(/Publication boundary/)).toBeVisible();
  });

  it('states what a crossing withholds rather than only what it carries', async () => {
    const user = userEvent.setup();
    renderTrace();

    await user.click(screen.getByRole('button', { name: /Vreko platform/ }));

    expect(within(panel()).getByText('WITHHELD')).toBeVisible();
    expect(
      within(panel()).getByText(/No implementation of this layer is published/),
    ).toBeVisible();
  });

  /*
   * The local edge is a second entry point, not a further boundary inward, so the
   * content records no crossing for it. The panel must then omit the crossing fields
   * rather than invent one — this is the case that would tempt a future edit to fill
   * the gap with plausible text.
   */
  it('omits the crossing fields for a layer with no recorded hop', async () => {
    const user = userEvent.setup();
    renderTrace();

    await user.click(screen.getByRole('button', { name: /Local edge/ }));

    expect(within(panel()).getByRole('heading', { name: 'Local edge' })).toBeVisible();
    expect(within(panel()).queryByText('BOUNDARY CROSSED')).toBeNull();
    expect(within(panel()).queryByText('CARRIES')).toBeNull();
  });

  it('discloses a layer’s components only while it is selected', async () => {
    const user = userEvent.setup();
    renderTrace();

    expect(screen.getByText(/API key authentication/)).toBeVisible();

    await user.click(screen.getByRole('button', { name: /Local edge/ }));

    expect(screen.queryByText(/API key authentication/)).toBeNull();
    expect(screen.getByText(/vrekod daemon/)).toBeVisible();
  });

  it('states publication state on every layer rather than implying it', () => {
    renderTrace();

    expect(screen.getAllByText(/PUBLISHED/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/DECLARED, NOT PUBLISHED/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/OUTSIDE/).length).toBeGreaterThan(0);
  });

  it('publishes the command that re-derives the public boundary', () => {
    renderTrace();

    expect(
      within(panel()).getByText(/npm view @vreko\/intelligence version/),
    ).toBeVisible();
  });

  it('never advances on its own', () => {
    renderTrace();

    expect(screen.queryByRole('button', { name: /Next hop/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Trace a request/ })).toBeNull();
  });

  it('uses no ARIA tree semantics', () => {
    const { container } = renderTrace();
    expect(container.querySelector('[role="tree"]')).toBeNull();
    expect(container.querySelector('[role="treeitem"]')).toBeNull();
  });

  it('never renders internal level or hop identifiers', () => {
    const { container } = renderTrace();

    expect(container.textContent).not.toMatch(/\bL[012]\b/);
    expect(container.textContent).not.toMatch(/\bHOP [1-5]\b/);
    expect(container.textContent).not.toMatch(/hop-[a-z]+/);
  });
});
