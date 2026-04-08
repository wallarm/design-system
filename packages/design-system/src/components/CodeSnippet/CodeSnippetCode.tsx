import type { FC, HTMLAttributes, Ref } from 'react';
import { useTestId } from '../../utils/testId';
import { useCodeSnippet } from './hooks';
import { CodeContent, CodeLine, TokenizedCodeLine } from './internal';
import { FoldSummaryLine } from './internal/FoldSummaryLine';
import type { DisplayItem } from './lib/foldUtils';
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
    toggleFold,
  } = useCodeSnippet();

  const lineHeightClass = SIZE_LINE_HEIGHT_CLASSES[size];

  const renderFoldSummary = (item: Extract<DisplayItem, { type: 'fold-summary' }>) => (
    <FoldSummaryLine
      key={`fold-${item.fold.id}`}
      fold={item.fold}
      lineCount={item.lineCount}
      lineHeightClass={lineHeightClass}
      onToggle={() => toggleFold(item.fold.id)}
    />
  );

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
          />
        );
      })}
    </CodeContent>
  );
};

CodeSnippetCode.displayName = 'CodeSnippetCode';
