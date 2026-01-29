import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import { VStack } from '../Stack';

import { Code } from './Code';

const meta = {
  title: 'Typography/Code',
  component: Code,
  parameters: {
    layout: 'centered',
  },

  args: {},
  argTypes: {
    size: {
      control: 'select',
      options: ['s', 'm', 'l'],
    },
    weight: {
      control: 'select',
      options: ['light', 'regular', 'medium', 'bold'],
    },
    asChild: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Code>;

export default meta;

export const Basic: StoryFn<typeof meta> = ({ ...args }) => (
  <Code {...args}>const example = 'code'</Code>
);

export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack align="start">
    <Code {...args} size="s">
      console.log('Small code text');
    </Code>
    <Code {...args} size="m">
      console.log('Medium code text');
    </Code>
    <Code {...args} size="l">
      console.log('Large code text');
    </Code>
  </VStack>
);

export const Weights: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack align="start">
    <Code {...args} size="m" weight="light">
      const light = 'Light weight code';
    </Code>
    <Code {...args} size="m" weight="regular">
      const regular = 'Regular weight code';
    </Code>
    <Code {...args} size="m" weight="medium">
      const medium = 'Medium weight code';
    </Code>
    <Code {...args} size="m" weight="bold">
      const bold = 'Bold weight code';
    </Code>
  </VStack>
);

export const Colors: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack align="start">
    <Code {...args} color="primary">
      const light = 'Primary color code';
    </Code>
    <Code {...args} color="secondary">
      const regular = 'Secondary color code';
    </Code>
  </VStack>
);

export const Multiline: StoryFn<typeof meta> = ({ ...args }) => (
  <Code {...args} size="m">
    {`function example() {
  const message = 'Hello, World!';
  console.log(message);
  return message;
}`}
  </Code>
);

export const Italic: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack align="start">
    <Code {...args} size="s" italic>
      {'// Italic small code comment'}
    </Code>
    <Code {...args} size="m" italic>
      {'// Italic medium code comment'}
    </Code>
    <Code {...args} size="l" italic>
      {'// Italic large code comment'}
    </Code>
    <Code {...args} size="s" weight="bold" italic>
      {'// Bold italic small'}
    </Code>
    <Code {...args} size="m" weight="bold" italic>
      {'// Bold italic medium'}
    </Code>
    <Code {...args} size="l" weight="bold" italic>
      {'// Bold italic large'}
    </Code>
  </VStack>
);

export const AsChild: StoryFn<typeof meta> = ({ ...args }) => (
  <Code {...args} size="m" weight="medium" asChild>
    <code>{'<CustomCodeElement />'}</code>
  </Code>
);
