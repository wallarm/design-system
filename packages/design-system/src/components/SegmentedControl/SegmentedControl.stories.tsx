import { useState } from 'react';

import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import {
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Ellipsis,
  Home,
  Info,
  Search,
  SlidersHorizontal,
} from '../../icons';
import { Field, FieldDescription, FieldLabel } from '../Field';
import { NumericBadge } from '../NumericBadge';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

import {
  SegmentedControl,
  type SegmentedControlProps,
} from './SegmentedControl';
import { SegmentedControlButton } from './SegmentedControlButton';
import { SegmentedControlItem } from './SegmentedControlItem';
import { SegmentedControlSeparator } from './SegmentedControlSeparator';

const meta = {
  title: 'Inputs/SegmentedControl',
  component: SegmentedControl,
  subcomponents: {
    SegmentedControlItem,
    SegmentedControlSeparator,
    SegmentedControlButton,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A segmented control for switching between different views or options.',
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'text' },
      description: 'Currently selected value',
    },
    onChange: {
      description: 'Callback when selection changes',
      action: 'onChange',
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: 'Whether the segmented control should take full width',
      defaultValue: false,
    },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;

export const Basic: StoryFn<SegmentedControlProps> = () => (
  <SegmentedControl defaultValue="1">
    <SegmentedControlItem value="1">
      Headers
      <NumericBadge>33</NumericBadge>
    </SegmentedControlItem>
    <SegmentedControlItem value="2">
      Parameters
      <NumericBadge>100</NumericBadge>
    </SegmentedControlItem>
    <SegmentedControlItem value="3">Schema</SegmentedControlItem>
  </SegmentedControl>
);

export const Disabled: StoryFn<SegmentedControlProps> = () => (
  <SegmentedControl defaultValue="1">
    <SegmentedControlItem value="1">Active</SegmentedControlItem>
    <SegmentedControlItem value="2" disabled>
      Disabled
    </SegmentedControlItem>
    <SegmentedControlItem value="3">Normal</SegmentedControlItem>
  </SegmentedControl>
);

export const Icons: StoryFn<SegmentedControlProps> = () => (
  <SegmentedControl defaultValue="1">
    <SegmentedControlItem value="1">
      <ChevronLeft />
      Previous
    </SegmentedControlItem>
    <SegmentedControlItem value="2">
      <Search />
      Search
    </SegmentedControlItem>
    <SegmentedControlItem value="3">
      Next
      <ChevronRight />
    </SegmentedControlItem>
  </SegmentedControl>
);

export const IconOnly: StoryFn<SegmentedControlProps> = () => (
  <SegmentedControl defaultValue="user">
    <SegmentedControlItem value="user">
      <Home />
      <NumericBadge>1</NumericBadge>
    </SegmentedControlItem>
    <SegmentedControlItem value="settings">
      <SlidersHorizontal />
    </SegmentedControlItem>
    <SegmentedControlItem value="search">
      <Search />
    </SegmentedControlItem>
  </SegmentedControl>
);

export const MoreButton: StoryFn<SegmentedControlProps> = () => (
  <SegmentedControl defaultValue="1">
    <SegmentedControlItem value="1">
      Headers
      <NumericBadge>33</NumericBadge>
    </SegmentedControlItem>
    <SegmentedControlItem value="2">
      Parameters
      <NumericBadge>100</NumericBadge>
    </SegmentedControlItem>
    <SegmentedControlItem value="3">Schema</SegmentedControlItem>
    <SegmentedControlSeparator />
    <SegmentedControlButton onClick={() => alert('Show more items')}>
      <Ellipsis />
      More
    </SegmentedControlButton>
  </SegmentedControl>
);

export const Many: StoryFn<SegmentedControlProps> = () => {
  const items = Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
    text: `Item ${i + 1}`,
  }));

  return (
    <SegmentedControl defaultValue="1">
      {items.slice(0, 7).map((item) => (
        <SegmentedControlItem key={item.id} value={item.id}>
          {item.text}
        </SegmentedControlItem>
      ))}
      <SegmentedControlSeparator />
      <SegmentedControlButton onClick={() => alert('Show more items')}>
        <Ellipsis />
        More
      </SegmentedControlButton>
    </SegmentedControl>
  );
};

export const Badge: StoryFn<SegmentedControlProps> = () => (
  <SegmentedControl defaultValue="icon-badge">
    <SegmentedControlItem value="icon-only">
      <CircleDashed />
    </SegmentedControlItem>
    <SegmentedControlItem value="icon-badge">
      <CircleDashed />
      <NumericBadge>1</NumericBadge>
    </SegmentedControlItem>
    <SegmentedControlItem value="text-badge">
      Items
      <NumericBadge>99</NumericBadge>
    </SegmentedControlItem>
  </SegmentedControl>
);

export const FullWidth: StoryFn<SegmentedControlProps> = () => (
  <div className="min-w-800">
    <SegmentedControl defaultValue="1" fullWidth>
      <SegmentedControlItem value="1">
        Overview
        <NumericBadge>12</NumericBadge>
      </SegmentedControlItem>
      <SegmentedControlItem value="2">Analytics</SegmentedControlItem>
      <SegmentedControlItem value="3">
        Reports
        <NumericBadge>5</NumericBadge>
      </SegmentedControlItem>
      <SegmentedControlItem value="4">Settings</SegmentedControlItem>
    </SegmentedControl>
  </div>
);

export const Controlled: StoryFn<SegmentedControlProps> = () => {
  const [value, setValue] = useState<string>('1');

  return (
    <SegmentedControl value={value} onChange={setValue}>
      <SegmentedControlItem value="1">
        Headers
        <NumericBadge>33</NumericBadge>
      </SegmentedControlItem>
      <SegmentedControlItem value="2">
        Parameters
        <NumericBadge>100</NumericBadge>
      </SegmentedControlItem>
      <SegmentedControlItem value="3">Schema</SegmentedControlItem>
    </SegmentedControl>
  );
};

export const FormField: StoryFn<typeof meta> = () => (
  <Field>
    <FieldLabel>
      Label
      <Tooltip>
        <TooltipTrigger>
          <Info />
        </TooltipTrigger>
        <TooltipContent>Additional information</TooltipContent>
      </Tooltip>
    </FieldLabel>

    <FieldDescription>This is an input description.</FieldDescription>

    <SegmentedControl defaultValue="1">
      <SegmentedControlItem value="1">
        Headers
        <NumericBadge>33</NumericBadge>
      </SegmentedControlItem>
      <SegmentedControlItem value="2">
        Parameters
        <NumericBadge>100</NumericBadge>
      </SegmentedControlItem>
      <SegmentedControlItem value="3">Schema</SegmentedControlItem>
    </SegmentedControl>
  </Field>
);
