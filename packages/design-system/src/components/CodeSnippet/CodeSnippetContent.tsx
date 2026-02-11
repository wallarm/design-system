import {
  Children,
  type FC,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type Ref,
  useMemo,
} from 'react';
import { cn } from '../../utils/cn';
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaViewport,
} from '../ScrollArea';
import { CodeSnippetContext } from './CodeSnippetContext';
import { useCodeSnippet } from './hooks';
import { CodeSnippetHighlights } from './internal/CodeSnippetHighlights';
import { ColorStickColumn } from './internal/ColorStickColumn';
import { PrefixColumn } from './internal/PrefixColumn';
import { SIZE_LINE_HEIGHT_CLASSES } from './lib/lineStyles';

export type CodeSnippetContentProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>;
  /**
   * Use native browser scroll instead of ScrollArea.
   * @temporary This is a temporary prop while ScrollArea is unstable.
   * @default false
   */
  nativeScroll?: boolean;
};

export const CodeSnippetContent: FC<CodeSnippetContentProps> = ({
  className,
  children,
  nativeScroll = false,
  ...props
}) => {
  const context = useCodeSnippet();
  const { wrapLines, lines, tokens, code, startingLineNumber, size } = context;

  const hasHighlights = Array.from(lines.values()).some(config => config.color != null);
  const hasAnyPrefix = Array.from(lines.values()).some(config => config.prefix != null);
  const lineCount = tokens?.length ?? code.split('\n').length;
  const lineHeightClass = SIZE_LINE_HEIGHT_CLASSES[size];

  // Separate line numbers from other children
  const childrenArray = Children.toArray(children);
  const lineNumbersElement = childrenArray.find(
    (child): child is ReactElement =>
      isValidElement(child) &&
      (child.type as { displayName?: string })?.displayName === 'CodeSnippetLineNumbers',
  );
  const otherChildren = childrenArray.filter(
    child =>
      !isValidElement(child) ||
      (child.type as { displayName?: string })?.displayName !== 'CodeSnippetLineNumbers',
  );

  const hasLineNumbers = Boolean(lineNumbersElement);
  // When wrapLines is true, render gutter elements (color stick, line numbers, prefix) inline with each code line
  const useInlineGutter = wrapLines;
  // Gutter column only needed when NOT wrapping
  const hasGutter = !wrapLines && (hasHighlights || hasLineNumbers || hasAnyPrefix);

  // Override context to enable inline gutter and line numbers when wrapping
  const overriddenContext = useMemo(
    () => ({
      ...context,
      inlineGutter: useInlineGutter,
      showLineNumbers: hasLineNumbers,
    }),
    [context, useInlineGutter, hasLineNumbers],
  );

  const innerContent = (
    <div className='relative inline-flex min-w-full py-8'>
      {/* Background highlights only shown when not wrapping (separate column) */}
      {!wrapLines && hasHighlights && <CodeSnippetHighlights />}
      {hasGutter && (
        <div
          data-slot='code-snippet-gutter'
          className='sticky left-0 z-20 flex shrink-0 py-8 -my-8 mr-8 bg-bg-primary'
        >
          {hasHighlights && (
            <ColorStickColumn
              lineCount={lineCount}
              startingLineNumber={startingLineNumber}
              lines={lines}
              lineHeightClass={lineHeightClass}
            />
          )}
          {lineNumbersElement}
          {hasAnyPrefix && (
            <PrefixColumn
              lineCount={lineCount}
              startingLineNumber={startingLineNumber}
              lines={lines}
              lineHeightClass={lineHeightClass}
            />
          )}
        </div>
      )}
      <div
        className={cn(
          'relative z-10 flex flex-1 min-w-0 pr-12',
          !hasGutter && !useInlineGutter && 'pl-12',
        )}
      >
        <CodeSnippetContext.Provider value={overriddenContext}>
          {otherChildren}
        </CodeSnippetContext.Provider>
      </div>
    </div>
  );

  if (nativeScroll) {
    return (
      <div
        data-slot='code-snippet-content'
        className={cn(
          'min-h-0',
          wrapLines ? 'overflow-y-auto overflow-x-hidden' : 'overflow-auto',
          className,
        )}
        {...props}
      >
        {innerContent}
      </div>
    );
  }

  return (
    <div data-slot='code-snippet-content' className={cn('min-h-0', className)} {...props}>
      <ScrollArea>
        <ScrollAreaViewport>
          <ScrollAreaContent>{innerContent}</ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation='horizontal' />
        <ScrollAreaScrollbar orientation='vertical' />
        <ScrollAreaCorner />
      </ScrollArea>
    </div>
  );
};

CodeSnippetContent.displayName = 'CodeSnippetContent';
