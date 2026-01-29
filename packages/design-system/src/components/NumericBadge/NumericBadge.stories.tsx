import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import { HStack } from '../Stack';

import { NumericBadge } from './NumericBadge';

const meta = {
  title: 'Status Indication/NumericBadge',
  component: NumericBadge,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof NumericBadge>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => <NumericBadge>1</NumericBadge>;

export const Types: StoryFn<typeof meta> = () => (
  <HStack>
    <NumericBadge type="primary">1</NumericBadge>
    <NumericBadge type="brand">1</NumericBadge>
    <NumericBadge type="destructive">1</NumericBadge>
    <NumericBadge type="outline">1</NumericBadge>
    <NumericBadge type="info">1</NumericBadge>
    <div className="bg-component-tooltip-bg">
      <NumericBadge type="primary-alt">1</NumericBadge>
    </div>
  </HStack>
);
