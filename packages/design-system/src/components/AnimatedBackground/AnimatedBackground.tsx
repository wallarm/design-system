import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';
import type { AnimatedBackgroundProps } from './module';
import { createSweepEngine, resolveOptions, useGame } from './module';

export const AnimatedBackground: FC<AnimatedBackgroundProps> = (props: AnimatedBackgroundProps) => {
  const {
    ref,
    texture,
    paused,
    game = false,
    excludeCardSize,
    className,
    children,
    ...rest
  } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ReturnType<typeof createSweepEngine> | null>(null);
  const reducedMotionRef = useRef<MediaQueryList | null>(null);

  const options = resolveOptions(props);

  const optionsRef = useRef(options);
  const pausedRef = useRef(paused);

  useEffect(() => {
    optionsRef.current = options;
    pausedRef.current = paused;
  });

  const isHalftone = (texture ?? 'halftone') === 'halftone';

  const { gameActive, onPointerDown, hudElement, onEngineCreated, onEngineDestroyed } = useGame({
    game,
    isHalftone,
    excludeCardSize,
    canvasRef,
  });

  // engine lifecycle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = createSweepEngine(canvas, optionsRef.current);
    engineRef.current = engine;

    onEngineCreated(engine);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = reduced;
    const apply = () => {
      if (reduced.matches || pausedRef.current) {
        engine.stop();
        engine.renderStatic();
      } else {
        engine.start();
      }
    };
    apply();
    reduced.addEventListener('change', apply);

    let frame = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => engine.resize());
    });
    ro.observe(canvas);

    const themeObserver = new MutationObserver(() => engine.setOptions({}));
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    return () => {
      reduced.removeEventListener('change', apply);
      reducedMotionRef.current = null;
      ro.disconnect();
      themeObserver.disconnect();
      cancelAnimationFrame(frame);
      engine.stop();
      engineRef.current = null;
      onEngineDestroyed();
    };
  }, [onEngineCreated, onEngineDestroyed]);

  // option sync
  const syncKey = `${JSON.stringify(options)}|${paused}`;

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setOptions(optionsRef.current);
    const reduced = reducedMotionRef.current;
    if (reduced?.matches || pausedRef.current) {
      engine.stop();
      engine.renderStatic();
    } else {
      engine.start();
    }
  }, [syncKey]);

  if (children == null) {
    return (
      <>
        <canvas
          data-slot='animated-background'
          {...(rest as React.HTMLAttributes<HTMLCanvasElement>)}
          ref={node => {
            canvasRef.current = node;
            if (typeof ref === 'function') ref(node as HTMLDivElement | null);
            else if (ref) ref.current = node as HTMLDivElement | null;
          }}
          aria-hidden='true'
          className={cn(
            'h-full w-full pointer-events-none',
            gameActive && 'pointer-events-auto',
            className,
          )}
          onPointerDown={onPointerDown}
        />

        {hudElement}
      </>
    );
  }

  return (
    <div data-slot='animated-background' {...rest} ref={ref} className={cn('relative', className)}>
      <canvas
        ref={canvasRef}
        aria-hidden='true'
        className={cn(
          'absolute inset-0 h-full w-full pointer-events-none',
          gameActive && 'pointer-events-auto',
        )}
        onPointerDown={onPointerDown}
      />

      {hudElement}

      <div className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center'>
        <div className='pointer-events-auto'>{children}</div>
      </div>
    </div>
  );
};

AnimatedBackground.displayName = 'AnimatedBackground';
