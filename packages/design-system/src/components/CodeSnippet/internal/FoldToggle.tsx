import type { FC, MouseEventHandler } from 'react';

import { ChevronDown } from '../../../icons/ChevronDown';
import { ChevronRight } from '../../../icons/ChevronRight';
import { cn } from '../../../utils/cn';
import { type FoldRegion, getFoldSummaryLabel } from '../lib/foldUtils';

export const FoldToggle: FC<{
  fold: FoldRegion;
  isCollapsed: boolean;
  onToggle: () => void;
  /** Default `data-testid`; `fold.toggleProps['data-testid']` still wins. */
  testId?: string;
}> = ({ fold, isCollapsed, onToggle, testId }) => {
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
        'hover:bg-bg-secondary-hover flex h-16 w-16 cursor-pointer items-center justify-center rounded-2 text-text-secondary transition-colors hover:text-text-primary',
        className,
      )}
      aria-expanded={!isCollapsed}
      aria-label={ariaLabel}
      data-testid={testId}
      {...toggleProps}
      onClick={handleClick}
    >
      {isCollapsed ? <ChevronRight /> : <ChevronDown />}
    </button>
  );
};

FoldToggle.displayName = 'FoldToggle';
