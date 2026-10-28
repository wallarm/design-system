import type { FC, HTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import {
  CodeSnippetActions,
  CodeSnippetCode,
  CodeSnippetContent,
  CodeSnippetCopyButton,
  CodeSnippetRoot,
} from '../CodeSnippet';
import { assistantMessageMarkdownCodeBlockVariants } from './classes';

export interface AssistantMessageMarkdownCodeBlockProps
  extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  code: string;
  /** The fence info string (`yaml`, `json`, `bash`, `http`…). The app's adapter resolves aliases; unknown → plain. */
  language?: string;
  /** false while the fence is still open in a streaming answer: plain text (no re-highlight per token) and no
   *  copy button. Default true. */
  complete?: boolean;
}

/**
 * Markdown fenced code (Figma 181:3500: no header, no line numbers, mono 12/20) with a floating copy button.
 * Highlighting follows the app's `CodeSnippetAdapterProvider`; without one the code is plain.
 * The test id goes on the snippet, so its parts cascade: `…--code-block--copy-button`.
 */
export const AssistantMessageMarkdownCodeBlock: FC<AssistantMessageMarkdownCodeBlockProps> = ({
  ref,
  code,
  language,
  complete = true,
  className,
  'data-testid': testIdProp,
  ...props
}) => (
  <div
    {...props}
    ref={ref}
    data-slot='assistant-message-markdown-code-block'
    className={cn(assistantMessageMarkdownCodeBlockVariants(), className)}
  >
    <CodeSnippetRoot
      code={code}
      language={complete && language ? language : 'text'}
      data-testid={useTestId('code-block', testIdProp)}
    >
      {complete && (
        <CodeSnippetActions>
          <CodeSnippetCopyButton />
        </CodeSnippetActions>
      )}
      <CodeSnippetContent>
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </div>
);

AssistantMessageMarkdownCodeBlock.displayName = 'AssistantMessageMarkdownCodeBlock';
