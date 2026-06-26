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

const meta = {
  title: 'Inputs/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
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

export const Basic: StoryObj<typeof meta> = {
  args: {
    'data-testid': 'textarea',
  },
};

export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack gap={16} align='start'>
    <Textarea {...args} size='default' />
    <Textarea {...args} size='medium' />
    <Textarea {...args} size='small' />
  </HStack>
);

export const Focused: StoryObj<typeof meta> = {
  parameters: { pseudo: { focusVisible: true } },
};

export const Disabled: StoryObj<typeof meta> = {
  args: {
    disabled: true,
  },
};

export const WithValue: StoryObj<typeof meta> = {
  args: {
    value: 'Some value...',
  },
};

export const WithError: StoryObj<typeof meta> = {
  args: {
    error: true,
  },
};

export const AutoResize: StoryFn<typeof meta> = args => (
  <div style={{ width: 280 }}>
    <Textarea {...args} minRows={1} maxRows={5} placeholder='Auto-resize: 1 to 5 rows' />
  </div>
);

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
