import type { FC } from 'react';
import type { Token } from '../adapters/types';
import type { LineConfig } from '../CodeSnippetContext';
import { getLineTextStyles } from '../lib/lineUtils';
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
