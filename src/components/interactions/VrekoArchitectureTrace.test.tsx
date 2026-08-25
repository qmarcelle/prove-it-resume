import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { vrekoArchitecture } from '@/content/experiments/vreko-architecture';
import { VrekoArchitectureTrace } from './VrekoArchitectureTrace';

/**
 * The behaviours worth pinning: the trace never moves without a user, expansion happens
 * in place rather than swapping diagrams, and the public/private boundary is stated on
 * every node rather than implied.
 */
describe('VrekoArchitectureTrace', () => {
  const renderTrace = () => render(<VrekoArchitectureTrace data={vrekoArchitecture} />);

  it('rests on a simple three-box overview', () => {
    renderTrace();

    expect(screen.getByText('AI coding assistant')).toBeVisible();
    expect(screen.getByText('Vreko')).toBeVisible();
    expect(screen.getByText('Your workspace')).toBeVisible();

    // No containers until the reader asks for them.
    expect(screen.queryByText('Hosted edge')).toBeNull();
    expect(screen.getByRole('button', { name: /Explore architecture/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('expands the same container in place rather than replacing the diagram', async () => {
    const user = userEvent.setup();
    renderTrace();

    await user.click(screen.getByRole('button', { name: /Explore architecture/ }));

    // The neighbours and the system's own identity survive the zoom — that is what
    // makes it zoom rather than navigation.
    expect(screen.getByText('AI coding assistant')).toBeVisible();
    expect(screen.getByText('Vreko')).toBeVisible();
    expect(screen.getByText('Your workspace')).toBeVisible();

    // And the interior is now present.
    expect(screen.getByText('Hosted edge')).toBeVisible();
    expect(screen.getByText('MCP protocol surface')).toBeVisible();
    expect(screen.getByText('Vreko platform')).toBeVisible();
  });

  it('discloses a container’s components one level deeper', async () => {
    const user = userEvent.setup();
    renderTrace();

    await user.click(screen.getByRole('button', { name: /Explore architecture/ }));
    expect(screen.queryByText('API key authentication')).toBeNull();

    const toggles = screen.getAllByRole('button', { name: /Show internals/ });
    await user.click(toggles[0]);

    expect(screen.getByText('API key authentication')).toBeVisible();
    expect(screen.getByText(/Terminates HTTPS/)).toBeVisible();
  });

  it('collapses back to the overview', async () => {
    const user = userEvent.setup();
    renderTrace();

    await user.click(screen.getByRole('button', { name: /Explore architecture/ }));
    await user.click(
      (await screen.findAllByRole('button', { name: /Show internals/ }))[0],
    );
    await user.click(screen.getByRole('button', { name: /^Collapse$/ }));

    expect(screen.queryByText('Hosted edge')).toBeNull();
    // Collapsing also drops the disclosed interiors, so reopening is not a surprise.
    expect(screen.queryByText('API key authentication')).toBeNull();
  });

  it('never advances the trace on its own', () => {
    renderTrace();

    expect(screen.getByRole('button', { name: /Trace a request/ })).toBeVisible();
    expect(screen.queryByRole('button', { name: /Next hop/ })).toBeNull();
    expect(screen.getByText(/Nothing advances on a timer/)).toBeVisible();
  });

  it('steps the trace forward and back only when asked', async () => {
    const user = userEvent.setup();
    renderTrace();

    await user.click(screen.getByRole('button', { name: /Trace a request/ }));
    expect(screen.getByText('Assistant issues a tool call')).toBeVisible();
    expect(screen.getByRole('button', { name: /Previous hop/ })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /Next hop/ }));
    expect(screen.getByText('Crosses into the hosted edge')).toBeVisible();
    // Twice: once in the visible hop detail, once in the status region that announces
    // the crossing to a screen reader. Both are required.
    expect(screen.getAllByText(/HTTPS · authentication/)).toHaveLength(2);
    expect(screen.getByRole('status')).toHaveTextContent('Hop 2 of 5');

    await user.click(screen.getByRole('button', { name: /Previous hop/ }));
    expect(screen.getByText('Assistant issues a tool call')).toBeVisible();
  });

  it('expands the architecture when a trace starts, so the hop has somewhere to land', async () => {
    const user = userEvent.setup();
    renderTrace();

    await user.click(screen.getByRole('button', { name: /Trace a request/ }));
    expect(screen.getByText('Hosted edge')).toBeVisible();
  });

  it('resets the trace', async () => {
    const user = userEvent.setup();
    renderTrace();

    await user.click(screen.getByRole('button', { name: /Trace a request/ }));
    await user.click(screen.getByRole('button', { name: /Reset trace/ }));

    expect(screen.getByRole('button', { name: /Trace a request/ })).toBeVisible();
    expect(screen.queryByText('Assistant issues a tool call')).toBeNull();
  });

  it('states publication state on every container rather than implying it', async () => {
    const user = userEvent.setup();
    renderTrace();

    await user.click(screen.getByRole('button', { name: /Explore architecture/ }));

    expect(screen.getAllByText('PUBLIC').length).toBeGreaterThan(0);
    expect(screen.getAllByText('NOT PUBLISHED').length).toBeGreaterThan(0);
  });

  it('publishes the command that re-derives the public boundary', () => {
    renderTrace();

    expect(screen.getByText(/npm view @vreko\/intelligence version/)).toBeVisible();
    expect(screen.getByText('@vreko/intelligence')).toBeVisible();
    expect(screen.getByText('vreko-mcp-server')).toBeVisible();
  });

  it('records the contradictions in the public material instead of resolving them', () => {
    renderTrace();

    expect(
      screen.getByText(/The edge is described two ways in the same repository./),
    ).toBeVisible();
    expect(screen.getByText(/no reconciliation is invented here/)).toBeVisible();
    expect(
      screen.getByText(/No implementation source is published in any of the three/),
    ).toBeVisible();
  });

  it('uses no ARIA tree semantics', () => {
    const { container } = renderTrace();
    expect(container.querySelector('[role="tree"]')).toBeNull();
    expect(container.querySelector('[role="treeitem"]')).toBeNull();
  });

  it('never renders internal level identifiers', async () => {
    const user = userEvent.setup();
    const { container } = renderTrace();

    await user.click(screen.getByRole('button', { name: /Explore architecture/ }));
    const toggles = screen.getAllByRole('button', { name: /Show internals/ });
    for (const toggle of toggles) await user.click(toggle);

    expect(container.textContent).not.toMatch(/\bL[012]\b/);
    expect(container.textContent).not.toMatch(/\bHOP [1-5]\b/);
  });
});
