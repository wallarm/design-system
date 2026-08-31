import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  CodeSnippetActions,
  CodeSnippetAdapterProvider,
  CodeSnippetCode,
  CodeSnippetContent,
  CodeSnippetCopyButton,
  CodeSnippetRoot,
  InlineCodeSnippet,
  plainAdapter,
} from '../CodeSnippet';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { Toaster, useToast } from '../Toast';
import { CopyButton } from './CopyButton';

const DESCRIPTION =
  'A button that copies text to the clipboard and shows inline visual feedback — the icon swaps from Copy to Check and the tooltip confirms the action. Use it anywhere a user needs a one-click copy affordance.';

const SAMPLE_TEXT = 'Hello, clipboard!';
const SAMPLE_CODE = 'npx wasd-new@latest add code-snippet';

const meta = {
  title: 'Actions/CopyButton',
  component: CopyButton,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=10915-90702&m=dev',
    },
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    text: { control: 'text' },
    label: { control: 'text' },
    copiedLabel: { control: 'text' },
    tooltipText: { control: 'text' },
    copiedTooltipText: { control: 'text' },
    variant: {
      control: 'select',
      options: ['ghost', 'outline', 'secondary'],
    },
    color: {
      control: 'select',
      options: ['neutral', 'brand'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
  },
  args: {
    text: SAMPLE_TEXT,
  },
} satisfies Meta<typeof CopyButton>;

export default meta;

/**
 * The default icon-only copy button. Click it to copy — the icon swaps from
 * `Copy` to `Check` and the tooltip changes from "Click to copy" to "Copied".
 */
export const Basic: StoryFn<typeof meta> = () => <CopyButton text={SAMPLE_TEXT} />;

/**
 * The two forms side by side: an icon-only button (small, for tight spaces like
 * code snippet headers) and a labelled button (medium, for standalone actions
 * like "Copy code").
 */
export const Types: StoryFn<typeof meta> = () => (
  <HStack align='center' gap={32}>
    <VStack align='center' gap={4}>
      <CopyButton text={SAMPLE_TEXT} size='small' />
    </VStack>
    <VStack align='center' gap={4}>
      <CopyButton text={SAMPLE_TEXT} label='Copy code' size='medium' />
    </VStack>
  </HStack>
);

/**
 * An `InlineCodeSnippet` has built-in click-to-copy with the same tooltip flow
 * — hover shows "Click to copy", click copies and shows "Copied".
 */
export const InInlineCodeSnippet: StoryFn<typeof meta> = () => (
  <VStack align='start' gap={16}>
    <Text size='sm' color='secondary'>
      To start creating an interface, run{' '}
      <InlineCodeSnippet code='npm install @wads/ui' size='md' />
    </Text>
  </VStack>
);
InInlineCodeSnippet.parameters = { layout: 'padded' };

/**
 * Inside a `CodeSnippet`, the `CodeSnippetCopyButton` uses the same copy
 * pattern — icon-only, ghost/neutral, with "Click to copy" / "Copied" tooltip.
 */
export const InCodeSnippet: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={plainAdapter}>
    <CodeSnippetRoot code={SAMPLE_CODE} language='text'>
      <CodeSnippetActions>
        <CodeSnippetCopyButton />
      </CodeSnippetActions>
      <CodeSnippetContent>
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </CodeSnippetAdapterProvider>
);
InCodeSnippet.parameters = { layout: 'padded' };

/**
 * A labelled copy button preserves the width of its idle state so the text
 * swap from "Copy code" to "Copied" doesn't cause layout shift.
 * This pattern can be used on all styles of the buttons.
 */
export const ButtonWithLabel: StoryFn<typeof meta> = () => (
  <VStack align='start' gap={16}>
    <CopyButton text={SAMPLE_TEXT} label='Copy code' copiedLabel='Copied' size='medium' />
  </VStack>
);

/**
 * When the button itself cannot transform (e.g. a context menu item), show a
 * toast to confirm the copy. Click the button to see the "Copied" toast.
 */
export const WithToast: StoryFn<typeof meta> = () => {
  const toast = useToast();

  const handleCopy = () => {
    toast.create({ title: 'Copied', type: 'success', variant: 'simple' });
  };

  return (
    <>
      <Toaster />
      <CopyButton
        text={SAMPLE_TEXT}
        label='Copy code'
        copiedLabel='Copied'
        size='medium'
        onClick={handleCopy}
      />
    </>
  );
};
