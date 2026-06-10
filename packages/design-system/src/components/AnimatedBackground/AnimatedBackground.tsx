import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { GameHud } from './GameHud';
import type { AnimatedBackgroundProps, GameStats, SweepEngine } from './module';
import { createSweepEngine, resolveOptions, useGameKeyboard } from './module';

const GATE_TARGET = 5;

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
  const engineRef = useRef<SweepEngine | null>(null);
  const reducedMotionRef = useRef<MediaQueryList | null>(null);

  const options = resolveOptions(props);

  const optionsRef = useRef(options);
  const pausedRef = useRef(paused);
  const gameRef = useRef(game);

  useEffect(() => {
    optionsRef.current = options;
    pausedRef.current = paused;
    gameRef.current = game;
  }, []);

  // game state
  const [stats, setStats] = useState<GameStats>({
    kills: 0,
    stopped: 0,
    escaped: 0,
    spawned: 0,
    done: false,
  });
  const [catchKey, setCatchKey] = useState(0);

  const isHalftone = (texture ?? 'halftone') === 'halftone';
  const gameActive = game && isHalftone;
  const caught = stats.kills;
  const armed = game && caught >= GATE_TARGET;
  const roundOver = armed && stats.done;
  const faced = stats.stopped + stats.escaped;
  const accuracy = faced > 0 ? Math.round((stats.stopped / faced) * 100) : 100;

  const hasStartedRoundRef = useRef(false);

  // engine lifecycle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = createSweepEngine(canvas, optionsRef.current);
    engineRef.current = engine;

    // wire stats callback
    engine.onStats((s: GameStats) => {
      setStats(s);
      if (gameRef.current && !s.done) {
        setCatchKey(prev => prev + 1);
      }
    });

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
    };
  }, []);

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

  // game activation sync
  useEffect(() => {
    engineRef.current?.setGameActive(game && isHalftone);
  }, [game, isHalftone]);

  // card exclusion sync — compare by value to avoid re-runs on new object refs
  const exW = excludeCardSize?.width;
  const exH = excludeCardSize?.height;
  useEffect(() => {
    engineRef.current?.setExclusion(
      exW != null && exH != null ? { width: exW, height: exH } : null,
    );
  }, [exW, exH]);

  // arming effect — when caught reaches gate target, start round
  useEffect(() => {
    if (!game || !armed) return;
    if (hasStartedRoundRef.current) {
      // already started — just sync mode
      engineRef.current?.setMode('armed');
      return;
    }
    hasStartedRoundRef.current = true;
    engineRef.current?.startRound();
  }, [game, armed]);

  // keyboard controls
  useGameKeyboard(engineRef, game, armed, roundOver, hasStartedRoundRef);

  // click-to-catch — when game is enabled
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!game) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      engineRef.current?.catchAt(x, y);
    },
    [game],
  );

  // try again handler
  const handleTryAgain = useCallback(() => {
    engineRef.current?.startRound();
  }, []);

  const gameHud = gameActive && (
    <GameHud
      caught={caught}
      armed={armed}
      roundOver={roundOver}
      stats={stats}
      accuracy={accuracy}
      faced={faced}
      catchKey={catchKey}
      gateTarget={GATE_TARGET}
      onTryAgain={handleTryAgain}
    />
  );

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
          onPointerDown={gameActive ? onPointerDown : undefined}
        />
        {gameHud}
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
        onPointerDown={gameActive ? onPointerDown : undefined}
      />

      {gameHud}

      <div className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center'>
        <div className='pointer-events-auto'>{children}</div>
      </div>
    </div>
  );
};

AnimatedBackground.displayName = 'AnimatedBackground';
