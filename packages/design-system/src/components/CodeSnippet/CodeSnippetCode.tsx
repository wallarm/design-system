import type { FC, HTMLAttributes, MouseEventHandler, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useCodeSnippet } from './hooks';
import { CodeContent, CodeLine, TokenizedCodeLine } from './internal';
import type { DisplayItem } from './lib/foldUtils';
import { getFoldSummaryLabel } from './lib/foldUtils';
import { SIZE_LINE_HEIGHT_CLASSES } from './lib/lineStyles';
import { splitTextByRanges } from './lib/lineUtils';

export type CodeSnippetCodeProps = HTMLAttributes<HTMLPreElement> & {
  ref?: Ref<HTMLPreElement>;
};

export const CodeSnippetCode: FC<CodeSnippetCodeProps> = ({ className, ...props }) => {
  const testId = useTestId('code');
  const {
    code,
    tokens,
    isLoading,
    wrapLines,
    lines,
    size,
    inlineGutter,
    showLineNumbers,
    visibleDisplayItems,
    folds,
    foldByStartLine,
    collapsedFolds,
    toggleFold,
  } = useCodeSnippet();

  const lineHeightClass = SIZE_LINE_HEIGHT_CLASSES[size];
  const hasFolds = folds.length > 0;

  const getFoldProps = (lineNumber: number) => {
    if (!inlineGutter || !hasFolds) return {};
    const fold = foldByStartLine.get(lineNumber);
    return {
      fold,
      isFoldCollapsed: fold ? collapsedFolds.has(fold.id) : undefined,
      onFoldToggle: fold ? () => toggleFold(fold.id) : undefined,
      hasFolds: true,
    };
  };

  const renderFoldSummary = (item: Extract<DisplayItem, { type: 'fold-summary' }>) => {
    const label = getFoldSummaryLabel(item.fold, item.lineCount);
    const {
      className: summaryClassName,
      onClick: consumerOnClick,
      ...summaryProps
    } = item.fold.summaryProps ?? {};

    const handleSummaryClick: MouseEventHandler<HTMLButtonElement> = event => {
      toggleFold(item.fold.id);
      consumerOnClick?.(event);
    };

    return (
      <CodeLine
        key={`fold-${item.fold.id}`}
        lineConfig={undefined}
        lineHeightClass={lineHeightClass}
        showInlineGutter={inlineGutter}
        lineNumber={showLineNumbers ? item.fold.startLine : undefined}
        fold={inlineGutter ? item.fold : undefined}
        isFoldCollapsed={inlineGutter || undefined}
        onFoldToggle={inlineGutter ? () => toggleFold(item.fold.id) : undefined}
        hasFolds={inlineGutter && hasFolds}
      >
        <button
          type='button'
          className={cn('inline-flex items-center cursor-pointer select-none', summaryClassName)}
          aria-expanded={false}
          aria-label={`Collapsed region: ${label}, ${item.lineCount} lines`}
          {...summaryProps}
          onClick={handleSummaryClick}
        >
          <span className='inline-flex items-center italic text-text-secondary hover:text-text-primary transition-colors'>
            {label}
          </span>
        </button>
      </CodeLine>
    );
  };

  // Show loading state or plain code if tokens not ready
  if (isLoading || !tokens) {
    const codeLines = code.split('\n');
    return (
      <CodeContent wrapLines={wrapLines} className={className} {...props} data-testid={testId}>
        {visibleDisplayItems.map(item => {
          if (item.type === 'fold-summary') return renderFoldSummary(item);
          const line = codeLines[item.index] ?? '';
          const lineConfig = lines.get(item.lineNumber);
          const ranges = lineConfig?.ranges;
          const hasRanges = ranges && ranges.length > 0;

          return (
            <CodeLine
              key={item.lineNumber}
              lineConfig={lineConfig}
              lineHeightClass={lineHeightClass}
              showInlineGutter={inlineGutter}
              lineNumber={showLineNumbers ? item.lineNumber : undefined}
              {...getFoldProps(item.lineNumber)}
            >
              {hasRanges
                ? splitTextByRanges(line, ranges, lineConfig?.color).map((segment, i) => (
                    <span key={i} className={segment.rangeColor}>
                      {segment.content}
                    </span>
                  ))
                : line}
            </CodeLine>
          );
        })}
      </CodeContent>
    );
  }

  return (
    <CodeContent wrapLines={wrapLines} className={className} {...props} data-testid={testId}>
      {visibleDisplayItems.map(item => {
        if (item.type === 'fold-summary') return renderFoldSummary(item);
        const lineTokens = tokens[item.index];
        if (!lineTokens) return null;
        return (
          <TokenizedCodeLine
            key={item.lineNumber}
            tokens={lineTokens}
            lineConfig={lines.get(item.lineNumber)}
            lineHeightClass={lineHeightClass}
            showInlineGutter={inlineGutter}
            lineNumber={showLineNumbers ? item.lineNumber : undefined}
            {...getFoldProps(item.lineNumber)}
          />
        );
      })}
    </CodeContent>
  );
};

CodeSnippetCode.displayName = 'CodeSnippetCode';
