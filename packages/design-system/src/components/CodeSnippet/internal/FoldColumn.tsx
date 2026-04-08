import type { FC } from 'react';
import { useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { useCodeSnippet } from '../hooks';
import { LINE_COLOR_STYLES, SIZE_LINE_HEIGHT_CLASSES } from '../lib/lineStyles';
import { FoldToggle } from './FoldToggle';

/** Fold toggle column — renders fold chevrons for each row */
export const FoldColumn: FC = () => {
  const { visibleDisplayItems, folds, collapsedFolds, toggleFold, size, lines } = useCodeSnippet();
  const lineHeightClass = SIZE_LINE_HEIGHT_CLASSES[size];

  const foldByStartLine = useMemo(() => new Map(folds.map(f => [f.startLine, f])), [folds]);

  return (
    <div className='flex flex-col select-none' data-slot='code-snippet-fold'>
      {visibleDisplayItems.map(item => {
        if (item.type === 'fold-summary') {
          return (
            <span
              key={`fold-${item.fold.id}`}
              className={cn(lineHeightClass, 'flex h-lh items-center justify-center px-4')}
            >
              <FoldToggle fold={item.fold} isCollapsed onToggle={() => toggleFold(item.fold.id)} />
            </span>
          );
        }

        const fold = foldByStartLine.get(item.lineNumber);
        const lineConfig = lines.get(item.lineNumber);
        const colorStyles = lineConfig?.color ? LINE_COLOR_STYLES[lineConfig.color] : undefined;

        return (
          <span
            key={item.lineNumber}
            className={cn(
              lineHeightClass,
              'flex h-lh items-center justify-center px-4',
              colorStyles?.bg,
            )}
          >
            {fold && !collapsedFolds.has(fold.id) ? (
              <FoldToggle fold={fold} isCollapsed={false} onToggle={() => toggleFold(fold.id)} />
            ) : null}
          </span>
        );
      })}
    </div>
  );
};
