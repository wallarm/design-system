import type { FC } from 'react';
import { cn } from '../../../utils/cn';
import type { LineConfig } from '../CodeSnippetContext';
import { LINE_COLOR_STYLES } from '../lib/lineStyles';

/** Color stick column component - renders color indicators for each line */
export const ColorStickColumn: FC<{
  lineCount: number;
  startingLineNumber: number;
  lines: Map<number, LineConfig>;
  lineHeightClass: string;
}> = ({ lineCount, startingLineNumber, lines, lineHeightClass }) => {
  return (
    <div className='flex flex-col' data-slot='code-snippet-color-stick'>
      {Array.from({ length: lineCount }, (_, index) => {
        const lineNumber = startingLineNumber + index;
        const lineConfig = lines.get(lineNumber);
        const colorStyles = lineConfig?.color ? LINE_COLOR_STYLES[lineConfig.color] : undefined;

        return (
          <span
            key={lineNumber}
            className={cn(
              lineHeightClass,
              'border-l-2 pl-12',
              'bg-bg-primary',
              colorStyles?.border ?? 'border-transparent',
              colorStyles?.bg,
            )}
          />
        );
      })}
    </div>
  );
};
