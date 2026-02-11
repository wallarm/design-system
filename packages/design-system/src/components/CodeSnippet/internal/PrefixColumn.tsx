import type { FC } from 'react';
import { cn } from '../../../utils/cn';
import type { LineConfig } from '../CodeSnippetContext';
import { LINE_COLOR_STYLES } from '../lib/lineStyles';

/** Prefix column component - renders all line prefixes in a separate column */
export const PrefixColumn: FC<{
  lineCount: number;
  startingLineNumber: number;
  lines: Map<number, LineConfig>;
  lineHeightClass: string;
}> = ({ lineCount, startingLineNumber, lines, lineHeightClass }) => {
  return (
    <div className='flex flex-col select-none' data-slot='code-snippet-prefix'>
      {Array.from({ length: lineCount }, (_, index) => {
        const lineNumber = startingLineNumber + index;
        const lineConfig = lines.get(lineNumber);
        const colorStyles = lineConfig?.color ? LINE_COLOR_STYLES[lineConfig.color] : undefined;

        return (
          <span
            key={lineNumber}
            className={cn(
              lineHeightClass,
              'px-8 text-center bg-bg-primary',
              colorStyles?.text,
              colorStyles?.bg,
            )}
          >
            {lineConfig?.prefix}
          </span>
        );
      })}
    </div>
  );
};
