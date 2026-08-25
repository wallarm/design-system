import { useState } from 'react';
import { createListCollection } from '@ark-ui/react/collection';
import { fn } from 'storybook/test';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Earth, Info } from '../../icons';
import {
  Select,
  SelectButtonTag,
  SelectButtonTagValue,
  SelectContent,
  type SelectDataItem,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../Select';
import { HStack, VStack } from '../Stack';
import { Tag } from './Tag';
import { TagClose } from './TagClose';

const DESCRIPTION = [
  'An interactive chip for a keyword or attribute the reader can select or remove — a chip that only states a value is a `Badge`.',
  'Give it one job: Carbon warns against tags carrying several functions at once, and a chip that both filters and deletes is one people trigger by accident.',
].join(' ');

const onTagClick = fn().mockName('onTagClick');

const meta = {
  title: 'Status Indication/Tag',
  component: Tag,
  subcomponents: { TagClose },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
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

/**
 * The default. It is focusable and clickable, which is what separates it from a badge even when
 * it looks the same.
 */
export const Basic: StoryFn<typeof meta> = ({ ...args }) => <Tag {...args}>Tag</Tag>;

/**
 * The same two heights as `Badge`, so a row mixing them stays level.
 */
export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack align='center' gap={8}>
    <Tag {...args} size='medium'>
      Medium Tag
    </Tag>
    <Tag {...args} size='large'>
      Large Tag
    </Tag>
  </HStack>
);

/**
 * Out of the tab order and unclickable, but still readable — a filter that cannot currently
 * apply is still information.
 */
export const Disabled: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack gap={8}>
    <Tag {...args} size='medium' disabled>
      Disabled Medium
    </Tag>
    <Tag {...args} size='large' disabled>
      Disabled Large
    </Tag>
  </HStack>
);

/**
 * A dismiss control for a value the reader added, such as an applied filter. Removal is the
 * only thing the control should do.
 */
export const Closable: StoryFn<typeof meta> = ({ ...args }) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  return (
    <>
      {isVisible && (
        <Tag {...args} data-testid='tag'>
          Closable tag
          <TagClose onClick={() => setIsVisible(false)} />
        </Tag>
      )}
    </>
  );
};

/**
 * A toggle, for filtering by tapping the values themselves. Selected state has to be visible
 * without colour alone.
 */
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
    isItemDisabled: item => item.value === 'UTC+2',
  });

  return (
    <VStack gap={8}>
      <Select collection={collection}>
        <SelectButtonTag>
          <Earth />
          <SelectButtonTagValue placeholder='Timezone' />
        </SelectButtonTag>

        <SelectPositioner>
          <SelectContent>
            {collection.items.map(skill => (
              <SelectOption key={skill.value} item={skill}>
                <SelectOptionText>{skill.label}</SelectOptionText>
                <SelectOptionIndicator />
              </SelectOption>
            ))}
          </SelectContent>
        </SelectPositioner>
      </Select>

      <Select collection={collection}>
        <SelectButtonTag size='large'>
          <Earth />
          <SelectButtonTagValue placeholder='Timezone' />
        </SelectButtonTag>

        <SelectPositioner>
          <SelectContent>
            {collection.items.map(skill => (
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

/**
 * An icon beside the label, carrying the kind of thing rather than its state.
 */
export const WithIcons: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack gap={12} align='stretch'>
    <VStack gap={8}>
      <span className='sb-annotation'>medium</span>
      <HStack gap={8}>
        <Tag {...args} size='medium'>
          <Earth />
          Tag with left icon
        </Tag>
        <Tag {...args} size='medium'>
          Tag with right icon
          <Info />
        </Tag>
        <Tag {...args} size='medium'>
          <Earth />
          Tag with left and right icons
          <Info />
        </Tag>
      </HStack>
    </VStack>
    <VStack gap={8}>
      <span className='sb-annotation'>large</span>
      <HStack gap={8}>
        <Tag {...args} size='large'>
          <Earth />
          Tag with left icon
        </Tag>
        <Tag {...args} size='large'>
          Tag with right icon
          <Info />
        </Tag>
        <Tag {...args} size='large'>
          <Earth />
          Tag with left and right icons
          <Info />
        </Tag>
      </HStack>
    </VStack>
  </VStack>
);

/**
 * A plain click handler, for a chip that navigates or opens rather than toggling — but not as a
 * link, which Carbon rules out for tags.
 */
export const WithOnClick: StoryFn<typeof meta> = ({ ...args }) => (
  <Tag {...args} onClick={onTagClick}>
    Click me
  </Tag>
);
