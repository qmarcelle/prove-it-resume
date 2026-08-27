import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { vrekoArchitecture } from '@/content/experiments/vreko-architecture';
import { VrekoArchitectureTrace } from './VrekoArchitectureTrace';

/**
 * The behaviours worth pinning after the containment redesign.
 *
 * The diagram no longer expands and no longer steps a trace, so the old contract: zoom
 * in, walk hop by hop: is gone. What replaced it has to keep the same guarantees:
 * nothing moves without a user, the publication state of every layer is stated rather
 * than left to the stroke, and the panel tells you what a crossing withholds.
 */
/**
 * The CDN-hardening property.
 *
 * A proxy in front of this site rewrote `vreko-mcp-server@3.1.1` into an obfuscated
 * email placeholder, because that is the shape of an address. Hydration then failed with
 * a text mismatch on every page rendering this figure and React rebuilt the tree, which
 * reads as the page flashing.
 *
 * Nothing in a build can observe that: the corruption happens between the CDN and the
 * reader. What a test *can* hold is the property that makes the rewrite impossible in
 * the first place, which is that no single text node contains `name@version`.
 *
 * Both halves matter and they pull against each other. Split too little and the pattern
 * comes back; split in a way that changes the rendered string and the figure now lies
 * about which package it names. So the reader-visible text is asserted intact alongside
 * the split.
 */
describe('package identifiers survive a CDN that scans for email addresses', () => {
  /*
   * The shape an obfuscator actually acts on: local part, `@`, then a dotted suffix.
   *
   * The dot is the load-bearing half and was worth measuring rather than guessing. The
   * same figure renders repository pins like `interlock@75253e38791e`, which are the
   * same shape minus the dot, and production leaves all twelve of them untouched while
   * rewriting every `name@1.2.3`. Matching the looser pattern here would fail this test
   * on strings no CDN has ever mangled, which is how a guard starts getting deleted.
   */
  const EMAIL_SHAPED = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z0-9.-]+/;

  function textNodes(root: HTMLElement): string[] {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const out: string[] = [];
    let node = walker.nextNode();
    while (node) {
      const value = node.nodeValue?.trim();
      if (value) out.push(value);
      node = walker.nextNode();
    }
    return out;
  }

  it('never renders a package name and version in one text node', () => {
    const { container } = render(<VrekoArchitectureTrace data={vrekoArchitecture} />);

    const offenders = textNodes(container).filter((text) => EMAIL_SHAPED.test(text));
    expect(
      offenders,
      'a text node reads as an email address and will be rewritten in transit',
    ).toEqual([]);
  });

  it('still reads as the identifier it names', () => {
    // The split is invisible: `textContent` is what a reader sees and copies, and it has
    // to be the real package specifier, `@` included.
    render(<VrekoArchitectureTrace data={vrekoArchitecture} />);

    const system = vrekoArchitecture.system;
    expect(system.identifier).toMatch(EMAIL_SHAPED);
    expect(document.body.textContent).toContain(system.identifier);
  });
});

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
   * rather than invent one; this is the case that would tempt a future edit to fill
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
