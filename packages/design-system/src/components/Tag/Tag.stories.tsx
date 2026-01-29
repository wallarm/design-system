import { useState } from 'react';

import { createListCollection } from '@ark-ui/react/collection';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import { Earth, Info } from '../../icons';
import { Heading } from '../Heading';
import {
  Select,
  SelectButtonTag,
  SelectButtonTagValue,
  SelectContent,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
  type SelectDataItem,
} from '../Select';
import { HStack, VStack } from '../Stack';

import { Tag } from './Tag';
import { TagClose } from './TagClose';

const meta = {
  title: 'Status Indication/Tag',
  component: Tag,
  subcomponents: { TagClose },
  parameters: {
    layout: 'centered',
  },

  argTypes: {
    size: {
      control: 'select',
      options: ['medium', 'large'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;

export const Basic: StoryFn<typeof meta> = ({ ...args }) => (
  <Tag {...args}>Tag</Tag>
);

export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack align="center" spacing={8}>
    <Tag {...args} size="medium">
      Medium Tag
    </Tag>
    <Tag {...args} size="large">
      Large Tag
    </Tag>
  </HStack>
);

export const Disabled: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack spacing={8}>
    <Tag {...args} size="medium" disabled>
      Disabled Medium
    </Tag>
    <Tag {...args} size="large" disabled>
      Disabled Large
    </Tag>
  </HStack>
);

export const Closable: StoryFn<typeof meta> = ({ ...args }) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  return (
    <>
      {isVisible && (
        <Tag {...args}>
          Closable tag
          <TagClose onClick={() => setIsVisible(false)} />
        </Tag>
      )}
    </>
  );
};

export const Selectable: StoryFn<typeof meta> = () => {
  const collection = createListCollection<SelectDataItem>({
    items: [
      {
        value: 'UTC',
        label: 'UTC',
      },
      {
        value: 'UTC+1',
        label: 'UTC+1',
      },
      {
        value: 'UTC+2',
        label: 'UTC+2',
      },
      {
        value: 'UTC+3',
        label: 'UTC+3',
      },
      {
        value: 'UTC+4',
        label: 'UTC+4',
      },
      {
        value: 'UTC+5',
        label: 'UTC+5',
      },
      {
        value: 'UTC+6',
        label: 'UTC+6',
      },
      {
        value: 'UTC+7',
        label: 'UTC+7',
      },
    ],
    isItemDisabled: (item) => item.value === 'UTC+2',
  });

  return (
    <VStack spacing={8}>
      <Select collection={collection}>
        <SelectButtonTag>
          <Earth />
          <SelectButtonTagValue placeholder="Timezone" />
        </SelectButtonTag>

        <SelectPositioner>
          <SelectContent>
            {collection.items.map((skill) => (
              <SelectOption key={skill.value} item={skill}>
                <SelectOptionText>{skill.label}</SelectOptionText>
                <SelectOptionIndicator />
              </SelectOption>
            ))}
          </SelectContent>
        </SelectPositioner>
      </Select>

      <Select collection={collection}>
        <SelectButtonTag size="large">
          <Earth />
          <SelectButtonTagValue placeholder="Timezone" />
        </SelectButtonTag>

        <SelectPositioner>
          <SelectContent>
            {collection.items.map((skill) => (
              <SelectOption key={skill.value} item={skill}>
                <SelectOptionText>{skill.label}</SelectOptionText>
                <SelectOptionIndicator />
              </SelectOption>
            ))}
          </SelectContent>
        </SelectPositioner>
      </Select>
    </VStack>
  );
};

export const WithIcons: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack spacing={12} align="stretch">
    <VStack spacing={8}>
      <Heading size="sm">Medium Size</Heading>
      <HStack spacing={8}>
        <Tag {...args} size="medium">
          <Earth />
          Tag with left icon
        </Tag>
        <Tag {...args} size="medium">
          Tag with right icon
          <Info />
        </Tag>
        <Tag {...args} size="medium">
          <Earth />
          Tag with left and right icons
          <Info />
        </Tag>
      </HStack>
    </VStack>
    <VStack spacing={8}>
      <Heading size="sm">Large Size</Heading>
      <HStack spacing={8}>
        <Tag {...args} size="large">
          <Earth />
          Tag with left icon
        </Tag>
        <Tag {...args} size="large">
          Tag with right icon
          <Info />
        </Tag>
        <Tag {...args} size="large">
          <Earth />
          Tag with left and right icons
          <Info />
        </Tag>
      </HStack>
    </VStack>
  </VStack>
);

export const WithOnClick: StoryFn<typeof meta> = ({ ...args }) => (
  <Tag {...args} onClick={() => alert('Tag clicked!')}>
    Click me
  </Tag>
);
