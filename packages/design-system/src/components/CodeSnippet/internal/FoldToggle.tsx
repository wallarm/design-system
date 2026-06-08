import type { FC, MouseEventHandler } from 'react';
import { ChevronDown } from '../../../icons/ChevronDown';
import { ChevronRight } from '../../../icons/ChevronRight';
import { cn } from '../../../utils/cn';
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
  const { className, onClick, ...toggleProps } = fold.toggleProps ?? {};

  const handleClick: MouseEventHandler<HTMLButtonElement> = event => {
    onToggle();
    onClick?.(event);
  };

  return (
    <button
      type='button'
      className={cn(
        'flex items-center justify-center w-16 h-16 rounded-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary-hover transition-colors cursor-pointer',
        className,
      )}
      aria-expanded={!isCollapsed}
      aria-label={ariaLabel}
      {...toggleProps}
      onClick={handleClick}
    >
      {isCollapsed ? <ChevronRight /> : <ChevronDown />}
    </button>
  );
};

FoldToggle.displayName = 'FoldToggle';
