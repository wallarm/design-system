import figma from '@figma/code-connect';

import {
  SegmentedControlButton,
  SegmentedControlSeparator,
} from '../SegmentedControl';

import { SegmentedTabs } from './SegmentedTabs';
import { SegmentedTabsTrigger } from './SegmentedTabsTrigger';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/wip-components?node-id=1956-8100';

figma.connect(SegmentedTabs, figmaNodeUrl, {
  variant: {
    '#': '5',
    'Actionable pills': 'Off',
  },
  example: () => (
    <SegmentedTabs value="1">
      <SegmentedTabsTrigger value="1">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="2">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="3">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="4">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="5">Item</SegmentedTabsTrigger>
      <SegmentedControlSeparator />
      <SegmentedControlButton>More</SegmentedControlButton>
    </SegmentedTabs>
  ),
});

figma.connect(SegmentedTabs, figmaNodeUrl, {
  variant: {
    '#': '5',
    'Actionable pills': 'On',
  },
  example: () => (
    <SegmentedTabs value="1">
      <SegmentedTabsTrigger value="1">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="2">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="3">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="4">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="5">Item</SegmentedTabsTrigger>
      <SegmentedControlSeparator />
      <SegmentedControlButton>More</SegmentedControlButton>
    </SegmentedTabs>
  ),
});

figma.connect(SegmentedTabs, figmaNodeUrl, {
  variant: {
    '#': '10',
    'Actionable pills': 'Off',
  },
  example: () => (
    <SegmentedTabs value="1">
      <SegmentedTabsTrigger value="1">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="2">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="3">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="4">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="5">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="6">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="7">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="8">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="9">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="10">Item</SegmentedTabsTrigger>
      <SegmentedControlSeparator />
      <SegmentedControlButton>More</SegmentedControlButton>
    </SegmentedTabs>
  ),
});

figma.connect(SegmentedTabs, figmaNodeUrl, {
  variant: {
    '#': '10',
    'Actionable pills': 'On',
  },
  example: () => (
    <SegmentedTabs value="1">
      <SegmentedTabsTrigger value="1">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="2">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="3">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="4">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="5">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="6">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="7">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="8">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="9">Item</SegmentedTabsTrigger>
      <SegmentedTabsTrigger value="10">Item</SegmentedTabsTrigger>
      <SegmentedControlSeparator />
      <SegmentedControlButton>More</SegmentedControlButton>
    </SegmentedTabs>
  ),
});
