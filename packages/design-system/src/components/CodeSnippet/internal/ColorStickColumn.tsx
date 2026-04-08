import type { FC } from 'react';
import { cn } from '../../../utils/cn';
import type { LineConfig } from '../CodeSnippetContext';
import type { DisplayItem } from '../lib/foldUtils';
import { LINE_COLOR_STYLES } from '../lib/lineStyles';

/** Color stick column component - renders color indicators for each line */
export const ColorStickColumn: FC<{
  visibleDisplayItems: DisplayItem[];
  lines: Map<number, LineConfig>;
  lineHeightClass: string;
}> = ({ visibleDisplayItems, lines, lineHeightClass }) => {
  return (
    <div className='flex flex-col' data-slot='code-snippet-color-stick'>
      {visibleDisplayItems.map(item => {
        if (item.type === 'fold-summary') {
          return (
            <span
              key={`fold-${item.fold.id}`}
              className={cn(lineHeightClass, 'border-l-2 pl-12 border-transparent')}
            />
          );
        }
        const lineConfig = lines.get(item.lineNumber);
        const colorStyles = lineConfig?.color ? LINE_COLOR_STYLES[lineConfig.color] : undefined;

        return (
          <span
            key={item.lineNumber}
            className={cn(
              lineHeightClass,
              'border-l-2 pl-12',
              colorStyles?.border ?? 'border-transparent',
              colorStyles?.bg,
            )}
          />
        );
      })}
    </div>
  );
};
