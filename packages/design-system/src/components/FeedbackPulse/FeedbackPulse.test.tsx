import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FeedbackPulse } from './FeedbackPulse';

const noop = () => {};

describe('FeedbackPulse', () => {
  it('renders nothing when closed', () => {
    render(<FeedbackPulse open={false} onOpenChange={noop} onSubmit={noop} data-testid='fp' />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders the Rating phase when open', () => {
    render(<FeedbackPulse open onOpenChange={noop} onSubmit={noop} data-testid='fp' />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('How easy was it to use this feature?')).toBeInTheDocument();
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.getByText('Very difficult')).toBeInTheDocument();
    expect(screen.getByText('Very easy')).toBeInTheDocument();
    // Comment + Send are NOT shown until a score is picked
    expect(screen.queryByRole('button', { name: 'Send' })).toBeNull();
  });
});
