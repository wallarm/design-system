import type { CanvasHTMLAttributes, FC, Ref } from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';
import { animatedBackgroundVariants } from './classes';
import { createSweepEngine, type SweepEngine } from './engine';
import { resolveOptions } from './lib';
import type { Texture } from './types';

export interface AnimatedBackgroundProps
  extends Omit<CanvasHTMLAttributes<HTMLCanvasElement>, 'children'> {
  ref?: Ref<HTMLCanvasElement>;
  /** Variant A (`clean`) vs Variant B (`halftone`). */
  texture?: Texture;
  /** Grid cell size in px. */
  spacing?: number;
  /** Seconds for one L->R sweep pass. */
  sweepPeriod?: number;
  /** How far from the scan line (px) dots react. */
  bloomRadius?: number;
  /** Minimum seconds between orange events. Higher = rarer. */
  anomalyInterval?: number;
  /** Global opacity/strength multiplier (0-1). */
  intensity?: number;
  /** Peak alpha of fully-bloomed (emphasized) dots, before intensity. */
  bloomAlpha?: number;
  /** Halftone only: cap on a bloomed pixel's full edge length (px). */
  maxDotSize?: number;
  /** Sweep-line tilt in degrees (0 = vertical; positive leans the top right). */
  tilt?: number;
  /** CSS custom-property name for the dot color. */
  dotColorVar?: string;
  /** CSS custom-property name for the "caught" accent. */
  accentColorVar?: string;
  /** CSS custom-property name for the base fill. */
  baseColorVar?: string;
  /** Force a single static frame (also auto-true under reduced motion). */
  paused?: boolean;
}

export const AnimatedBackground: FC<AnimatedBackgroundProps> = (props: AnimatedBackgroundProps) => {
  const { ref, texture, paused, className, ...rest } = props;

  const internalRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SweepEngine | null>(null);

  const options = resolveOptions(props);
  const optionsRef = useRef(options);
  const pausedRef = useRef(paused);
  useEffect(() => {
    optionsRef.current = options;
    pausedRef.current = paused;
  });

  const signature = JSON.stringify({ ...options, paused: !!paused });

  useEffect(() => {
    const canvas = internalRef.current;
    if (!canvas) return;
    const engine = createSweepEngine(canvas, optionsRef.current);
    engineRef.current = engine;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
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
      ro.disconnect();
      themeObserver.disconnect();
      cancelAnimationFrame(frame);
      engine.stop();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setOptions(optionsRef.current);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches || pausedRef.current) {
      engine.stop();
      engine.renderStatic();
    } else {
      engine.start();
    }
  }, [signature]);

  return (
    <canvas
      {...rest}
      ref={node => {
        internalRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      data-slot='login-background'
      aria-hidden='true'
      className={cn(animatedBackgroundVariants({ texture }), className)}
    />
  );
};

AnimatedBackground.displayName = 'AnimatedBackground';
