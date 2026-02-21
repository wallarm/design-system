import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { CirclePlus, Earth, LayoutTemplate, Maximize, Plus } from '../../icons';
import { Button } from '../Button';
import { Kbd, KbdGroup } from '../Kbd';
import { DropdownMenu } from './DropdownMenu';
import { DropdownMenuContent } from './DropdownMenuContent';
import { DropdownMenuContextTrigger } from './DropdownMenuContextTrigger';
import { DropdownMenuGroup } from './DropdownMenuGroup';
import { DropdownMenuItem } from './DropdownMenuItem';
import { DropdownMenuItemContent } from './DropdownMenuItemContent';
import { DropdownMenuItemDescription } from './DropdownMenuItemDescription';
import { DropdownMenuItemIcon } from './DropdownMenuItemIcon';
import { DropdownMenuItemText } from './DropdownMenuItemText';
import { DropdownMenuLabel } from './DropdownMenuLabel';
import { DropdownMenuSeparator } from './DropdownMenuSeparator';
import { DropdownMenuShortcut } from './DropdownMenuShortcut';
import { DropdownMenuTrigger } from './DropdownMenuTrigger';
import { DropdownMenuTriggerItem } from './DropdownMenuTriggerItem';

const meta = {
  title: 'Actions/DropdownMenu',
  component: DropdownMenu,
  subcomponents: {
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuItemContent,
    DropdownMenuItemDescription,
    DropdownMenuItemIcon,
    DropdownMenuItemText,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
    DropdownMenuTriggerItem,
    DropdownMenuContextTrigger,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant='outline' color='neutral'>
        Open
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuGroup>
        <DropdownMenuItem>
          Profile
          <DropdownMenuShortcut>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>P</Kbd>
            </KbdGroup>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Billing
          <DropdownMenuShortcut>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>B</Kbd>
            </KbdGroup>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Settings
          <DropdownMenuShortcut>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>S</Kbd>
            </KbdGroup>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Keyboard shortcuts super
          <DropdownMenuShortcut>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenu>
          <DropdownMenuTriggerItem>Invite users</DropdownMenuTriggerItem>
          <DropdownMenuContent>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuItem>Message</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>More...</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenuItem>
          New Team
          <DropdownMenuShortcut>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>T</Kbd>
            </KbdGroup>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuItem>GitHub</DropdownMenuItem>
      <DropdownMenuItem>Support</DropdownMenuItem>
      <DropdownMenuItem disabled>API</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant='destructive'>
        Log out
        <DropdownMenuShortcut>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>Q</Kbd>
          </KbdGroup>
        </DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const Context: StoryFn<typeof meta> = () => (
  <DropdownMenu>
    <DropdownMenuContextTrigger asChild>
      <div className='flex items-center justify-center w-300 h-192 border border-border-primary border-dashed rounded-8'>
        Right click here
      </div>
    </DropdownMenuContextTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuGroup>
        <DropdownMenuItem>
          Profile
          <DropdownMenuShortcut>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>P</Kbd>
            </KbdGroup>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Billing
          <DropdownMenuShortcut>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>B</Kbd>
            </KbdGroup>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Settings
          <DropdownMenuShortcut>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>S</Kbd>
            </KbdGroup>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Keyboard shortcuts super
          <DropdownMenuShortcut>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenu>
          <DropdownMenuTriggerItem>Invite users</DropdownMenuTriggerItem>
          <DropdownMenuContent>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuItem>Message</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>More...</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenuItem>
          New Team
          <DropdownMenuShortcut>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>T</Kbd>
            </KbdGroup>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuItem>GitHub</DropdownMenuItem>
      <DropdownMenuItem>Support</DropdownMenuItem>
      <DropdownMenuItem disabled>API</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant='destructive'>
        Log out
        <DropdownMenuShortcut>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>Q</Kbd>
          </KbdGroup>
        </DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const WithDescriptions: StoryFn<typeof meta> = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant='outline' color='neutral'>
        <Plus />
        Add Widget
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>
        <DropdownMenuItemContent>
          <DropdownMenuItemText>Bar-volume chart</DropdownMenuItemText>
          <DropdownMenuItemDescription>Description</DropdownMenuItemDescription>
        </DropdownMenuItemContent>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <DropdownMenuItemContent>
          <DropdownMenuItemText>Canvas</DropdownMenuItemText>
          <DropdownMenuItemDescription>Description</DropdownMenuItemDescription>
        </DropdownMenuItemContent>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <DropdownMenuItemContent>
          <DropdownMenuItemText>Attacks heat-map</DropdownMenuItemText>
          <DropdownMenuItemDescription>Description</DropdownMenuItemDescription>
        </DropdownMenuItemContent>
        <DropdownMenuShortcut>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>Q</Kbd>
          </KbdGroup>
        </DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuSeparator />

      <DropdownMenuItem variant='brand'>
        <CirclePlus />
        <DropdownMenuItemText>Request custom widget</DropdownMenuItemText>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const WithIcons: StoryFn<typeof meta> = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant='outline' color='neutral'>
        <Plus />
        Add Widget
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>
        <DropdownMenuItemIcon>
          <LayoutTemplate />
        </DropdownMenuItemIcon>
        <DropdownMenuItemContent>
          <DropdownMenuItemText>Bar-volume chart</DropdownMenuItemText>
        </DropdownMenuItemContent>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <DropdownMenuItemIcon>
          <Maximize />
        </DropdownMenuItemIcon>
        <DropdownMenuItemContent>
          <DropdownMenuItemText>Canvas</DropdownMenuItemText>
        </DropdownMenuItemContent>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <DropdownMenuItemIcon>
          <Earth />
        </DropdownMenuItemIcon>
        <DropdownMenuItemText>Attacks heat-map</DropdownMenuItemText>
        <DropdownMenuShortcut>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>Q</Kbd>
          </KbdGroup>
        </DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuSeparator />

      <DropdownMenuItem variant='brand'>
        <CirclePlus />
        <DropdownMenuItemText>Request custom widget</DropdownMenuItemText>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const WithDescriptionAndIcons: StoryFn<typeof meta> = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant='outline' color='neutral'>
        <Plus />
        Add Widget
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>
        <DropdownMenuItemIcon>
          <LayoutTemplate />
        </DropdownMenuItemIcon>
        <DropdownMenuItemContent>
          <DropdownMenuItemText>Bar-volume chart</DropdownMenuItemText>
          <DropdownMenuItemDescription>Description</DropdownMenuItemDescription>
        </DropdownMenuItemContent>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <DropdownMenuItemIcon>
          <Maximize />
        </DropdownMenuItemIcon>
        <DropdownMenuItemContent>
          <DropdownMenuItemText>Canvas</DropdownMenuItemText>
          <DropdownMenuItemDescription>Description</DropdownMenuItemDescription>
        </DropdownMenuItemContent>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <DropdownMenuItemIcon>
          <Earth />
        </DropdownMenuItemIcon>
        <DropdownMenuItemContent>
          <DropdownMenuItemText>Attacks heat-map</DropdownMenuItemText>
          <DropdownMenuItemDescription>Description</DropdownMenuItemDescription>
        </DropdownMenuItemContent>
        <DropdownMenuShortcut>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>Q</Kbd>
          </KbdGroup>
        </DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuSeparator />

      <DropdownMenuItem variant='brand'>
        <CirclePlus />
        <DropdownMenuItemText>Request custom widget</DropdownMenuItemText>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
