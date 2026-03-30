import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

interface ToastProgressProps {
  duration: number;
}

export const ToastProgress: FC<ToastProgressProps> = ({ duration }) => {
  const [progress, setProgress] = useState(0);
  const elapsedRef = useRef(0);
  const lastTickRef = useRef(0);
  const rafRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPaused = useCallback(() => {
    const root = containerRef.current?.closest('[data-scope="toast"][data-part="root"]');
    return root?.hasAttribute('data-paused') ?? false;
  }, []);

  useEffect(() => {
    lastTickRef.current = performance.now();

    const tick = (now: number) => {
      if (!isPaused()) {
        elapsedRef.current += now - lastTickRef.current;
      }
      lastTickRef.current = now;

      const fraction = Math.min(elapsedRef.current / duration, 1);
      setProgress(fraction);

      if (fraction < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [duration, isPaused]);

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0 rounded-16 overflow-hidden pointer-events-none')}
    >
      <div
        className='h-full bg-states-primary-alt-default-alt transition-none'
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
};

ToastProgress.displayName = 'ToastProgress';
