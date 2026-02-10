import type { FC, HTMLAttributes, Ref } from 'react';
import { useCodeSnippet } from './hooks';
import { CodeContent, CodeLine, TokenizedCodeLine } from './internal';
import { SIZE_LINE_HEIGHT_CLASSES } from './lib/lineStyles';
import { splitTextByRanges } from './lib/lineUtils';

export type CodeSnippetCodeProps = HTMLAttributes<HTMLPreElement> & {
  ref?: Ref<HTMLPreElement>;
};

export const CodeSnippetCode: FC<CodeSnippetCodeProps> = ({ className, ...props }) => {
  const {
    code,
    tokens,
    isLoading,
    wrapLines,
    startingLineNumber,
    lines,
    size,
    inlineGutter,
    showLineNumbers,
    maxLines,
    isExpanded,
  } = useCodeSnippet();

  const lineHeightClass = SIZE_LINE_HEIGHT_CLASSES[size];
  const shouldClip = maxLines > 0 && !isExpanded;

  // Show loading state or plain code if tokens not ready
  if (isLoading || !tokens) {
    const codeLines = code.split('\n');
    const visibleLines = shouldClip ? codeLines.slice(0, maxLines) : codeLines;
    return (
      <CodeContent wrapLines={wrapLines} className={className} {...props}>
        {visibleLines.map((line, index) => {
          const lineNumber = startingLineNumber + index;
          const lineConfig = lines.get(lineNumber);
          const ranges = lineConfig?.ranges;
          const hasRanges = ranges && ranges.length > 0;

          return (
            <CodeLine
              key={lineNumber}
              lineConfig={lineConfig}
              lineHeightClass={lineHeightClass}
              showInlineGutter={inlineGutter}
              lineNumber={showLineNumbers ? lineNumber : undefined}
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

  const visibleTokens = shouldClip ? tokens.slice(0, maxLines) : tokens;

  return (
    <CodeContent wrapLines={wrapLines} className={className} {...props}>
      {visibleTokens.map((lineTokens, index) => {
        const lineNumber = startingLineNumber + index;
        return (
          <TokenizedCodeLine
            key={lineNumber}
            tokens={lineTokens}
            lineConfig={lines.get(lineNumber)}
            lineHeightClass={lineHeightClass}
            showInlineGutter={inlineGutter}
            lineNumber={showLineNumbers ? lineNumber : undefined}
          />
        );
      })}
    </CodeContent>
  );
};

CodeSnippetCode.displayName = 'CodeSnippetCode';
