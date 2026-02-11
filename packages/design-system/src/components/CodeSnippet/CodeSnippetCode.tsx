import type { FC, HTMLAttributes, Ref } from 'react';
import { useCodeSnippet } from './hooks';
import { CodeContent, CodeLine, TokenizedCodeLine } from './internal';
import { SIZE_LINE_HEIGHT_CLASSES } from './lib/lineStyles';

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
  } = useCodeSnippet();

  const lineHeightClass = SIZE_LINE_HEIGHT_CLASSES[size];

  // Show loading state or plain code if tokens not ready
  if (isLoading || !tokens) {
    const codeLines = code.split('\n');
    return (
      <CodeContent wrapLines={wrapLines} className={className} {...props}>
        {codeLines.map((line, index) => {
          const lineNumber = startingLineNumber + index;
          return (
            <CodeLine
              key={lineNumber}
              lineConfig={lines.get(lineNumber)}
              lineHeightClass={lineHeightClass}
              showInlineGutter={inlineGutter}
              lineNumber={showLineNumbers ? lineNumber : undefined}
            >
              {line}
            </CodeLine>
          );
        })}
      </CodeContent>
    );
  }

  return (
    <CodeContent wrapLines={wrapLines} className={className} {...props}>
      {tokens.map((lineTokens, index) => {
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
