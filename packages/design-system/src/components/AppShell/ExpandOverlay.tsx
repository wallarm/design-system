import type { FC } from 'react';
import type { AppShellExpandFrom } from './AppShell';
import { EXPAND_BORDER_MS, HERO_EASE } from './constants';
import type { RevealPhase } from './useShellAnimation';

interface ExpandOverlayProps {
  phase: RevealPhase;
  expandFrom: AppShellExpandFrom;
  targetRect: { top: number; left: number } | null;
}

const EXPANDING_TRANSITION = [
  'top',
  'left',
  'right',
  'bottom',
  'border-radius',
  'border-right-width',
  'border-bottom-width',
]
  .map(prop => `${prop} ${EXPAND_BORDER_MS}ms ${HERO_EASE}`)
  .join(', ');

export const ExpandOverlay: FC<ExpandOverlayProps> = ({ phase, expandFrom, targetRect }) => {
  if (phase !== 'initial' && phase !== 'expanding') return null;

  const { width, height, borderRadius = 0 } = expandFrom;
  const isInitial = phase === 'initial';

  const halfW = `calc(50% - ${width / 2}px)`;
  const halfH = `calc(50% - ${height / 2}px)`;

  return (
    <div
      className='pointer-events-none absolute z-50 border-solid border-border-primary-light'
      style={{
        top: isInitial ? halfH : `${targetRect?.top ?? 0}px`,
        left: isInitial ? halfW : `${targetRect?.left ?? 0}px`,
        right: isInitial ? halfW : 0,
        bottom: isInitial ? halfH : 0,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: isInitial ? 1 : 0,
        borderBottomWidth: isInitial ? 1 : 0,
        borderRadius: isInitial ? borderRadius : '12px 0px 0px 0px',
        opacity: 1,
        transition: isInitial ? undefined : EXPANDING_TRANSITION,
      }}
    />
  );
};

ExpandOverlay.displayName = 'ExpandOverlay';
