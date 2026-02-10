import type { FC } from 'react';
import type { Token } from '../adapters/types';
import type { LineConfig } from '../CodeSnippetContext';
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
};

/** Renders a line of tokenized code with syntax highlighting */
export const TokenizedCodeLine: FC<TokenizedCodeLineProps> = ({
  tokens,
  lineConfig,
  lineHeightClass,
  showInlineGutter,
  lineNumber,
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
    >
      {tokens.map((token, i) => (
        <CodeToken key={i} token={token} colorClass={colorClass} />
      ))}
    </CodeLine>
  );
};

TokenizedCodeLine.displayName = 'TokenizedCodeLine';
