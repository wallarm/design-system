import { fn } from 'storybook/test';
import type { Meta, StoryFn, StoryObj } from 'storybook-react-rsbuild';
import { ArrowUp, Settings2 } from '../../icons';
import { Button } from '../Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemContent,
  DropdownMenuItemText,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { InputGroup } from '../InputGroup/InputGroup';
import { InputGroupAddon } from '../InputGroup/InputGroupAddon';
import { HStack } from '../Stack';
import { Switch, SwitchControl } from '../Switch';
import { Text } from '../Text';
import { Textarea } from './Textarea';

const DESCRIPTION = [
  'Multi-line free text, for answers that run to sentences — reach for `Input` when one line will do, since a tall box tells the reader to write more than you want.',
  'Like `Input`, it reads `Field` context for its label, description and error state.',
].join(' ');

const meta = {
  title: 'Inputs/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  args: {
    onChange: fn(),
    placeholder: 'Placeholder',
  },
  argTypes: {
    error: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;

/**
 * The bare control at its default height. Size the box to the answer you expect — it is the
 * clearest signal the reader gets about how much to write.
 */
export const Basic: StoryObj<typeof meta> = {
  args: {
    'data-testid': 'textarea',
  },
};

/**
 * The same 36 / 32 / 24px scale as `Input`, applied to the single-row height, so a textarea
 * lines up with the fields around it before it grows.
 */
export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack gap={16} align='start'>
    <Textarea {...args} size='default' />
    <Textarea {...args} size='medium' />
    <Textarea {...args} size='small' />
  </HStack>
);

/**
 * Focus is a ring outside the border, as on every other field, so the box doesn't shift when
 * the reader tabs into it.
 */
export const Focused: StoryObj<typeof meta> = {
  parameters: { pseudo: { focusVisible: true } },
};

/**
 * Dimmed and not focusable. Say elsewhere what would enable it.
 */
export const Disabled: StoryObj<typeof meta> = {
  args: {
    disabled: true,
  },
};

/**
 * A filled box. Text starts at the top rather than centring, which is why the height you
 * choose reads as an invitation.
 */
export const WithValue: StoryObj<typeof meta> = {
  args: {
    value: 'Some value...',
  },
};

/**
 * `error` reddens the border and sets `aria-invalid`; the message is `FieldError`'s job.
 */
export const WithError: StoryObj<typeof meta> = {
  args: {
    error: true,
  },
};

/**
 * Passing `maxRows` turns auto-resize on: the box starts at `minRows` and grows with the
 * text until it hits the cap, then scrolls. Without `maxRows` the height is fixed.
 */
export const AutoResize: StoryFn<typeof meta> = args => (
  <div style={{ width: 280 }}>
    <Textarea {...args} minRows={1} maxRows={5} placeholder='Auto-resize: 1 to 5 rows' />
  </div>
);

/**
 * Inside an `InputGroup` with a `block-end` addon, which is how the composer pattern is
 * built — auto-resize plus a toolbar that stays attached as the box grows.
 */
export const WithFooter: StoryFn<typeof meta> = args => {
  const toolItems = Array.from({ length: 6 }, (_, i) => ({
    id: String(i + 1),
    tool: '{tool-name}',
    desc: 'Description',
    enabled: true,
  }));

  return (
    <div style={{ width: 480 }}>
      <InputGroup>
        <Textarea {...args} minRows={1} maxRows={3} placeholder='Ask Wally...' />

        <InputGroupAddon align='block-end'>
          <HStack fullWidth align='center' justify='between'>
            <DropdownMenu closeOnSelect={false}>
              <DropdownMenuTrigger>
                <Button variant='secondary' size='small' color='neutral'>
                  <Settings2 />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className='w-304 h-290 overscroll-none'>
                <DropdownMenuLabel className='sticky top-0 z-50 bg-bg-surface-2'>
                  Always allowed in this conversation
                </DropdownMenuLabel>

                {toolItems.map(item => (
                  <DropdownMenuItem key={`${item.id}`} className='w-full'>
                    <DropdownMenuItemContent>
                      <DropdownMenuItemText>{item.tool}</DropdownMenuItemText>
                      <Text size='xs' color='secondary'>
                        {item.desc}
                      </Text>
                    </DropdownMenuItemContent>

                    <DropdownMenuShortcut>
                      <Switch checked={item.enabled}>
                        <SwitchControl />
                      </Switch>
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant='primary' color='brand' size='small'>
              <ArrowUp />
            </Button>
          </HStack>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};
