import figma from '@figma/code-connect';
import { NumericBadge } from '../NumericBadge';
import { SegmentedControl } from './SegmentedControl';
import { SegmentedControlButton } from './SegmentedControlButton';
import { SegmentedControlItem } from './SegmentedControlItem';
import { SegmentedControlSeparator } from './SegmentedControlSeparator';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/wip-components?node-id=647-3325';

// Basic variant
figma.connect(SegmentedControl, figmaNodeUrl, {
  example: () => (
    <SegmentedControl value='1'>
      <SegmentedControlItem value='1'>Headers</SegmentedControlItem>
      <SegmentedControlItem value='2'>Parameters</SegmentedControlItem>
      <SegmentedControlItem value='3'>Schema</SegmentedControlItem>
    </SegmentedControl>
  ),
});

// With counts variant
figma.connect(SegmentedControl, figmaNodeUrl, {
  variant: {
    'Has Counts': true,
  },
  example: () => (
    <SegmentedControl
      value='1'
      onChange={() => {
        /* Figma placeholder */
      }}
    >
      <SegmentedControlItem value='1'>
        Headers
        <NumericBadge>{33}</NumericBadge>
      </SegmentedControlItem>
      <SegmentedControlItem value='2'>
        Parameters
        <NumericBadge>{100}</NumericBadge>
      </SegmentedControlItem>
      <SegmentedControlItem value='3'>Schema</SegmentedControlItem>
    </SegmentedControl>
  ),
});

// With More button variant
figma.connect(SegmentedControl, figmaNodeUrl, {
  variant: {
    'Has More': true,
  },
  example: () => (
    <SegmentedControl
      value='1'
      onChange={() => {
        /* Figma placeholder */
      }}
    >
      <SegmentedControlItem value='1'>Overview</SegmentedControlItem>
      <SegmentedControlItem value='2'>Analytics</SegmentedControlItem>
      <SegmentedControlItem value='3'>Reports</SegmentedControlItem>
      <SegmentedControlSeparator />
      <SegmentedControlButton>More</SegmentedControlButton>
    </SegmentedControl>
  ),
});

// Full width variant
figma.connect(SegmentedControl, figmaNodeUrl, {
  props: {
    fullWidth: figma.boolean('Full Width'),
  },
  variant: {
    'Full Width': true,
  },
  example: ({ fullWidth = true }) => (
    <SegmentedControl
      value='1'
      onChange={() => {
        /* Figma placeholder */
      }}
      fullWidth={fullWidth}
    >
      <SegmentedControlItem value='1'>Overview</SegmentedControlItem>
      <SegmentedControlItem value='2'>Analytics</SegmentedControlItem>
      <SegmentedControlItem value='3'>Reports</SegmentedControlItem>
      <SegmentedControlItem value='4'>Settings</SegmentedControlItem>
    </SegmentedControl>
  ),
});
