import type { FC, MouseEventHandler } from 'react';

import { cn } from '../../../utils/cn';
import { type FoldRegion, getFoldSummaryLabel } from '../lib/foldUtils';

export interface FoldSummaryProps {
  fold: FoldRegion;
  lineCount: number;
  onToggle: () => void;
  /** Default `data-testid`; `fold.summaryProps['data-testid']` still wins. */
  testId?: string;
}

/** Collapsed-fold summary button. Shared by CodeSnippetCode and the CodeEditor fold widget. */
export const FoldSummary: FC<FoldSummaryProps> = ({ fold, lineCount, onToggle, testId }) => {
  const label = getFoldSummaryLabel(fold, lineCount);
  const { className, onClick, ...summaryProps } = fold.summaryProps ?? {};

  const handleClick: MouseEventHandler<HTMLButtonElement> = event => {
    onToggle();
    onClick?.(event);
  };

  return (
    <button
      type='button'
      className={cn('inline-flex cursor-pointer items-center select-none', className)}
      aria-expanded={false}
      aria-label={`Collapsed region: ${label}, ${lineCount} lines`}
      data-slot='code-snippet-fold-summary'
      data-testid={testId}
      {...summaryProps}
      onClick={handleClick}
    >
      <span className='inline-flex items-center text-text-secondary italic transition-colors hover:text-text-primary'>
        {label}
      </span>
    </button>
  );
};

FoldSummary.displayName = 'FoldSummary';
