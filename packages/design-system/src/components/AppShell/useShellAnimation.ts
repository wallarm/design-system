import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AppShellExpandFrom } from './AppShell';
import { EXPAND_BORDER_MS, EXPAND_MS, HERO_EASE, SKELETON_DELAY } from './constants';

export type RevealPhase = 'initial' | 'expanding' | 'revealing' | 'done';

interface UseShellAnimationOptions {
  reveal?: boolean;
  expandFrom?: AppShellExpandFrom;
  onRevealed?: () => void;
  appearedProp?: boolean;
}

function queryRemoteRect(shell: HTMLElement) {
  const remote = shell.querySelector<HTMLElement>('[data-slot="app-shell-remote"]');
  if (!remote) return null;

  const shellRect = shell.getBoundingClientRect();
  const remoteRect = remote.getBoundingClientRect();
  return {
    top: remoteRect.top - shellRect.top,
    left: remoteRect.left - shellRect.left,
  };
}

function computeExpandStyle(
  expandFrom: AppShellExpandFrom,
  phase: RevealPhase,
  targetRect: { top: number; left: number } | null,
): React.CSSProperties | undefined {
  const { width, height, borderRadius = 0 } = expandFrom;

  switch (phase) {
    case 'initial':
      return {
        clipPath: `inset(calc(50% - ${height / 2}px) calc(50% - ${width / 2}px) round ${borderRadius}px)`,
      };
    case 'expanding':
      if (targetRect) {
        return {
          clipPath: `inset(${targetRect.top}px 0px 0px ${targetRect.left}px round 12px 0px 0px 0px)`,
          transition: `clip-path ${EXPAND_BORDER_MS}ms ${HERO_EASE}`,
        };
      }
      return {
        clipPath: 'inset(0 0 round 0px)',
        transition: `clip-path ${EXPAND_BORDER_MS}ms ${HERO_EASE}`,
      };
    default:
      return undefined;
  }
}

export function useShellAnimation(
  shellRef: RefObject<HTMLDivElement | null>,
  options: UseShellAnimationOptions,
) {
  const { reveal, expandFrom, onRevealed, appearedProp } = options;
  const onRevealedRef = useRef(onRevealed);
  onRevealedRef.current = onRevealed;

  const hasAnimation = Boolean(expandFrom || reveal);
  const [phase, setPhase] = useState<RevealPhase>(hasAnimation ? 'initial' : 'done');
  const [targetRect, setTargetRect] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (phase !== 'initial') return;

    let cancelled = false;

    const scheduleDoubleRaf = (callback: () => void) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) callback();
        });
      });
    };

    if (expandFrom) {
      scheduleDoubleRaf(() => {
        const shell = shellRef.current;
        if (shell) {
          const rect = queryRemoteRect(shell);
          if (rect) setTargetRect(rect);
        }
        setPhase('expanding');
      });
    } else {
      scheduleDoubleRaf(() => {
        const shell = shellRef.current;
        if (!shell) return;

        const rect = queryRemoteRect(shell);
        if (!rect) {
          setPhase('done');
          onRevealedRef.current?.();
          return;
        }

        setTargetRect(rect);
        setPhase('revealing');
      });
    }

    return () => {
      cancelled = true;
    };
  }, [phase, expandFrom, shellRef]);

  const handleRevealOverlayTransitionEnd = useCallback((e: React.TransitionEvent) => {
    if (e.propertyName === 'top') {
      setPhase('done');
      onRevealedRef.current?.();
    }
  }, []);

  const handleExpandTransitionEnd = useCallback((e: React.TransitionEvent) => {
    if (e.propertyName === 'clip-path') {
      setPhase('done');
      onRevealedRef.current?.();
    }
  }, []);

  const expandStyle = useMemo(
    () => (expandFrom ? computeExpandStyle(expandFrom, phase, targetRect) : undefined),
    [expandFrom, phase, targetRect],
  );

  const isDone = phase === 'done';
  const [appearedDelayed, setAppearedDelayed] = useState(!hasAnimation);

  useEffect(() => {
    if (!isDone || !hasAnimation) return;
    const delay = expandFrom ? EXPAND_MS - EXPAND_BORDER_MS : SKELETON_DELAY;
    const id = setTimeout(() => setAppearedDelayed(true), delay);
    return () => clearTimeout(id);
  }, [isDone, hasAnimation, expandFrom]);

  const appeared = appearedProp ?? (hasAnimation ? appearedDelayed : true);

  return {
    phase,
    targetRect,
    expandStyle,
    appeared,
    handleRevealOverlayTransitionEnd,
    handleExpandTransitionEnd,
  };
}
