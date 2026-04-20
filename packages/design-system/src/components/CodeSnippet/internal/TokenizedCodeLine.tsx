import type { FC } from 'react';
import type { Token } from '../adapters/types';
import type { LineConfig } from '../CodeSnippetContext';
import type { FoldRegion } from '../lib/foldUtils';
import { getLineTextStyles, splitTokensByRanges } from '../lib/lineUtils';
import { CodeLine } from './CodeLine';
import { CodeToken } from './CodeToken';

export type TokenizedCodeLineProps = {
  tokens: Token[];
  lineConfig: LineConfig | undefined;
  lineHeightClass: string;
  /** Show inline gutter elements (color stick, line number, prefix) - used when wrapLines is true */
  showInlineGutter?: boolean;
  /** Line number to display (only shown when showInlineGutter is true) */
  lineNumber?: number;
  /** Fold region starting at this line */
  fold?: FoldRegion;
  /** Whether the fold is collapsed */
  isFoldCollapsed?: boolean;
  /** Callback to toggle the fold */
  onFoldToggle?: () => void;
  /** Whether any folds exist */
  hasFolds?: boolean;
  /** Columns (in monospace chars) where fold guide lines should render. */
  guideColumns?: number[];
};

/** Renders a line of tokenized code with syntax highlighting */
export const TokenizedCodeLine: FC<TokenizedCodeLineProps> = ({
  tokens,
  lineConfig,
  lineHeightClass,
  showInlineGutter,
  lineNumber,
  fold,
  isFoldCollapsed,
  onFoldToggle,
  hasFolds,
  guideColumns,
}) => {
  const { colorClass } = getLineTextStyles(lineConfig);
  const ranges = lineConfig?.ranges;
  const hasRanges = ranges && ranges.length > 0;

  if (hasRanges) {
    const enrichedTokens = splitTokensByRanges(tokens, ranges, lineConfig?.color);
    return (
      <CodeLine
        lineConfig={lineConfig}
        lineHeightClass={lineHeightClass}
        showInlineGutter={showInlineGutter}
        lineNumber={lineNumber}
        fold={fold}
        isFoldCollapsed={isFoldCollapsed}
        onFoldToggle={onFoldToggle}
        hasFolds={hasFolds}
        guideColumns={guideColumns}
      >
        {enrichedTokens.map((token, i) => (
          <CodeToken
            key={i}
            token={token}
            colorClass={colorClass}
            rangeColorClass={token.rangeColor}
          />
        ))}
      </CodeLine>
    );
  }

  return (
    <CodeLine
      lineConfig={lineConfig}
      lineHeightClass={lineHeightClass}
      showInlineGutter={showInlineGutter}
      lineNumber={lineNumber}
      fold={fold}
      isFoldCollapsed={isFoldCollapsed}
      onFoldToggle={onFoldToggle}
      hasFolds={hasFolds}
      guideColumns={guideColumns}
    >
      {tokens.map((token, i) => (
        <CodeToken key={i} token={token} colorClass={colorClass} />
      ))}
    </CodeLine>
  );
};

TokenizedCodeLine.displayName = 'TokenizedCodeLine';
