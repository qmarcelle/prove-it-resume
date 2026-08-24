import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EvidenceLink } from './EvidenceLink';

/**
 * The rendered half of the evidence-integrity rule: an unverified record must not
 * produce something an evaluator can click.
 */
describe('EvidenceLink', () => {
  it('renders a link when the record is verified and has a destination', () => {
    render(
      <EvidenceLink
        reference={{ href: 'https://example.com/spec', verified: true, title: 'Spec' }}
        cta="VIEW REPOSITORY"
      />,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com/spec');
    expect(link).toHaveTextContent('VIEW REPOSITORY');
    // Opening a new tab must be announced, not sprung on the reader.
    expect(link).toHaveAccessibleName(/opens in a new tab/i);
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('renders no link at all when the record is unverified', () => {
    render(<EvidenceLink reference={{ href: 'https://example.com', verified: false }} />);

    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText(/VERIFY BEFORE PUBLISHING/)).toBeVisible();
  });

  it('explains the gap to assistive technology rather than only visually', () => {
    render(
      <EvidenceLink reference={{ verified: false, title: 'Controlled experiment' }} />,
    );

    expect(
      screen.getByText(
        /no inspectable artifact has been supplied for Controlled experiment/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders no link when verified but the destination is missing', () => {
    render(<EvidenceLink reference={{ verified: true, title: 'Missing' }} />);
    expect(screen.queryByRole('link')).toBeNull();
  });
});
