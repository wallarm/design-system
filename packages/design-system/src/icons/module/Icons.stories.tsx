import { useState } from 'react';
import { createListCollection } from '@ark-ui/react';
import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from '../../components/Heading';
import { Input } from '../../components/Input';
import {
  Select,
  SelectButton,
  SelectContent,
  type SelectDataItem,
  SelectOption,
  SelectOptionText,
  SelectPositioner,
} from '../../components/Select';
import { HStack, VStack } from '../../components/Stack';
import { Text } from '../../components/Text';
import { ToggleButton } from '../../components/ToggleButton';
import * as iconExports from '../index';
import type { SvgIconSize } from '../SvgIcon';
import { categoryNames, iconToCategory } from './const';

type GalleryEntry = {
  name: string;
  category: string;
  copyText: string;
  Component: React.FC<{
    size?: SvgIconSize;
    className?: string;
    title?: string;
    style?: React.CSSProperties;
  }>;
};

// automatically collect all icon components from barrel exports
const allIcons = Object.fromEntries(
  Object.entries(iconExports).filter(([, value]) => typeof value === 'function'),
) as Record<
  string,
  React.FC<{ size?: SvgIconSize; className?: string; title?: string; style?: React.CSSProperties }>
>;

const allEntries: GalleryEntry[] = Object.entries(allIcons).map(([name, Component]) => ({
  name,
  category: iconToCategory.get(name) ?? 'General',
  copyText: `<${name} />`,
  Component,
}));

const categoryCounts = allEntries.reduce<Record<string, number>>((acc, entry) => {
  acc[entry.category] = (acc[entry.category] ?? 0) + 1;
  return acc;
}, {});

const { Check, CircleCheck, Info, TriangleAlert } = iconExports;

const DESCRIPTION = [
  'The whole icon set, one component per glyph. `size` defaults to `inherit`, so an icon set in text follows the size and colour of the type around it; pass an explicit size only where it has to stay put whatever the text does.',
  'An icon with no `title` is decorative and hidden from screen readers — give it one wherever the icon is the only thing carrying the meaning, an icon-only button above all.',
].join(' ');

const meta: Meta = {
  title: 'Primitives/Icons',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: DESCRIPTION,
      },
      canvas: {
        sourceState: 'none',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

/** The searchable gallery: filter by name or category, switch the preview size, and click a tile to copy its JSX. */
export const AllIcons: Story = {
  render: () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSize, setSelectedSize] = useState<SvgIconSize>('md');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const collection = createListCollection<SelectDataItem>({
      items: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].map(size => ({
        value: size,
        label: size.toUpperCase(),
      })),
    });

    const filteredEntries = allEntries.filter(entry => {
      const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || entry.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return (
      <VStack gap={12} fullWidth>
        <VStack
          gap={12}
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: 'var(--color-bg-page-bg)',
            paddingBlock: 12,
          }}
        >
          <Heading>All Icons ({allEntries.length})</Heading>

          <HStack gap={8}>
            <Input
              type='text'
              placeholder='Search icons...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />

            <Select
              collection={collection}
              value={[selectedSize]}
              onSelect={({ value }) => setSelectedSize(value as SvgIconSize)}
            >
              <SelectButton />

              <SelectPositioner>
                <SelectContent>
                  {collection.items.map(option => (
                    <SelectOption key={option.value} item={option}>
                      <SelectOptionText>{option.label}</SelectOptionText>
                    </SelectOption>
                  ))}
                </SelectContent>
              </SelectPositioner>
            </Select>
          </HStack>

          <HStack gap={4} style={{ flexWrap: 'wrap' }}>
            <ToggleButton
              size='small'
              active={selectedCategory === null}
              onToggle={() => setSelectedCategory(null)}
            >
              All ({allEntries.length})
            </ToggleButton>
            {categoryNames.map(category => (
              <ToggleButton
                key={category}
                size='small'
                active={selectedCategory === category}
                onToggle={() => setSelectedCategory(category)}
              >
                {category} ({categoryCounts[category] ?? 0})
              </ToggleButton>
            ))}
          </HStack>
        </VStack>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredEntries.map(({ name, category, copyText, Component }) => (
            <div
              key={`${category}-${name}`}
              className='flex flex-col items-center justify-center p-16 border border-border-primary rounded-8 bg-component-outline-button-bg transition-colors cursor-pointer'
              onClick={() => navigator.clipboard?.writeText(copyText)}
              title={`Click to copy: ${copyText}`}
            >
              <Component size={selectedSize} style={{ marginBottom: '8px' }} />

              <Text color='secondary' size='sm'>
                {name}
              </Text>
            </div>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
            }}
          >
            <Text color='secondary'>No icons found matching "{searchTerm}"</Text>
          </div>
        )}
      </VStack>
    );
  },
};

/** The fixed steps from `xs` to `2xl`. A fixed size holds whatever the surrounding text does, which is what a button or a table cell wants. */
export const IconSizes: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Check size='xs' title='Check icon XS' />
          <div className='sb-annotation'>xs</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Check size='sm' title='Check icon SM' />
          <div className='sb-annotation'>sm</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Check size='md' title='Check icon MD' />
          <div className='sb-annotation'>md</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Check size='lg' title='Check icon LG' />
          <div className='sb-annotation'>lg</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Check size='xl' title='Check icon XL' />
          <div className='sb-annotation'>xl</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Check size='2xl' title='Check icon 2XL' />
          <div className='sb-annotation'>2xl</div>
        </div>
      </div>
    </div>
  ),
};

const textSizes = [
  { label: 'xs (12px)', className: 'text-xs' },
  { label: 'sm (14px)', className: 'text-sm' },
  { label: 'md (16px)', className: 'text-md' },
  { label: 'lg (18px)', className: 'text-lg' },
] as const;

const iconSizes: SvgIconSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

/** Icons inside running text — `size='inherit'` scales and takes its colour from the type, fixed sizes ignore it, and an explicit `className` still overrides the inherited colour. */
export const IconsInText: Story = {
  render: () => (
    <VStack gap={20} align='stretch'>
      {/* Inherit size */}
      <VStack gap={8} align='stretch'>
        <p className='sb-annotation'>inherit — scales with the text</p>
        <VStack gap={4} align='start'>
          {textSizes.map(({ label, className }) => (
            <p key={label} className={`${className} text-text-primary`}>
              Warning: {label} text <TriangleAlert size='inherit' /> with inherited icon
            </p>
          ))}
        </VStack>
      </VStack>

      {/* Fixed icon sizes across text sizes */}
      <VStack gap={8} align='stretch'>
        <p className='sb-annotation'>fixed sizes</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `160px repeat(${iconSizes.length}, 1fr)`,
            gap: '8px 16px',
            alignItems: 'start',
          }}
        >
          {/* Header row */}
          <span className='sb-annotation'>text \ icon</span>
          {iconSizes.map(size => (
            <span key={size} className='sb-annotation'>
              {size}
            </span>
          ))}

          {/* Data rows */}
          {textSizes.map(({ label, className }) => (
            <>
              <span key={`${label}-label`} className='sb-annotation'>
                {label}
              </span>
              {iconSizes.map(size => (
                <p key={`${label}-${size}`} className={`${className} text-text-primary`}>
                  <TriangleAlert size={size} /> Alert
                </p>
              ))}
            </>
          ))}
        </div>
      </VStack>

      {/* Color inheritance */}
      <VStack gap={8} align='stretch'>
        <p className='sb-annotation'>colour follows the text</p>
        <VStack gap={4} align='start'>
          <p className='text-sm text-text-primary'>
            Default <TriangleAlert size='inherit' /> inherits text-primary
          </p>
          <p className='text-sm text-text-secondary'>
            Secondary <Info size='inherit' /> inherits text-secondary
          </p>
          <p className='text-sm text-text-danger'>
            Danger <TriangleAlert size='inherit' /> inherits text-danger
          </p>
          <p className='text-sm text-text-success'>
            Success <CircleCheck size='inherit' /> inherits text-success
          </p>
          <p className='text-sm text-text-warning'>
            Warning <TriangleAlert size='inherit' /> inherits text-warning
          </p>
          <p className='text-sm text-text-primary'>
            Mixed: primary text with <TriangleAlert size='inherit' className='text-text-danger' />{' '}
            explicit danger icon
          </p>
        </VStack>
      </VStack>

      {/* Multiline paragraph */}
      <VStack gap={8} align='stretch'>
        <p className='sb-annotation'>in flowing text</p>
        <p className='text-sm text-text-primary' style={{ maxWidth: '400px' }}>
          Click the <TriangleAlert size='inherit' /> icon to see warnings. You can also check{' '}
          <Info size='inherit' /> for more details about the issue.
        </p>
      </VStack>
    </VStack>
  ),
};
