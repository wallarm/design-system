import type { FC } from 'react';
import { ChevronDown } from '../../../icons/ChevronDown';
import { ChevronRight } from '../../../icons/ChevronRight';
import type { FoldRegion } from '../lib/foldUtils';
import { getFoldSummaryLabel } from '../lib/foldUtils';

export const FoldToggle: FC<{
  fold: FoldRegion;
  isCollapsed: boolean;
  onToggle: () => void;
}> = ({ fold, isCollapsed, onToggle }) => {
  const lineCount = fold.endLine - fold.startLine + 1;
  const label = getFoldSummaryLabel(fold, lineCount);
  const ariaLabel = isCollapsed ? `Expand ${label}` : `Collapse ${label}`;

  return (
    <button
      type='button'
      className='flex items-center justify-center w-16 h-16 rounded-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary-hover transition-colors cursor-pointer'
      aria-expanded={!isCollapsed}
      aria-label={ariaLabel}
      onClick={onToggle}
    >
      {isCollapsed ? <ChevronRight /> : <ChevronDown />}
    </button>
  );
};

FoldToggle.displayName = 'FoldToggle';
