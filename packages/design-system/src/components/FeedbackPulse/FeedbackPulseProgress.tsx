// FeedbackPulseProgress.tsx  — mirrors Toast/ToastProgress, decoupled from the toast DOM scope.
import { type FC, useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

export interface FeedbackPulseProgressProps {
  duration: number;
  paused?: boolean;
  onComplete: () => void;
  'data-testid'?: string;
}

export const FeedbackPulseProgress: FC<FeedbackPulseProgressProps> = ({
  duration,
  paused = false,
  onComplete,
  'data-testid': testId,
}) => {
  const [progress, setProgress] = useState(0);
  const elapsedRef = useRef(0);
  const lastTickRef = useRef(0);
  const rafRef = useRef(0);
  const pausedRef = useRef(paused);
  const onCompleteRef = useRef(onComplete);
  pausedRef.current = paused;
  onCompleteRef.current = onComplete;

  useEffect(() => {
    lastTickRef.current = performance.now();
    let done = false;
    const tick = (now: number) => {
      if (!pausedRef.current) elapsedRef.current += now - lastTickRef.current;
      lastTickRef.current = now;
      const fraction = Math.min(elapsedRef.current / duration, 1);
      setProgress(fraction);
      if (fraction < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (!done) {
        done = true;
        onCompleteRef.current();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration]);

  return (
    <div
      aria-hidden
      data-slot='feedback-pulse-progress'
      data-testid={testId}
      className={cn('pointer-events-none absolute inset-0 overflow-hidden rounded-12')}
    >
      <div
        className='h-full bg-states-primary-default-alt transition-none'
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
};

FeedbackPulseProgress.displayName = 'FeedbackPulseProgress';
