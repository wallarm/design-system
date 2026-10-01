import type { FC, MouseEventHandler } from 'react';
import { cn } from '../../../utils/cn';
import type { FoldRegion } from '../lib/foldUtils';
import { getFoldSummaryLabel } from '../lib/foldUtils';

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
      className={cn('inline-flex items-center cursor-pointer select-none', className)}
      aria-expanded={false}
      aria-label={`Collapsed region: ${label}, ${lineCount} lines`}
      data-slot='code-snippet-fold-summary'
      data-testid={testId}
      {...summaryProps}
      onClick={handleClick}
    >
      <span className='inline-flex items-center italic text-text-secondary hover:text-text-primary transition-colors'>
        {label}
      </span>
    </button>
  );
};

FoldSummary.displayName = 'FoldSummary';
