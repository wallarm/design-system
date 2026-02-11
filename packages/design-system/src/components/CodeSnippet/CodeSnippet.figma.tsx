import figma from '@figma/code-connect';
import { CodeSnippetCode } from './CodeSnippetCode';
import { CodeSnippetContent } from './CodeSnippetContent';
import { CodeSnippetLineNumbers } from './CodeSnippetLineNumbers';
import { CodeSnippetRoot } from './CodeSnippetRoot';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=3087-29516';

figma.connect(CodeSnippetRoot, figmaNodeUrl, {
  props: {
    code: figma.string('Code'),
    size: figma.enum('Size', {
      sm: 'sm',
      md: 'md',
      lg: 'lg',
    }),
    showLineNumbers: figma.boolean('Show Line Numbers', {
      true: true,
      false: false,
    }),
  },
  example: ({ code, size, showLineNumbers }) => (
    <CodeSnippetRoot code={code} language='text' size={size}>
      <CodeSnippetContent>
        {showLineNumbers && <CodeSnippetLineNumbers />}
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  ),
});
