import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useCodeSnippet } from './hooks';
import { LINE_COLOR_STYLES, SIZE_LINE_HEIGHT_CLASSES } from './lib/lineStyles';

export type CodeSnippetLineNumbersProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>;
};

export const CodeSnippetLineNumbers: FC<CodeSnippetLineNumbersProps> = ({
  className,
  ...props
}) => {
  const testId = useTestId('line-numbers');
  const { tokens, visibleDisplayItems, lines, size } = useCodeSnippet();

  const lineHeightClass = SIZE_LINE_HEIGHT_CLASSES[size];

  if (!tokens) {
    return null;
  }

  return (
    <div
      data-slot='code-snippet-line-numbers'
      data-testid={testId}
      className={cn('flex flex-col text-text-secondary select-none text-right', className)}
      {...props}
    >
      {visibleDisplayItems.map(item => {
        if (item.type === 'fold-summary') {
          return (
            <span key={`fold-${item.fold.id}`} className={cn(lineHeightClass, 'px-8')}>
              {item.fold.startLine}
            </span>
          );
        }
        const lineConfig = lines.get(item.lineNumber);
        const colorStyles = lineConfig?.color ? LINE_COLOR_STYLES[lineConfig.color] : undefined;

        return (
          <span
            key={item.lineNumber}
            className={cn(lineHeightClass, 'px-8', colorStyles?.text, colorStyles?.bg)}
          >
            {item.lineNumber}
          </span>
        );
      })}
    </div>
  );
};

CodeSnippetLineNumbers.displayName = 'CodeSnippetLineNumbers';
