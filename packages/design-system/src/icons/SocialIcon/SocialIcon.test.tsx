import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SocialIcon } from './SocialIcon';

describe('SocialIcon', () => {
  it('renders the requested brand with data-slot="social-icon"', () => {
    render(<SocialIcon name='slack' data-testid='slack-icon' />);
    const icon = screen.getByTestId('slack-icon');
    expect(icon).toHaveAttribute('data-slot', 'social-icon');
  });

  it('renders the neutral tone when requested', () => {
    render(<SocialIcon name='github' tone='neutral' data-testid='github-icon' />);
    expect(screen.getByTestId('github-icon')).toBeInTheDocument();
  });

  it('is hidden from assistive tech by default (decorative)', () => {
    render(<SocialIcon name='slack' data-testid='slack-icon' />);
    expect(screen.getByTestId('slack-icon')).toHaveAttribute('aria-hidden', 'true');
  });
});
