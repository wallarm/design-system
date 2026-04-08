import type { FC } from 'react';
import { cn } from '../../../utils/cn';
import type { FoldRegion } from '../lib/foldUtils';
import { getFoldSummaryLabel } from '../lib/foldUtils';

export const FoldSummaryLine: FC<{
  fold: FoldRegion;
  lineCount: number;
  lineHeightClass: string;
  onToggle: () => void;
}> = ({ fold, lineCount, lineHeightClass, onToggle }) => {
  const label = getFoldSummaryLabel(fold, lineCount);
  const ariaLabel = `Collapsed region: ${label}, ${lineCount} lines`;

  return (
    <button
      type='button'
      className={cn(
        lineHeightClass,
        'flex w-full items-center gap-4 px-4 text-text-secondary hover:text-text-primary hover:bg-bg-secondary-hover transition-colors cursor-pointer select-none text-left',
      )}
      aria-expanded={false}
      aria-label={ariaLabel}
      onClick={onToggle}
    >
      <span className='inline-flex items-center rounded-2 border border-border-secondary px-6 text-xs leading-sm'>
        {label}
      </span>
    </button>
  );
};

FoldSummaryLine.displayName = 'FoldSummaryLine';
