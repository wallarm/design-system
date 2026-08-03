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
import { ProviderIcon } from '../ProviderIcon/ProviderIcon';
import { providerIconPaths } from '../ProviderIcon/paths';
import { socialIconPaths } from '../SocialIcon/paths';
import { SocialIcon } from '../SocialIcon/SocialIcon';
import type { SvgIconSize } from '../SvgIcon';
import { categoryNames, iconToCategory } from './const';

// SocialIcon/ProviderIcon live in this barrel too, but take a required `name`
// prop (one component, many brands) rather than being a standalone glyph —
// each brand/provider is unpacked into its own gallery entry below instead.
const NAME_PARAMETERIZED_COMPONENTS = new Set(['SocialIcon', 'ProviderIcon']);

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
  Object.entries(iconExports).filter(
    ([name, value]) => typeof value === 'function' && !NAME_PARAMETERIZED_COMPONENTS.has(name),
  ),
) as Record<
  string,
  React.FC<{ size?: SvgIconSize; className?: string; title?: string; style?: React.CSSProperties }>
>;

const monoEntries: GalleryEntry[] = Object.entries(allIcons).map(([name, Component]) => ({
  name,
  category: iconToCategory.get(name) ?? 'General',
  copyText: `<${name} />`,
  Component,
}));

const socialEntries: GalleryEntry[] = Object.keys(socialIconPaths).map(name => ({
  name,
  category: 'Social',
  copyText: `<SocialIcon name='${name}' />`,
  Component: props => <SocialIcon {...props} name={name as keyof typeof socialIconPaths} />,
}));

const providerEntries: GalleryEntry[] = Object.keys(providerIconPaths).map(name => ({
  name,
  category: 'Providers',
  copyText: `<ProviderIcon name='${name}' />`,
  Component: props => <ProviderIcon {...props} name={name as keyof typeof providerIconPaths} />,
}));

const allEntries: GalleryEntry[] = [...monoEntries, ...socialEntries, ...providerEntries];

const galleryCategoryNames = [...categoryNames, 'Social', 'Providers'];

const categoryCounts = allEntries.reduce<Record<string, number>>((acc, entry) => {
  acc[entry.category] = (acc[entry.category] ?? 0) + 1;
  return acc;
}, {});

const { Check, CircleCheck, Info, TriangleAlert } = iconExports;

const meta: Meta = {
  title: 'Primitives/Icons',
  parameters: {
    layout: 'padded',
    docs: {
      canvas: {
        sourceState: 'none',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

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
            {galleryCategoryNames.map(category => (
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

export const IconSizes: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px' }}>Icon Sizes</h3>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Check size='xs' title='Check icon XS' />
          <div style={{ fontSize: '12px', marginTop: '4px' }}>XS</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Check size='sm' title='Check icon SM' />
          <div style={{ fontSize: '12px', marginTop: '4px' }}>SM</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Check size='md' title='Check icon MD' />
          <div style={{ fontSize: '12px', marginTop: '4px' }}>MD</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Check size='lg' title='Check icon LG' />
          <div style={{ fontSize: '12px', marginTop: '4px' }}>LG</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Check size='xl' title='Check icon XL' />
          <div style={{ fontSize: '12px', marginTop: '4px' }}>XL</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Check size='2xl' title='Check icon 2XL' />
          <div style={{ fontSize: '12px', marginTop: '4px' }}>2XL</div>
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

/**
 * Demonstrates how icons behave inside text at different text and icon sizes.
 *
 * - **Inherit (1em)**: icon scales with font size via `size="current"`
 * - **Fixed sizes**: icon stays at its fixed pixel size regardless of text size
 * - **Color inheritance**: icon inherits text color, can be overridden
 */
export const IconsInText: Story = {
  render: () => (
    <VStack gap={20} align='stretch'>
      {/* Inherit size */}
      <VStack gap={8} align='stretch'>
        <Text weight='bold' size='sm' color='secondary'>
          Inherit size — icon scales with text via size=&quot;inherit&quot;
        </Text>
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
        <Text weight='bold' size='sm' color='secondary'>
          Fixed icon sizes in different text sizes
        </Text>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `100px repeat(${iconSizes.length}, 1fr)`,
            gap: '8px 16px',
            alignItems: 'start',
          }}
        >
          {/* Header row */}
          <Text size='xs' color='secondary' weight='medium'>
            text \ icon
          </Text>
          {iconSizes.map(size => (
            <Text key={size} size='xs' color='secondary' weight='medium'>
              {size}
            </Text>
          ))}

          {/* Data rows */}
          {textSizes.map(({ label, className }) => (
            <>
              <Text key={`${label}-label`} size='xs' color='secondary'>
                {label}
              </Text>
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
        <Text weight='bold' size='sm' color='secondary'>
          Color inheritance — icon inherits text color
        </Text>
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
        <Text weight='bold' size='sm' color='secondary'>
          Icon in flowing text (baseline alignment)
        </Text>
        <p className='text-sm text-text-primary' style={{ maxWidth: '400px' }}>
          Click the <TriangleAlert size='inherit' /> icon to see warnings. You can also check{' '}
          <Info size='inherit' /> for more details about the issue.
        </p>
      </VStack>
    </VStack>
  ),
};
