import { act } from 'react';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedbackPulseProgress } from './FeedbackPulseProgress';

// vi fake timers mock requestAnimationFrame + performance.now (Sinon-backed).
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('FeedbackPulseProgress', () => {
  it('calls onComplete after the duration elapses', () => {
    const onComplete = vi.fn();
    render(<FeedbackPulseProgress duration={1000} onComplete={onComplete} />);
    act(() => vi.advanceTimersByTime(1100));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does not advance while paused', () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <FeedbackPulseProgress duration={1000} paused onComplete={onComplete} />,
    );
    act(() => vi.advanceTimersByTime(2000));
    expect(onComplete).not.toHaveBeenCalled();
    rerender(<FeedbackPulseProgress duration={1000} paused={false} onComplete={onComplete} />);
    act(() => vi.advanceTimersByTime(1100));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
