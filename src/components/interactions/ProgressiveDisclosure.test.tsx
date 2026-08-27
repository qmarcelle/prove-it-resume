import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ProgressiveDisclosure } from './ProgressiveDisclosure';
import { buildViewUrl } from './deep-link';

/**
 * The one disclosure grammar's behavioural contract.
 *
 * Five sections share this component, so a regression here is a regression in all five
 * at once, and most of what it promises is invisible in a screenshot: that the default
 * state is readable with the component inert, that a keyboard reaches both paths and
 * lands somewhere sensible, that closing returns the reader where they were, and that a
 * shared address reproduces a view without stealing focus from someone who followed it.
 *
 * The reduced-motion promise is asserted structurally rather than by querying a media
 * query: this component has no transition and no animation, so what has to stay true is
 * that state is legible from the DOM (`aria-expanded`, and the panel's presence) rather
 * than from having watched something move.
 */
const PATHS = [
  {
    id: 'built',
    invitation: 'What did I actually build?',
    label: 'WHAT WAS BUILT',
    content: <p>The register of what was built.</p>,
  },
  {
    id: 'leadership',
    invitation: 'What changed as I moved from builder to lead?',
    label: 'FROM BUILDER TO LEAD',
    content: <p>The leadership lesson.</p>,
  },
];

function renderDisclosure() {
  return render(<ProgressiveDisclosure queryKey="history" paths={PATHS} />);
}

/** Puts the page at an address, the way a reader arriving through a shared link is. */
function arriveAt(search: string) {
  window.history.replaceState(null, '', `/linear${search}`);
}

afterEach(() => arriveAt(''));

describe('ProgressiveDisclosure', () => {
  it('shows both questions and no answers until one is asked', () => {
    renderDisclosure();

    expect(
      screen.getByRole('button', { name: /What did I actually build/ }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: /builder to lead/ })).toBeVisible();

    // The deep material is absent from the document rather than merely hidden, so the
    // orientation layer is what a reader pays for and nothing more.
    expect(screen.queryByText('The register of what was built.')).toBeNull();
    expect(screen.queryByRole('group')).toBeNull();
  });

  it('states which invitation is open without relying on motion', async () => {
    renderDisclosure();
    const invitation = screen.getByRole('button', { name: /What did I actually build/ });

    expect(invitation).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(invitation);
    expect(invitation).toHaveAttribute('aria-expanded', 'true');

    // And the panel it controls is named, so a screen reader announces what opened
    // rather than "group".
    const panel = screen.getByRole('group', { name: 'WHAT WAS BUILT' });
    expect(invitation).toHaveAttribute('aria-controls', panel.id);
  });

  it('opens from the keyboard and moves focus to what was asked for', async () => {
    renderDisclosure();

    await userEvent.tab();
    expect(
      screen.getByRole('button', { name: /What did I actually build/ }),
    ).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    const panel = screen.getByRole('group');
    expect(within(panel).getByText('The register of what was built.')).toBeVisible();

    // Focus follows the reader into the answer. Leaving it on the invitation would make
    // a keyboard reader tab through the whole panel to reach what they just opened.
    expect(panel).toHaveFocus();
  });

  it('returns focus to the invitation that opened it', async () => {
    renderDisclosure();
    const invitation = screen.getByRole('button', { name: /What did I actually build/ });

    await userEvent.click(invitation);
    await userEvent.click(screen.getByRole('button', { name: /Close and return/ }));

    expect(screen.queryByRole('group')).toBeNull();
    // The reader is back exactly where they left, which is what makes returning to the
    // orientation layer free rather than a scroll hunt.
    expect(invitation).toHaveFocus();
  });

  it('opens one path at a time within a section', async () => {
    renderDisclosure();

    await userEvent.click(
      screen.getByRole('button', { name: /What did I actually build/ }),
    );
    await userEvent.click(screen.getByRole('button', { name: /builder to lead/ }));

    expect(screen.getAllByRole('group')).toHaveLength(1);
    expect(screen.getByRole('group', { name: 'FROM BUILDER TO LEAD' })).toBeVisible();
  });

  it('honours a deep link without stealing focus from the reader', () => {
    arriveAt('?history=leadership');
    renderDisclosure();

    expect(screen.getByRole('group', { name: 'FROM BUILDER TO LEAD' })).toBeVisible();
    expect(screen.getByText('The leadership lesson.')).toBeVisible();

    /*
     * Nothing is focused. A reader who followed a shared link is already looking at the
     * reason they are here, and moving the caret on load would drop a screen reader
     * past the heading that says what page this is.
     */
    expect(document.body).toHaveFocus();
  });

  it('ignores a value the section cannot render', () => {
    arriveAt('?history=not-a-path');
    renderDisclosure();

    // A stale or hand-edited address degrades to the orientation layer rather than to
    // an empty panel.
    expect(screen.queryByRole('group')).toBeNull();
  });

  it('makes an opened view shareable without writing to the address while browsing', async () => {
    renderDisclosure();
    await userEvent.click(screen.getByRole('button', { name: /builder to lead/ }));

    // Browsing leaves the address alone: this page's rule is that only an explicit act
    // produces a link.
    expect(window.location.search).toBe('');

    // But the state is still representable on demand, which is what `COPY THIS VIEW`
    // builds from.
    expect(buildViewUrl('product-history')).toContain('history=leadership');
  });

  it('opens the path holding whichever nested interaction the address names', () => {
    /*
     * `?interlock=evidence` was a shareable address before the coordination proof sat
     * behind a question, and somebody may already have pasted it into a thread. It must
     * still land on the panel it names rather than on an orientation layer that has
     * quietly dropped the state.
     */
    arriveAt('?interlock=evidence');
    render(
      <ProgressiveDisclosure
        queryKey="coordination"
        paths={[{ ...PATHS[0], revealedBy: ['interlock'] }, PATHS[1]]}
      />,
    );

    expect(screen.getByRole('group', { name: 'WHAT WAS BUILT' })).toBeVisible();
    // And the nested parameter is left alone for the control that actually owns it.
    expect(window.location.search).toBe('?interlock=evidence');
  });

  it('lets the section its own key names win over a nested one', () => {
    arriveAt('?coordination=leadership&interlock=evidence');
    render(
      <ProgressiveDisclosure
        queryKey="coordination"
        paths={[{ ...PATHS[0], revealedBy: ['interlock'] }, PATHS[1]]}
      />,
    );

    expect(screen.getByRole('group', { name: 'FROM BUILDER TO LEAD' })).toBeVisible();
  });

  it('follows browser navigation back to the address the reader came from', async () => {
    arriveAt('?history=leadership');
    renderDisclosure();
    expect(screen.getByRole('group', { name: 'FROM BUILDER TO LEAD' })).toBeVisible();

    // Stepping off a deep-linked state strips the claim the URL is no longer making.
    await userEvent.click(screen.getByRole('button', { name: /Close and return/ }));
    expect(window.location.search).toBe('');

    // And going back re-applies whatever the restored address says.
    arriveAt('?history=built');
    act(() => window.dispatchEvent(new PopStateEvent('popstate')));
    expect(screen.getByRole('group', { name: 'WHAT WAS BUILT' })).toBeVisible();
  });
});
