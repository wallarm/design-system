import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '../../../utils/cn';
import { createSweepEngine, resolveOptions, useGame } from './module';

export interface PixelBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
  game?: boolean;
  excludeCardSize?: { width: number; height: number };
}

const ENGINE_OPTIONS = resolveOptions();

export const PixelBackground: FC<PixelBackgroundProps> = (props: PixelBackgroundProps) => {
  const { ref, game = false, excludeCardSize, className, children, ...rest } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ReturnType<typeof createSweepEngine> | null>(null);
  const reducedMotionRef = useRef<MediaQueryList | null>(null);

  const { gameActive, onPointerDown, hudElement, onEngineCreated, onEngineDestroyed } = useGame({
    game,
    isHalftone: true,
    excludeCardSize,
    canvasRef,
  });

  // engine lifecycle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = createSweepEngine(canvas, ENGINE_OPTIONS);
    engineRef.current = engine;

    onEngineCreated(engine);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = reduced;
    const apply = () => {
      if (reduced.matches) {
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

  if (children == null) {
    return (
      <>
        <canvas
          data-slot='pixel-background'
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
    <div
      data-slot='pixel-background'
      {...rest}
      ref={ref}
      className={cn('relative h-full w-full', className)}
    >
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

PixelBackground.displayName = 'PixelBackground';
