import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Copy } from '../../../icons';
import { Attribute, AttributeLabel, AttributeValue } from '../../Attribute';
import { Button } from '../../Button';
import {
  CodeSnippetActions,
  CodeSnippetAdapterProvider,
  CodeSnippetCode,
  CodeSnippetContent,
  CodeSnippetCopyButton,
  CodeSnippetRoot,
  InlineCodeSnippet,
  plainAdapter,
} from '../../CodeSnippet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemText,
  DropdownMenuTrigger,
} from '../../DropdownMenu';
import {
  createListCollection,
  Select,
  SelectButton,
  SelectContent,
  SelectOption,
  SelectOptionText,
  SelectPositioner,
} from '../../Select';
import { HStack, VStack } from '../../Stack';
import { Text } from '../../Text';
import { Toaster, toaster } from '../../Toast';
import { Copyable } from '../Copyable';
import { CopyableIcon } from '../CopyableIcon';
import { CopyableLabel } from '../CopyableLabel';

const DESCRIPTION = [
  'Click-to-copy is a **behaviour pattern**, not a component.',
  'Any existing element — a Button, InlineCodeSnippet, Attribute value, table cell, or DropdownMenuItem — copies a value on click and confirms it.',
  '',
  '### Feedback rules',
  '',
  '1. **Element can change itself** (button, icon button, code snippet action): swap in place. Copy icon → Check, label "Copy code" → "Copied" at the idle width, tooltip "Click to copy" → "Copied".',
  '2. **Clickable text without an icon** (inline code snippet, a value): tooltip only.',
  '3. **Element disappears after the action or has nothing to transform** (menu item): toast "Copied".',
  '',
  'Never two feedbacks at once. Copied state resets after ~2 s.',
].join('\n');

const SAMPLE_TEXT = 'Hello, clipboard!';
const SAMPLE_CODE = 'npx wasd-new@latest add code-snippet';

const meta = {
  title: 'Patterns/Click to Copy',
  component: Copyable,
  subcomponents: { CopyableIcon, CopyableLabel },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <>
        <Toaster />
        <Story />
      </>
    ),
  ],
} satisfies Meta<typeof Copyable>;

export default meta;

/**
 * A ghost icon-only button — the most compact form. The icon swaps from
 * `Copy` to `Check` and the tooltip changes from "Click to copy" to "Copied".
 */
export const IconButton: StoryFn<typeof meta> = () => (
  <Copyable text={SAMPLE_TEXT} tooltip>
    <Button variant='ghost' color='neutral' size='small' aria-label='Copy'>
      <CopyableIcon />
    </Button>
  </Copyable>
);

/**
 * A labelled button using `CopyableLabel` for width-stable text swap.
 * The wrapper always occupies the width of the wider label, preventing
 * layout shift when the text toggles between "Copy code" and "Copied".
 */
export const LabelledButton: StoryFn<typeof meta> = () => (
  <VStack align='start' gap={16}>
    <Copyable text={SAMPLE_TEXT} tooltip>
      <Button variant='secondary' size='medium'>
        <CopyableIcon /> <CopyableLabel idle='Copy code' copied='Copied' />
      </Button>
    </Copyable>
    <Copyable text={SAMPLE_TEXT} tooltip>
      <Button variant='ghost' color='neutral' size='medium'>
        <CopyableIcon /> <CopyableLabel idle='Copy link' copied='Copied' />
      </Button>
    </Copyable>
  </VStack>
);

/**
 * `InlineCodeSnippet` has built-in click-to-copy with tooltip-only feedback
 * (feedback rule 2 — clickable text without an icon).
 */
export const InInlineCodeSnippet: StoryFn<typeof meta> = () => (
  <Text size='sm' color='secondary'>
    To start creating an interface, run <InlineCodeSnippet code='npm install @wads/ui' size='md' />
  </Text>
);
InInlineCodeSnippet.parameters = { layout: 'padded' };

/**
 * Inside a `CodeSnippet`, the `CodeSnippetCopyButton` uses the Copyable
 * pattern internally — icon-only, ghost/neutral, with tooltip feedback.
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
 * A plain text value wrapped in `Copyable` with tooltip feedback (feedback
 * rule 2). This is the pattern for Attribute values or any non-interactive
 * text that should be copyable on click.
 */
export const ValueText: StoryFn<typeof meta> = () => {
  const value = '192.168.1.1';

  return (
    <Attribute>
      <AttributeLabel>IP Address</AttributeLabel>
      <AttributeValue>
        <Copyable text={value} tooltip>
          <Text
            size='sm'
            className='cursor-pointer hover:bg-states-primary-hover active:bg-states-primary-pressed rounded-6 -mx-4 px-4'
          >
            {value}
          </Text>
        </Copyable>
      </AttributeValue>
    </Attribute>
  );
};

/**
 * When the element disappears after the action (like a dropdown menu item),
 * use toast feedback via `onCopied` (feedback rule 3). The `Copyable`
 * component does not bake in toast — the consumer fires it from the callback.
 */
export const DropdownMenuItemWithToast: StoryFn<typeof meta> = () => {
  const handleCopied = () => {
    toaster.create({ title: 'Copied', type: 'default', variant: 'simple' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' color='neutral'>
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Copyable text={SAMPLE_TEXT} onCopied={handleCopied}>
          <DropdownMenuItem>
            <DropdownMenuItemIcon>
              <Copy />
            </DropdownMenuItemIcon>
            <DropdownMenuItemText>Copy value</DropdownMenuItemText>
          </DropdownMenuItem>
        </Copyable>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * A Select option that copies on select — same toast feedback pattern as the
 * dropdown menu item (feedback rule 3).
 */
export const SelectMenuItemWithToast: StoryFn<typeof meta> = () => {
  const endpoints = [
    'GET /api/users',
    'POST /api/users',
    'GET /api/users/:id',
    'DELETE /api/users/:id',
  ];

  const collection = createListCollection({
    items: endpoints.map(e => ({ label: e, value: e })),
  });

  const [value, setValue] = useState<string[]>([]);

  const handleValueChange = (details: { value: string[] }) => {
    const selected = details.value[0];
    if (selected) {
      navigator.clipboard.writeText(selected);
      toaster.create({ title: 'Copied', type: 'default', variant: 'simple' });
    }
    // Reset so the select doesn't hold a value — it acts as a copy trigger
    setValue([]);
  };

  return (
    <Select
      collection={collection}
      value={value}
      onValueChange={handleValueChange}
      positioning={{ placement: 'bottom-start' }}
    >
      <SelectButton placeholder='Select endpoint to copy' style={{ width: 280 }} />
      <SelectPositioner>
        <SelectContent>
          {endpoints.map(ep => (
            <SelectOption key={ep} item={{ label: ep, value: ep }}>
              <SelectOptionText>{ep}</SelectOptionText>
            </SelectOption>
          ))}
        </SelectContent>
      </SelectPositioner>
    </Select>
  );
};

/**
 * All recipes side-by-side for comparison. The three feedback types —
 * in-place swap, tooltip-only, and toast — are shown together.
 */
export const AllRecipes: StoryFn<typeof meta> = () => {
  const handleCopied = () => {
    toaster.create({ title: 'Copied', type: 'default', variant: 'simple' });
  };

  return (
    <VStack align='start' gap={32}>
      <VStack align='start' gap={8}>
        <Text size='xs' color='secondary' weight='medium'>
          Icon button (swap)
        </Text>
        <Copyable text={SAMPLE_TEXT} tooltip>
          <Button variant='ghost' color='neutral' size='small' aria-label='Copy'>
            <CopyableIcon />
          </Button>
        </Copyable>
      </VStack>

      <VStack align='start' gap={8}>
        <Text size='xs' color='secondary' weight='medium'>
          Labelled button (swap)
        </Text>
        <HStack gap={12}>
          <Copyable text={SAMPLE_TEXT} tooltip>
            <Button variant='secondary' size='medium'>
              <CopyableIcon /> <CopyableLabel idle='Copy code' copied='Copied' />
            </Button>
          </Copyable>
        </HStack>
      </VStack>

      <VStack align='start' gap={8}>
        <Text size='xs' color='secondary' weight='medium'>
          Inline code snippet (tooltip only)
        </Text>
        <Text size='sm'>
          Run <InlineCodeSnippet code='npm install' size='md' /> to install.
        </Text>
      </VStack>

      <VStack align='start' gap={8}>
        <Text size='xs' color='secondary' weight='medium'>
          Dropdown menu item (toast)
        </Text>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' color='neutral' size='small'>
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <Copyable text={SAMPLE_TEXT} onCopied={handleCopied}>
              <DropdownMenuItem>
                <DropdownMenuItemIcon>
                  <Copy />
                </DropdownMenuItemIcon>
                <DropdownMenuItemText>Copy value</DropdownMenuItemText>
              </DropdownMenuItem>
            </Copyable>
          </DropdownMenuContent>
        </DropdownMenu>
      </VStack>
    </VStack>
  );
};
AllRecipes.parameters = { layout: 'padded' };
