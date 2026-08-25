import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../Stack';
import { InlineCodeSnippet } from './InlineCodeSnippet';

const DESCRIPTION = [
  'A fragment of code inside a sentence, copied by clicking it — reach for `Code` when the text only needs the mono treatment, and `CodeSnippet` when it needs syntax highlighting, a header or line numbers.',
  'It takes its size from the text around it, so a snippet in a caption stays the size of the caption; keep it to a single line so the sentence still reads.',
].join(' ');

const meta = {
  title: 'Data Display/CodeSnippet/InlineCodeSnippet',
  component: InlineCodeSnippet,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=3087-29516&m=dev',
    },
    docs: { description: { component: DESCRIPTION } },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InlineCodeSnippet>;

export default meta;

/**
 * One snippet in three sentence sizes: `size='inherit'`, the default, scales the type
 * and the padding with whatever it sits in, and hovering offers the copy.
 */
export const Default: StoryFn<typeof meta> = () => (
  <VStack align='start'>
    <p className='text-xs text-text-primary'>
      Small text: Run <InlineCodeSnippet code='npm install @wads/ui' /> to install dependencies.
    </p>
    <p className='text-sm text-text-primary'>
      Medium text: Run <InlineCodeSnippet code='npm install @wads/ui' /> to install dependencies.
    </p>
    <p className='text-base text-text-primary'>
      Large text: Run <InlineCodeSnippet code='npm install @wads/ui' /> to install dependencies.
    </p>
  </VStack>
);

/**
 * The three fixed sizes, each beside the text size it pairs with — set one when the
 * snippet must hold its size regardless of its surroundings.
 */
export const Sizes: StoryFn<typeof meta> = () => (
  <VStack align='start' gap={16}>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>sm</span>
      <div className='text-xs text-text-primary'>
        To start creating an interface, run{' '}
        <InlineCodeSnippet code='npm install @wads/ui' size='sm' /> and then apply the following...
      </div>
    </VStack>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>md</span>
      <div className='text-sm text-text-primary'>
        To start creating an interface, run{' '}
        <InlineCodeSnippet code='npm install @wads/ui' size='md' /> and then apply the following...
      </div>
    </VStack>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>lg</span>
      <div className='text-base text-text-primary'>
        To start creating an interface, run{' '}
        <InlineCodeSnippet code='npm install @wads/ui' size='lg' /> and then apply the following...
      </div>
    </VStack>
  </VStack>
);

/**
 * `copyable={false}` takes the tooltip and the pointer cursor away with the copy, for a
 * snippet that is only being named rather than reused.
 */
export const NonCopyable: StoryFn<typeof meta> = () => (
  <p className='text-sm text-text-primary'>
    This code is not copyable: <InlineCodeSnippet code='npm install @wads/ui' copyable={false} />
  </p>
);

/**
 * Commands, JSON, SQL and a quoted message all render in one colour — inline code gets
 * the mono treatment and nothing else.
 */
export const VariousContent: StoryFn<typeof meta> = () => (
  <VStack align='start'>
    <InlineCodeSnippet code='npm install' />
    <InlineCodeSnippet code='curl -X POST https://api.wallarm.com' />
    <InlineCodeSnippet code='{"status": "ok"}' />
    <InlineCodeSnippet code='SELECT * FROM users WHERE id = 1' />
    <InlineCodeSnippet code="git commit -m 'feat: add feature'" />
  </VStack>
);
