import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
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

  it('reveals the comment field and Send after a score is picked', async () => {
    const user = userEvent.setup();
    render(<FeedbackPulse open onOpenChange={() => {}} onSubmit={() => {}} data-testid='fp' />);

    await user.click(screen.getByRole('radio', { name: '4' }));

    expect(screen.getByRole('radio', { name: '4' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByPlaceholderText('Tell us why? (optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('hides the comment field when showComment is false', async () => {
    const user = userEvent.setup();
    render(<FeedbackPulse open showComment={false} onOpenChange={() => {}} onSubmit={() => {}} data-testid='fp' />);
    await user.click(screen.getByRole('radio', { name: '2' }));
    expect(screen.queryByPlaceholderText('Tell us why? (optional)')).toBeNull();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });
});
