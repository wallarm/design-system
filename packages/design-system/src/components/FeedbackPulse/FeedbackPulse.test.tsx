import { fireEvent, render, screen } from '@testing-library/react';
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

  it('moves the selection with arrow keys (roving radiogroup)', async () => {
    const user = userEvent.setup();
    render(<FeedbackPulse open onOpenChange={() => {}} onSubmit={() => {}} data-testid='fp' />);
    await user.click(screen.getByRole('radio', { name: '3' }));

    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(screen.getByRole('radio', { name: '4' })).toHaveAttribute('aria-checked', 'true');

    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(screen.getByRole('radio', { name: '3' })).toHaveAttribute('aria-checked', 'true');
  });

  it('sets roving tabindex — only the selected (or first) radio is tabbable', async () => {
    const user = userEvent.setup();
    render(<FeedbackPulse open onOpenChange={() => {}} onSubmit={() => {}} data-testid='fp' />);
    // Before any pick, first radio is the tab stop.
    expect(screen.getByRole('radio', { name: '1' })).toHaveAttribute('tabindex', '0');
    await user.click(screen.getByRole('radio', { name: '5' }));
    expect(screen.getByRole('radio', { name: '5' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: '1' })).toHaveAttribute('tabindex', '-1');
  });
});
