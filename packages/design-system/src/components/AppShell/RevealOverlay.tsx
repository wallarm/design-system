import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { EMPHASIZED_DECEL, MORPH_MS } from './constants';
import type { RevealPhase } from './useShellAnimation';

interface RevealOverlayProps {
  phase: RevealPhase;
  targetRect: { top: number; left: number } | null;
  onTransitionEnd: (e: React.TransitionEvent) => void;
}

const REVEALING_TRANSITION = ['top', 'left', 'border-radius']
  .map(prop => `${prop} ${MORPH_MS}ms ${EMPHASIZED_DECEL}`)
  .join(', ');

export const RevealOverlay: FC<RevealOverlayProps> = ({ phase, targetRect, onTransitionEnd }) => {
  if (phase === 'done') return null;

  const isRevealing = phase === 'revealing';

  return (
    <div
      className={cn(
        'bg-bg-page-bg pointer-events-none z-50 absolute right-0 bottom-0',
        isRevealing && 'rounded-tl-12',
      )}
      style={{
        top: isRevealing && targetRect ? targetRect.top : 0,
        left: isRevealing && targetRect ? targetRect.left : 0,
        transition: isRevealing ? REVEALING_TRANSITION : undefined,
      }}
      onTransitionEnd={onTransitionEnd}
    />
  );
};

RevealOverlay.displayName = 'RevealOverlay';
