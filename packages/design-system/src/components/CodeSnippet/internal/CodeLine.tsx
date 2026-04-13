import type { FC, ReactNode } from 'react';
import { cn } from '../../../utils/cn';
import type { LineConfig } from '../CodeSnippetContext';
import type { FoldRegion } from '../lib/foldUtils';
import { LINE_COLOR_STYLES } from '../lib/lineStyles';
import { getLineTextStyles } from '../lib/lineUtils';
import { FoldToggle } from './FoldToggle';

export type CodeLineProps = {
  lineConfig: LineConfig | undefined;
  lineHeightClass: string;
  /** Show inline gutter elements (color stick, line number, prefix) - used when wrapLines is true */
  showInlineGutter?: boolean;
  /** Line number to display (only shown when showInlineGutter is true) */
  lineNumber?: number;
  /** Fold region starting at this line (only shown when showInlineGutter is true) */
  fold?: FoldRegion;
  /** Whether the fold is collapsed */
  isFoldCollapsed?: boolean;
  /** Callback to toggle the fold */
  onFoldToggle?: () => void;
  /** Whether any folds exist (used to render consistent-width spacer) */
  hasFolds?: boolean;
  children: ReactNode;
};

/** Renders a single line of code with styling */
export const CodeLine: FC<CodeLineProps> = ({
  lineConfig,
  lineHeightClass,
  showInlineGutter = false,
  lineNumber,
  fold,
  isFoldCollapsed,
  onFoldToggle,
  hasFolds = false,
  children,
}) => {
  const {
    colorClass,
    textStyleClass,
    className: lineClassName,
    style,
  } = getLineTextStyles(lineConfig);

  const colorStyles = lineConfig?.color ? LINE_COLOR_STYLES[lineConfig.color] : undefined;

  return (
    <div
      className={cn(
        lineHeightClass,
        showInlineGutter && 'flex',
        // Apply background highlight when inline gutter is shown
        showInlineGutter && colorStyles?.bg,
      )}
      style={style}
    >
      {showInlineGutter && (
        <>
          {/* Color stick */}
          <span
            className={cn(
              'shrink-0 self-stretch border-l-2',
              !hasFolds && 'pl-12',
              colorStyles?.border ?? 'border-transparent',
            )}
          />
          {/* Line number */}
          {lineNumber !== undefined && (
            <span
              className={cn(
                'shrink-0 select-none text-right text-text-secondary px-8',
                colorStyles?.text,
              )}
            >
              {lineNumber}
            </span>
          )}
          {/* Fold toggle */}
          {hasFolds && (
            <span className='shrink-0 flex items-center justify-center px-4'>
              {fold && onFoldToggle ? (
                <FoldToggle
                  fold={fold}
                  isCollapsed={isFoldCollapsed ?? false}
                  onToggle={onFoldToggle}
                />
              ) : (
                <span className='w-16 h-16' />
              )}
            </span>
          )}
          {/* Prefix */}
          {lineConfig?.prefix !== undefined && (
            <span className={cn('shrink-0 select-none px-8 text-center', colorStyles?.text)}>
              {lineConfig.prefix}
            </span>
          )}
        </>
      )}
      <span
        className={cn(
          'flex-1',
          showInlineGutter && 'pr-12',
          colorClass,
          textStyleClass,
          lineClassName,
        )}
      >
        {children}
      </span>
    </div>
  );
};

CodeLine.displayName = 'CodeLine';
