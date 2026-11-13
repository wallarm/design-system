import * as z from 'zod';
import {
  CodeSnippetActions,
  CodeSnippetAdapterProvider,
  CodeSnippetCode,
  CodeSnippetContent,
  CodeSnippetCopyButton,
  CodeSnippetHeader,
  CodeSnippetRoot,
  CodeSnippetTitle,
  loadPrismAdapter,
  type PlainLanguage,
  type PrismLanguage,
} from '@wallarm-org/design-system/CodeSnippet';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { defineComponent, subsetOf } from '../core/define';

const LANGUAGES = subsetOf<PrismLanguage | PlainLanguage>()([
  'text',
  'http',
  'json',
  'yaml',
  'xml',
  'bash',
  'javascript',
  'python',
  'sql',
]);

export const CodeSnippetComponent = defineComponent({
  name: 'CodeSnippet',
  description:
    'Read-only multi-line code to read and copy: an HTTP request or response, a payload, a JSON body, a rule or a config. For a short inline value use a Table code column instead.',
  props: z.object({
    code: z.string().min(1).describe('The code, lines joined by \\n'),
    language: z.enum(LANGUAGES).optional().describe('Highlighting; default text'),
    title: z.string().optional().describe('E.g. a file name or "Request"'),
    maxLines: z.number().int().min(1).optional().describe('Collapse after this many lines'),
    wrapLines: z.boolean().optional().describe('Wrap long lines instead of scrolling'),
  }),
  Skeleton: () => <Skeleton width='100%' height='160px' rounded={8} transparent={false} />,
  // Prism tokens render as React text, never HTML; the adapter loads lazily and the code shows
  // plain until it arrives.
  View: ({ props }) => (
    <CodeSnippetAdapterProvider adapter={loadPrismAdapter}>
      {/* The DS reads wrapLines once into state; remount so a streamed or updated value applies. */}
      <CodeSnippetRoot
        key={String(props.wrapLines ?? false)}
        code={props.code}
        language={props.language ?? 'text'}
        maxLines={props.maxLines}
        wrapLines={props.wrapLines}
      >
        {props.title ? (
          <CodeSnippetHeader>
            <CodeSnippetTitle>{props.title}</CodeSnippetTitle>
            <CodeSnippetActions>
              <CodeSnippetCopyButton />
            </CodeSnippetActions>
          </CodeSnippetHeader>
        ) : (
          <CodeSnippetActions>
            <CodeSnippetCopyButton />
          </CodeSnippetActions>
        )}
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>
    </CodeSnippetAdapterProvider>
  ),
});
