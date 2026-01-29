import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import { CirclePlus, Earth, LayoutTemplate, Maximize, Plus } from '../../icons';
import { Button } from '../Button';
import { Kbd, KbdGroup } from '../Kbd';

import { DropdownMenu } from './DropdownMenu';
import { DropdownMenuContent } from './DropdownMenuContent';
import { DropdownMenuGroup } from './DropdownMenuGroup';
import { DropdownMenuItem } from './DropdownMenuItem';
import { DropdownMenuItemContent } from './DropdownMenuItemContent';
import { DropdownMenuItemDescription } from './DropdownMenuItemDescription';
import { DropdownMenuItemIcon } from './DropdownMenuItemIcon';
import { DropdownMenuItemText } from './DropdownMenuItemText';
import { DropdownMenuLabel } from './DropdownMenuLabel';
import { DropdownMenuPortal } from './DropdownMenuPortal';
import { DropdownMenuSeparator } from './DropdownMenuSeparator';
import { DropdownMenuShortcut } from './DropdownMenuShortcut';
import { DropdownMenuSub } from './DropdownMenuSub';
import { DropdownMenuSubContent } from './DropdownMenuSubContent';
import { DropdownMenuSubTrigger } from './DropdownMenuSubTrigger';
import { DropdownMenuTrigger } from './DropdownMenuTrigger';

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
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" color="neutral">
        Open
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Email</DropdownMenuItem>
              <DropdownMenuItem>Message</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>More...</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
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
      <DropdownMenuItem variant="destructive">
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
      <Button variant="outline" color="neutral">
        <Plus />
        Add Widget
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
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

      <DropdownMenuItem variant="brand">
        <CirclePlus />
        <DropdownMenuItemText>Request custom widget</DropdownMenuItemText>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const WithIcons: StoryFn<typeof meta> = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" color="neutral">
        <Plus />
        Add Widget
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
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

      <DropdownMenuItem variant="brand">
        <CirclePlus />
        <DropdownMenuItemText>Request custom widget</DropdownMenuItemText>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const WithDescriptionAndIcons: StoryFn<typeof meta> = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" color="neutral">
        <Plus />
        Add Widget
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
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

      <DropdownMenuItem variant="brand">
        <CirclePlus />
        <DropdownMenuItemText>Request custom widget</DropdownMenuItemText>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
