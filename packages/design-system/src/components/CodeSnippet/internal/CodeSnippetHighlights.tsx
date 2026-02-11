import type { FC } from 'react';
import { cn } from '../../../utils/cn';
import { useCodeSnippet } from '../hooks';
import { LINE_COLOR_STYLES, SIZE_LINE_HEIGHT_CLASSES } from '../lib/lineStyles';

/** Internal component for rendering highlight backgrounds */
export const CodeSnippetHighlights: FC = () => {
  const { tokens, code, startingLineNumber, lines, size } = useCodeSnippet();

  const lineCount = tokens?.length ?? code.split('\n').length;
  const lineHeightClass = SIZE_LINE_HEIGHT_CLASSES[size];

  return (
    <div
      data-slot='code-snippet-highlights'
      className='absolute inset-0 z-0 flex flex-col py-8 pointer-events-none'
      aria-hidden='true'
    >
      {Array.from({ length: lineCount }, (_, index) => {
        const lineNumber = startingLineNumber + index;
        const lineConfig = lines.get(lineNumber);
        const colorStyles = lineConfig?.color ? LINE_COLOR_STYLES[lineConfig.color] : null;

        return <div key={lineNumber} className={cn(lineHeightClass, colorStyles?.bg)} />;
      })}
    </div>
  );
};

CodeSnippetHighlights.displayName = 'CodeSnippetHighlights';
