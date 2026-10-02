import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { render } from '@testing-library/react';
import { FeedbackPulseProgress } from './FeedbackPulseProgress';

// rs fake timers mock requestAnimationFrame + performance.now (Sinon-backed).
// Block bodies: Rstest treats a value returned from a hook as its cleanup function.
beforeEach(() => {
  rs.useFakeTimers();
});
afterEach(() => {
  rs.useRealTimers();
});

describe('FeedbackPulseProgress', () => {
  it('calls onComplete after the duration elapses', () => {
    const onComplete = rs.fn();
    render(<FeedbackPulseProgress duration={1000} onComplete={onComplete} />);
    act(() => rs.advanceTimersByTime(1100));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does not advance while paused', () => {
    const onComplete = rs.fn();
    const { rerender } = render(
      <FeedbackPulseProgress duration={1000} paused onComplete={onComplete} />,
    );
    act(() => rs.advanceTimersByTime(2000));
    expect(onComplete).not.toHaveBeenCalled();
    rerender(<FeedbackPulseProgress duration={1000} paused={false} onComplete={onComplete} />);
    act(() => rs.advanceTimersByTime(1100));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
