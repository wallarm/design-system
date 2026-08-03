import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProviderIcon } from './ProviderIcon';

describe('ProviderIcon', () => {
  it('renders the requested provider with data-slot="provider-icon"', () => {
    render(<ProviderIcon name='slack' data-testid='slack-provider' />);
    expect(screen.getByTestId('slack-provider')).toHaveAttribute('data-slot', 'provider-icon');
  });

  it('is hidden from assistive tech by default (decorative)', () => {
    render(<ProviderIcon name='slack' data-testid='slack-provider' />);
    expect(screen.getByTestId('slack-provider')).toHaveAttribute('aria-hidden', 'true');
  });
});
