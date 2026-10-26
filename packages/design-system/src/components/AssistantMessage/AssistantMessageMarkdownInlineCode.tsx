import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { InlineCodeSnippet, type InlineCodeSnippetProps } from '../CodeSnippet';
import type { AssistantMessageMarkdownVariant } from './AssistantMessageMarkdown';
import { assistantMessageMarkdownInlineCodeVariants } from './classes';

export interface AssistantMessageMarkdownInlineCodeProps
  extends Omit<InlineCodeSnippetProps, 'size' | 'asChild' | 'children'>, TestableProps {
  /** 'chain-of-thought' mutes the colour and turns copy off (Figma 494:4292). Default 'answer'. */
  variant?: AssistantMessageMarkdownVariant;
}

/** Markdown inline code: `InlineCodeSnippet size='sm'`. The renderer also turns copy off inside a link. */
export const AssistantMessageMarkdownInlineCode: FC<AssistantMessageMarkdownInlineCodeProps> = ({
  variant = 'answer',
  copyable,
  className,
  'data-testid': testIdProp,
  ...props
}) => (
  <InlineCodeSnippet
    {...props}
    size='sm'
    copyable={copyable ?? variant !== 'chain-of-thought'}
    data-testid={useTestId('inline-code', testIdProp)}
    className={cn(
      assistantMessageMarkdownInlineCodeVariants({ muted: variant === 'chain-of-thought' }),
      className,
    )}
  />
);

AssistantMessageMarkdownInlineCode.displayName = 'AssistantMessageMarkdownInlineCode';
