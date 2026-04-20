import type { FC, HTMLAttributes, Ref } from 'react';
import { useMemo } from 'react';
import { useTestId } from '../../utils/testId';
import { useCodeSnippet } from './hooks';
import { CodeContent, CodeLine, TokenizedCodeLine } from './internal';
import type { DisplayItem } from './lib/foldUtils';
import { getFoldSummaryLabel } from './lib/foldUtils';
import { computeFoldGuides } from './lib/indentUtils';
import { SIZE_LINE_HEIGHT_CLASSES } from './lib/lineStyles';
import { splitTextByRanges } from './lib/lineUtils';

export type CodeSnippetCodeProps = HTMLAttributes<HTMLPreElement> & {
  ref?: Ref<HTMLPreElement>;
};

export const CodeSnippetCode: FC<CodeSnippetCodeProps> = ({ className, ...props }) => {
  const testId = useTestId('code');
  const {
    code,
    tokens,
    isLoading,
    wrapLines,
    lines,
    size,
    inlineGutter,
    showLineNumbers,
    startingLineNumber,
    visibleDisplayItems,
    folds,
    foldByStartLine,
    collapsedFolds,
    toggleFold,
  } = useCodeSnippet();

  const lineHeightClass = SIZE_LINE_HEIGHT_CLASSES[size];
  const hasFolds = folds.length > 0;

  // Compute header indent + guide range for every fold once. Used for both
  // the vertical guide overlay and the collapsed summary's left offset.
  const foldGuides = useMemo(
    () => (hasFolds ? computeFoldGuides(code, folds, startingLineNumber) : null),
    [hasFolds, code, folds, startingLineNumber],
  );

  // Guides are fold-driven. Disabled in wrap mode because absolute
  // positioning would paint across wrapped rows.
  const guidesActive = hasFolds && !wrapLines;

  const getGuideColumns = (lineNumber: number): number[] | undefined => {
    if (!guidesActive || !foldGuides) return undefined;
    const cols: number[] = [];
    for (const fold of folds) {
      const guide = foldGuides.get(fold.id);
      if (!guide) continue;
      if (lineNumber >= guide.firstLine && lineNumber <= guide.lastLine) {
        cols.push(guide.column);
      }
    }
    return cols.length > 0 ? cols : undefined;
  };

  const getFoldProps = (lineNumber: number) => {
    if (!inlineGutter || !hasFolds) return {};
    const fold = foldByStartLine.get(lineNumber);
    return {
      fold,
      isFoldCollapsed: fold ? collapsedFolds.has(fold.id) : undefined,
      onFoldToggle: fold ? () => toggleFold(fold.id) : undefined,
      hasFolds: true,
    };
  };

  const renderFoldSummary = (item: Extract<DisplayItem, { type: 'fold-summary' }>) => {
    const label = getFoldSummaryLabel(item.fold, item.lineCount);
    const headerIndent = foldGuides?.get(item.fold.id)?.headerIndent ?? 0;
    return (
      <CodeLine
        key={`fold-${item.fold.id}`}
        lineConfig={undefined}
        lineHeightClass={lineHeightClass}
        showInlineGutter={inlineGutter}
        lineNumber={showLineNumbers ? item.fold.startLine : undefined}
        fold={inlineGutter ? item.fold : undefined}
        isFoldCollapsed={inlineGutter || undefined}
        onFoldToggle={inlineGutter ? () => toggleFold(item.fold.id) : undefined}
        hasFolds={inlineGutter && hasFolds}
      >
        <button
          type='button'
          className='inline-flex items-center cursor-pointer select-none'
          style={headerIndent > 0 ? { marginLeft: `${headerIndent}ch` } : undefined}
          aria-expanded={false}
          aria-label={`Collapsed region: ${label}, ${item.lineCount} lines`}
          onClick={() => toggleFold(item.fold.id)}
        >
          <span className='inline-flex items-center italic text-text-secondary hover:text-text-primary transition-colors'>
            {label}
          </span>
        </button>
      </CodeLine>
    );
  };

  // Show loading state or plain code if tokens not ready
  if (isLoading || !tokens) {
    const codeLines = code.split('\n');
    return (
      <CodeContent wrapLines={wrapLines} className={className} {...props} data-testid={testId}>
        {visibleDisplayItems.map(item => {
          if (item.type === 'fold-summary') return renderFoldSummary(item);
          const line = codeLines[item.index] ?? '';
          const lineConfig = lines.get(item.lineNumber);
          const ranges = lineConfig?.ranges;
          const hasRanges = ranges && ranges.length > 0;

          return (
            <CodeLine
              key={item.lineNumber}
              lineConfig={lineConfig}
              lineHeightClass={lineHeightClass}
              showInlineGutter={inlineGutter}
              lineNumber={showLineNumbers ? item.lineNumber : undefined}
              guideColumns={getGuideColumns(item.lineNumber)}
              {...getFoldProps(item.lineNumber)}
            >
              {hasRanges
                ? splitTextByRanges(line, ranges, lineConfig?.color).map((segment, i) => (
                    <span key={i} className={segment.rangeColor}>
                      {segment.content}
                    </span>
                  ))
                : line}
            </CodeLine>
          );
        })}
      </CodeContent>
    );
  }

  return (
    <CodeContent wrapLines={wrapLines} className={className} {...props} data-testid={testId}>
      {visibleDisplayItems.map(item => {
        if (item.type === 'fold-summary') return renderFoldSummary(item);
        const lineTokens = tokens[item.index];
        if (!lineTokens) return null;
        return (
          <TokenizedCodeLine
            key={item.lineNumber}
            tokens={lineTokens}
            lineConfig={lines.get(item.lineNumber)}
            lineHeightClass={lineHeightClass}
            showInlineGutter={inlineGutter}
            lineNumber={showLineNumbers ? item.lineNumber : undefined}
            guideColumns={getGuideColumns(item.lineNumber)}
            {...getFoldProps(item.lineNumber)}
          />
        );
      })}
    </CodeContent>
  );
};

CodeSnippetCode.displayName = 'CodeSnippetCode';
