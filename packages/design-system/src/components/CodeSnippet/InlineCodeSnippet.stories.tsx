import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../Stack';
import { TooltipProvider } from '../Tooltip';
import { InlineCodeSnippet } from './InlineCodeSnippet';

const meta = {
  title: 'Data Display/InlineCodeSnippet',
  component: InlineCodeSnippet,
  decorators: [
    Story => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=3087-29516&m=dev',
    },
    docs: {
      description: {
        component: `
Inline code with **copy-to-clipboard** on click. Wraps [\`Code\`](?path=/docs/typography-code--docs) component.

- Need **just text styling**? Use [\`Code\`](?path=/docs/typography-code--docs)
- Need **syntax highlighting**? Use [\`CodeSnippet\`](?path=/docs/data-display-codesnippet--docs)
                `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InlineCodeSnippet>;

export default meta;

/**
 * Default behavior: The code snippet inherits the font size from the surrounding text
 * and is copyable by default. Hover to see "Click to copy" tooltip, click to copy.
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
 * Explicit sizes: sm, md, lg - use these when you need a specific size.
 */
export const Sizes: StoryFn<typeof meta> = () => (
  <VStack align='start' spacing={16}>
    <VStack align='start' spacing={4}>
      <span className='text-xs text-text-secondary font-medium'>sm</span>
      <div className='text-xs text-text-primary'>
        To start creating an interface, run{' '}
        <InlineCodeSnippet code='npm install @wads/ui' size='sm' /> and then apply the following...
      </div>
    </VStack>
    <VStack align='start' spacing={4}>
      <span className='text-xs text-text-secondary font-medium'>md</span>
      <div className='text-sm text-text-primary'>
        To start creating an interface, run{' '}
        <InlineCodeSnippet code='npm install @wads/ui' size='md' /> and then apply the following...
      </div>
    </VStack>
    <VStack align='start' spacing={4}>
      <span className='text-xs text-text-secondary font-medium'>lg</span>
      <div className='text-base text-text-primary'>
        To start creating an interface, run{' '}
        <InlineCodeSnippet code='npm install @wads/ui' size='lg' /> and then apply the following...
      </div>
    </VStack>
  </VStack>
);

/**
 * Non-copyable: Set `copyable={false}` to disable copy functionality.
 * No tooltip will be shown and the cursor will be default.
 */
export const NonCopyable: StoryFn<typeof meta> = () => (
  <p className='text-sm text-text-primary'>
    This code is not copyable: <InlineCodeSnippet code='npm install @wads/ui' copyable={false} />
  </p>
);

export const VariousContent: StoryFn<typeof meta> = () => (
  <VStack align='start'>
    <InlineCodeSnippet code='npm install' />
    <InlineCodeSnippet code='curl -X POST https://api.wallarm.com' />
    <InlineCodeSnippet code='{"status": "ok"}' />
    <InlineCodeSnippet code='SELECT * FROM users WHERE id = 1' />
    <InlineCodeSnippet code="git commit -m 'feat: add feature'" />
  </VStack>
);
