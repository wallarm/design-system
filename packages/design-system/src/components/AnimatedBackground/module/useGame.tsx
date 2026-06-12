import type { PointerEvent, ReactElement, RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHud } from '../GameHud';
import type { GameStats, SweepEngine } from './index';
import { useGameKeyboard } from './useGameKeyboard';

const GATE_TARGET = 5;

interface UseGameParams {
  game: boolean;
  isHalftone: boolean;
  excludeCardSize?: { width: number; height: number };
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

interface UseGameReturn {
  gameActive: boolean;
  onPointerDown: ((e: PointerEvent<HTMLCanvasElement>) => void) | undefined;
  hudElement: ReactElement | null;
  onEngineCreated: (engine: SweepEngine) => void;
  onEngineDestroyed: () => void;
  soundOn: boolean;
  toggleSound: () => void;
}

export const useGame = ({
  game,
  isHalftone,
  excludeCardSize,
  canvasRef,
}: UseGameParams): UseGameReturn => {
  const engineRef = useRef<SweepEngine | null>(null);
  const gameRef = useRef(game);
  const hasStartedRoundRef = useRef(false);

  const [stats, setStats] = useState<GameStats>({
    kills: 0,
    stopped: 0,
    escaped: 0,
    spawned: 0,
    done: false,
  });
  const [catchKey, setCatchKey] = useState(0);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    gameRef.current = game;
  });

  const gameActive = game && isHalftone;
  const caught = stats.kills;
  const armed = game && caught >= GATE_TARGET;
  const roundOver = armed && stats.done;
  const faced = stats.stopped + stats.escaped;
  const accuracy = faced > 0 ? Math.round((stats.stopped / faced) * 100) : 100;

  // bridge callbacks — called by the component's engine lifecycle
  const onEngineCreated = useCallback((engine: SweepEngine) => {
    engineRef.current = engine;
    engine.onStats((s: GameStats) => {
      setStats(s);
      if (gameRef.current && !s.done) {
        setCatchKey(prev => prev + 1);
      }
    });
  }, []);

  const onEngineDestroyed = useCallback(() => {
    engineRef.current = null;
  }, []);

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

  // sound gate — only routes with the easter egg get sound
  const soundCapable = game;
  useEffect(() => {
    engineRef.current?.setSound(soundCapable && soundOn);
  }, [soundCapable, soundOn]);

  const toggleSound = useCallback(() => {
    setSoundOn(prev => !prev);
  }, []);

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
  useGameKeyboard(engineRef, game, armed, roundOver, hasStartedRoundRef, toggleSound);

  // click-to-catch — when game is enabled
  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLCanvasElement>) => {
      if (!game) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      engineRef.current?.catchAt(x, y);
    },
    [game, canvasRef],
  );

  // try again handler
  const handleTryAgain = useCallback(() => {
    engineRef.current?.startRound();
  }, []);

  const hudElement = (
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
      soundOn={soundOn}
    />
  );

  return {
    gameActive,
    onPointerDown: gameActive ? onPointerDown : undefined,
    hudElement: gameActive ? hudElement : null,
    onEngineCreated,
    onEngineDestroyed,
    soundOn,
    toggleSound,
  };
};
