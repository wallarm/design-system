import { act } from 'react';
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
    render(
      <FeedbackPulse
        open
        showComment={false}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        data-testid='fp'
      />,
    );
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

  it('submits with score + comment and shows the confirmation', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<FeedbackPulse open onOpenChange={() => {}} onSubmit={onSubmit} data-testid='fp' />);

    await user.click(screen.getByRole('radio', { name: '5' }));
    await user.type(screen.getByPlaceholderText('Tell us why? (optional)'), 'Loved it');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(onSubmit).toHaveBeenCalledWith({ score: 5, comment: 'Loved it' });
    expect(screen.getByText('Thanks a lot! — Wallarm Team')).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).toBeNull();
  });

  it('submits with an undefined comment when left blank', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<FeedbackPulse open onOpenChange={() => {}} onSubmit={onSubmit} data-testid='fp' />);
    await user.click(screen.getByRole('radio', { name: '2' }));
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).toHaveBeenCalledWith({ score: 2, comment: undefined });
  });

  it('closes with reason "dismiss" from the Rating close button', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<FeedbackPulse open onOpenChange={onOpenChange} onSubmit={() => {}} data-testid='fp' />);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledWith(false, 'dismiss');
  });

  it('closes with reason "dismiss" on Escape', () => {
    const onOpenChange = vi.fn();
    render(<FeedbackPulse open onOpenChange={onOpenChange} onSubmit={() => {}} data-testid='fp' />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false, 'dismiss');
  });

  it('closes with reason "submit" from the Submitted close button', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<FeedbackPulse open onOpenChange={onOpenChange} onSubmit={() => {}} data-testid='fp' />);
    await user.click(screen.getByRole('radio', { name: '3' }));
    await user.click(screen.getByRole('button', { name: 'Send' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledWith(false, 'submit');
  });

  it('moves focus to the Submitted Close button on entering the Submitted phase', async () => {
    const user = userEvent.setup();
    render(<FeedbackPulse open onOpenChange={() => {}} onSubmit={() => {}} data-testid='fp' />);

    await user.click(screen.getByRole('radio', { name: '4' }));
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  });

  it('auto-dismisses the Submitted phase with reason "submit" after dismissDuration', () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    render(
      <FeedbackPulse
        open
        dismissDuration={4000}
        onOpenChange={onOpenChange}
        onSubmit={() => {}}
        data-testid='fp'
      />,
    );
    // Drive to Submitted with fireEvent (fake-timer friendly; avoids userEvent/timer clash).
    fireEvent.click(screen.getByRole('radio', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    act(() => vi.advanceTimersByTime(4200));
    expect(onOpenChange).toHaveBeenCalledWith(false, 'submit');
    vi.useRealTimers();
  });
});
