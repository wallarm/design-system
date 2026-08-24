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
import { SegmentedControl, type SegmentedControlProps } from './SegmentedControl';
import { SegmentedControlButton } from './SegmentedControlButton';
import { SegmentedControlItem } from './SegmentedControlItem';
import { SegmentedControlSeparator } from './SegmentedControlSeparator';

const DESCRIPTION = [
  'Switches between renditions of the same content, with every option visible — reach for `Tabs` when the sections are distinct places rather than views of one thing, and `Radio` when the choice is an answer a form submits.',
  'It owns no panel: it reports the chosen value and you re-render the content yourself.',
].join(' ');

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
        component: DESCRIPTION,
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

/**
 * Two to five options, all visible at once. Past that the control gets cramped and the
 * comparison it exists to offer stops working.
 */
export const Basic: StoryFn<SegmentedControlProps> = () => (
  <SegmentedControl defaultValue='1' data-testid='segmented-control'>
    <SegmentedControlItem value='1'>
      Headers
      <NumericBadge>33</NumericBadge>
    </SegmentedControlItem>
    <SegmentedControlItem value='2'>
      Parameters
      <NumericBadge>100</NumericBadge>
    </SegmentedControlItem>
    <SegmentedControlItem value='3'>Schema</SegmentedControlItem>
  </SegmentedControl>
);

/**
 * A disabled option stays visible rather than disappearing, so the set of choices doesn't
 * change shape between visits.
 */
export const Disabled: StoryFn<SegmentedControlProps> = () => (
  <SegmentedControl defaultValue='1'>
    <SegmentedControlItem value='1'>Active</SegmentedControlItem>
    <SegmentedControlItem value='2' disabled>
      Disabled
    </SegmentedControlItem>
    <SegmentedControlItem value='3'>Normal</SegmentedControlItem>
  </SegmentedControl>
);

/**
 * Icons beside the labels, which helps when the options are renditions — a list against a
 * grid — rather than categories.
 */
export const Icons: StoryFn<SegmentedControlProps> = () => (
  <SegmentedControl defaultValue='1'>
    <SegmentedControlItem value='1'>
      <ChevronLeft />
      Previous
    </SegmentedControlItem>
    <SegmentedControlItem value='2'>
      <Search />
      Search
    </SegmentedControlItem>
    <SegmentedControlItem value='3'>
      Next
      <ChevronRight />
    </SegmentedControlItem>
  </SegmentedControl>
);

/**
 * Icon-only segments for a toolbar. Each still needs an accessible name; the icon is the
 * label only visually.
 */
export const IconOnly: StoryFn<SegmentedControlProps> = () => (
  <SegmentedControl defaultValue='user'>
    <SegmentedControlItem value='user'>
      <Home />
      <NumericBadge>1</NumericBadge>
    </SegmentedControlItem>
    <SegmentedControlItem value='settings'>
      <SlidersHorizontal />
    </SegmentedControlItem>
    <SegmentedControlItem value='search'>
      <Search />
    </SegmentedControlItem>
  </SegmentedControl>
);

/**
 * An overflow trigger for the options that didn't fit. If you need this often, the choice
 * probably wants a `Select`.
 */
export const MoreButton: StoryFn<SegmentedControlProps> = () => (
  <SegmentedControl defaultValue='1'>
    <SegmentedControlItem value='1'>
      Headers
      <NumericBadge>33</NumericBadge>
    </SegmentedControlItem>
    <SegmentedControlItem value='2'>
      Parameters
      <NumericBadge>100</NumericBadge>
    </SegmentedControlItem>
    <SegmentedControlItem value='3'>Schema</SegmentedControlItem>
    <SegmentedControlSeparator />
    <SegmentedControlButton onClick={() => alert('Show more items')}>
      <Ellipsis />
      More
    </SegmentedControlButton>
  </SegmentedControl>
);

/**
 * What too many options looks like — worth seeing so the limit is a judgement rather than a
 * rule you took on trust.
 */
export const Many: StoryFn<SegmentedControlProps> = () => {
  const items = Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
    text: `Item ${i + 1}`,
  }));

  return (
    <SegmentedControl defaultValue='1'>
      {items.slice(0, 7).map(item => (
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

/**
 * A count on a segment, for when each view holds a different number of things and the reader
 * would otherwise have to switch to find out.
 */
export const Badge: StoryFn<SegmentedControlProps> = () => (
  <SegmentedControl defaultValue='icon-badge'>
    <SegmentedControlItem value='icon-only'>
      <CircleDashed />
    </SegmentedControlItem>
    <SegmentedControlItem value='icon-badge'>
      <CircleDashed />
      <NumericBadge>1</NumericBadge>
    </SegmentedControlItem>
    <SegmentedControlItem value='text-badge'>
      Items
      <NumericBadge>99</NumericBadge>
    </SegmentedControlItem>
  </SegmentedControl>
);

/**
 * Stretches to its container, dividing the width evenly. Suits a narrow panel; in a wide one
 * it leaves the segments floating far apart.
 */
export const FullWidth: StoryFn<SegmentedControlProps> = () => (
  <div className='min-w-800'>
    <SegmentedControl defaultValue='1' fullWidth>
      <SegmentedControlItem value='1'>
        Overview
        <NumericBadge>12</NumericBadge>
      </SegmentedControlItem>
      <SegmentedControlItem value='2'>Analytics</SegmentedControlItem>
      <SegmentedControlItem value='3'>
        Reports
        <NumericBadge>5</NumericBadge>
      </SegmentedControlItem>
      <SegmentedControlItem value='4'>Settings</SegmentedControlItem>
    </SegmentedControl>
  </div>
);

/**
 * Own the value when something else has to move with it, which is the usual case, since the
 * control renders no panel of its own.
 */
export const Controlled: StoryFn<SegmentedControlProps> = () => {
  const [value, setValue] = useState<string>('1');

  return (
    <SegmentedControl value={value} onChange={setValue}>
      <SegmentedControlItem value='1'>
        Headers
        <NumericBadge>33</NumericBadge>
      </SegmentedControlItem>
      <SegmentedControlItem value='2'>
        Parameters
        <NumericBadge>100</NumericBadge>
      </SegmentedControlItem>
      <SegmentedControlItem value='3'>Schema</SegmentedControlItem>
    </SegmentedControl>
  );
};

/**
 * Inside `Field`, for when the choice really is a form answer — the case where `Radio` is
 * often the better call.
 */
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

    <SegmentedControl defaultValue='1'>
      <SegmentedControlItem value='1'>
        Headers
        <NumericBadge>33</NumericBadge>
      </SegmentedControlItem>
      <SegmentedControlItem value='2'>
        Parameters
        <NumericBadge>100</NumericBadge>
      </SegmentedControlItem>
      <SegmentedControlItem value='3'>Schema</SegmentedControlItem>
    </SegmentedControl>
  </Field>
);
