import type { FC } from 'react';
import { cn } from '../../../utils/cn';
import type { LineConfig } from '../CodeSnippetContext';
import type { DisplayItem } from '../lib/foldUtils';
import { LINE_COLOR_STYLES } from '../lib/lineStyles';

/** Prefix column component - renders all line prefixes in a separate column */
export const PrefixColumn: FC<{
  visibleDisplayItems: DisplayItem[];
  lines: Map<number, LineConfig>;
  lineHeightClass: string;
}> = ({ visibleDisplayItems, lines, lineHeightClass }) => {
  return (
    <div className='flex flex-col select-none' data-slot='code-snippet-prefix'>
      {visibleDisplayItems.map(item => {
        if (item.type === 'fold-summary') {
          return (
            <span
              key={`fold-${item.fold.id}`}
              className={cn(lineHeightClass, 'px-8 text-center')}
            />
          );
        }

        const lineConfig = lines.get(item.lineNumber);
        const colorStyles = lineConfig?.color ? LINE_COLOR_STYLES[lineConfig.color] : undefined;

        return (
          <span
            key={item.lineNumber}
            className={cn(lineHeightClass, 'px-8 text-center', colorStyles?.text, colorStyles?.bg)}
          >
            {lineConfig?.prefix}
          </span>
        );
      })}
    </div>
  );
};
