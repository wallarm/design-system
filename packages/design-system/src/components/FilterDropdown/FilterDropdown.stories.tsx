import { useState } from 'react';
import { createListCollection } from '@ark-ui/react/collection';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Button } from '../Button';
import { SearchInput } from '../SearchInput';
import { SegmentedTabs, SegmentedTabsList, SegmentedTabsTrigger } from '../SegmentedTabs';
import { FilterDropdown } from './FilterDropdown';
import { FilterDropdownAllOption } from './FilterDropdownAllOption';
import { FilterDropdownClear } from './FilterDropdownClear';
import { FilterDropdownContent } from './FilterDropdownContent';
import { useFilterDropdown } from './FilterDropdownContext';
import { FilterDropdownEmpty } from './FilterDropdownEmpty';
import { FilterDropdownFooter } from './FilterDropdownFooter';
import { FilterDropdownGroup } from './FilterDropdownGroup';
import { FilterDropdownGroupLabel } from './FilterDropdownGroupLabel';
import { FilterDropdownOption } from './FilterDropdownOption';
import { FilterDropdownSearch } from './FilterDropdownSearch';
import { FilterDropdownSelected } from './FilterDropdownSelected';
import { FilterDropdownTrigger } from './FilterDropdownTrigger';

const DESCRIPTION = [
  'A lightweight filter for a list or table toolbar: a 36px trigger that opens a menu and narrows the list by one attribute. Picks apply at once — there is no Apply step.',
  'Single mode is for exclusive values and starts with «All …», which is also the reset; multi mode ticks several values that are OR-ed and clears with the ✕. From eight options the menu gains a search, and in multi mode a "Selected" section on top.',
  'Reach for `Select` inside forms, and for `FilterInput` when the query combines several attributes and operators.',
].join(' ');

interface Item {
  value: string;
  label: string;
  count?: number;
  category?: string;
}

const environments: Item[] = [
  { value: 'production', label: 'Production' },
  { value: 'pre-production', label: 'Pre-production' },
  { value: 'staging', label: 'Staging' },
  { value: 'development', label: 'Development' },
];

const types: Item[] = [
  { value: 'lua', label: 'Lua', count: 12 },
  { value: 'wasm', label: 'WASM', count: 4 },
  { value: 'plugin', label: 'Plugin', count: 7 },
];

const letters: Item[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map(
  (letter, index) => ({
    value: letter.toLowerCase(),
    label: `Scope ${letter}`,
    count: (index * 7) % 23,
    category: index < 6 ? 'Group 1' : 'Group 2',
  }),
);

const longLabels: Item[] = [
  { value: 'eu', label: 'Europe — Frankfurt (eu-central-1) primary cluster' },
  { value: 'us', label: 'United States — North Virginia (us-east-1) failover cluster' },
  { value: 'ap', label: 'Asia Pacific — Singapore (ap-southeast-1)' },
];

/** The standard menu: every part in the order the spec renders them. */
const Menu = ({ withHint = false }: { withHint?: boolean }) => {
  const { groups } = useFilterDropdown<Item>();

  return (
    <FilterDropdownContent>
      <FilterDropdownSearch />
      <FilterDropdownAllOption />
      <FilterDropdownSelected<Item>>
        {item => (
          <FilterDropdownOption item={item} hint={withHint ? item.count : undefined}>
            {item.label}
          </FilterDropdownOption>
        )}
      </FilterDropdownSelected>
      {groups.map(([group, items]) => (
        <FilterDropdownGroup key={group}>
          {group && <FilterDropdownGroupLabel>{group}</FilterDropdownGroupLabel>}
          {items.map(item => (
            <FilterDropdownOption
              key={item.value}
              item={item}
              hint={withHint ? item.count : undefined}
            >
              {item.label}
            </FilterDropdownOption>
          ))}
        </FilterDropdownGroup>
      ))}
      <FilterDropdownEmpty />
      <FilterDropdownFooter />
    </FilterDropdownContent>
  );
};

const meta = {
  title: 'Patterns/FilterDropdown',
  component: FilterDropdown,
  subcomponents: {
    FilterDropdownTrigger,
    FilterDropdownClear,
    FilterDropdownContent,
    FilterDropdownSearch,
    FilterDropdownAllOption,
    FilterDropdownSelected,
    FilterDropdownGroup,
    FilterDropdownGroupLabel,
    FilterDropdownOption,
    FilterDropdownEmpty,
    FilterDropdownFooter,
  },
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
  argTypes: {
    collection: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    onValueChange: { control: false },
    filterFn: { control: false },
    label: { control: 'text' },
    allLabel: { control: 'text' },
    multiple: { control: 'boolean' },
    searchThreshold: { control: 'number' },
  },
} satisfies Meta<typeof FilterDropdown>;

export default meta;

/**
 * Single mode: the trigger reads «All …» while unset and the picked value once set; picking closes
 * the menu. Analytics ids go on the parts that render the real targets — here the trigger.
 */
export const Default: StoryFn<typeof FilterDropdown> = () => (
  <FilterDropdown
    label='Environment'
    allLabel='All environments'
    collection={createListCollection({ items: environments })}
    data-testid='filter-dropdown'
  >
    <FilterDropdownTrigger data-analytics-id='ENV_FILTER' />
    <Menu />
  </FilterDropdown>
);

/**
 * Multi mode: checkboxes, OR-ed, the menu stays open. The trigger shows the name with the value or
 * a count, and the ✕ (or Backspace on the trigger) clears. Pass your own `FilterDropdownClear` as
 * the trigger's child to put an analytics id on the ✕.
 */
export const Multi: StoryFn<typeof FilterDropdown> = () => (
  <FilterDropdown
    label='Type'
    multiple
    collection={createListCollection({ items: types })}
    defaultValue={['lua']}
    data-testid='filter-dropdown'
  >
    <FilterDropdownTrigger data-analytics-id='TYPE_FILTER'>
      <FilterDropdownClear data-analytics-id='TYPE_FILTER_CLEAR' />
    </FilterDropdownTrigger>
    <Menu />
  </FilterDropdown>
);

const LabelFormRow = ({
  caption,
  multiple = false,
  value,
  testId,
}: {
  caption: string;
  multiple?: boolean;
  value: string[];
  testId: string;
}) => (
  <div className='flex items-center gap-16'>
    <p className='sb-annotation w-160'>{caption}</p>
    <FilterDropdown
      label='Type'
      allLabel='All types'
      multiple={multiple}
      collection={createListCollection({ items: types })}
      defaultValue={value}
      data-testid={testId}
    >
      <FilterDropdownTrigger />
      <Menu />
    </FilterDropdown>
  </div>
);

/** Every form the trigger takes: dashed while unset, solid with a shadow once set. */
export const LabelForms: StoryFn<typeof FilterDropdown> = () => (
  <div className='flex flex-col gap-12'>
    <LabelFormRow caption='single, unset' value={[]} testId='single-unset' />
    <LabelFormRow caption='single, set' value={['wasm']} testId='single-set' />
    <LabelFormRow caption='multi, unset' multiple value={[]} testId='multi-unset' />
    <LabelFormRow caption='multi, one value' multiple value={['lua']} testId='multi-one' />
    <LabelFormRow
      caption='multi, several values'
      multiple
      value={['lua', 'wasm', 'plugin']}
      testId='multi-many'
    />
  </div>
);

/** Disabled keeps the value readable — the ✕ and the count stay visible, just inert. */
export const States: StoryFn<typeof FilterDropdown> = () => (
  <div className='flex flex-col gap-12'>
    {(
      [
        ['disabled, unset', false, []],
        ['disabled, single set', false, ['wasm']],
        ['disabled, multi set', true, ['lua', 'wasm']],
      ] as const
    ).map(([caption, multiple, value]) => (
      <div key={caption} className='flex items-center gap-16'>
        <p className='sb-annotation w-160'>{caption}</p>
        <FilterDropdown
          label='Type'
          allLabel='All types'
          multiple={multiple}
          disabled
          collection={createListCollection({ items: types })}
          defaultValue={[...value]}
          data-testid={`disabled-${caption.replace(/\W+/g, '-')}`}
        >
          <FilterDropdownTrigger />
          <Menu />
        </FilterDropdown>
      </div>
    ))}
  </div>
);

/**
 * From `searchThreshold` options (8 by default) the menu gains a search that takes focus on open,
 * and multi mode repeats what was picked in a "Selected" section on top. It is a snapshot: rows
 * stay put while you tick, and it hides while a query is active.
 */
export const WithSearch: StoryFn<typeof FilterDropdown> = () => (
  <div className='flex gap-8'>
    <FilterDropdown
      label='Scope'
      multiple
      collection={createListCollection({ items: letters })}
      defaultValue={['f', 'c']}
      data-testid='filter-dropdown-multi'
    >
      <FilterDropdownTrigger />
      <Menu />
    </FilterDropdown>
    <FilterDropdown
      label='Scope'
      allLabel='All scopes'
      collection={createListCollection({ items: letters })}
      data-testid='filter-dropdown-single'
    >
      <FilterDropdownTrigger />
      <Menu />
    </FilterDropdown>
  </div>
);

/** A `groupBy` collection renders one labelled group per entry of `useFilterDropdown().groups`. */
export const Groups: StoryFn<typeof FilterDropdown> = () => (
  <FilterDropdown
    label='Scope'
    multiple
    collection={createListCollection({ items: letters, groupBy: item => item.category ?? '' })}
    data-testid='filter-dropdown'
  >
    <FilterDropdownTrigger />
    <Menu />
  </FilterDropdown>
);

/** `hint` puts secondary text, such as a count, at the right end of a row, before the check. */
export const Hint: StoryFn<typeof FilterDropdown> = () => (
  <FilterDropdown
    label='Type'
    multiple
    collection={createListCollection({ items: types })}
    data-testid='filter-dropdown'
  >
    <FilterDropdownTrigger />
    <Menu withHint />
  </FilterDropdown>
);

/**
 * The trigger stops at 180px and ellipsises, with the full value on hover; the menu hugs its
 * options up to 360px and wraps longer ones.
 */
export const LongLabels: StoryFn<typeof FilterDropdown> = () => (
  <div className='flex gap-8'>
    <FilterDropdown
      label='Region'
      allLabel='All regions'
      collection={createListCollection({ items: longLabels })}
      defaultValue={['us']}
      data-testid='filter-dropdown-single'
    >
      <FilterDropdownTrigger />
      <Menu />
    </FilterDropdown>
    <FilterDropdown
      label='Deployment region'
      multiple
      collection={createListCollection({ items: longLabels })}
      defaultValue={['eu']}
      data-testid='filter-dropdown-multi'
    >
      <FilterDropdownTrigger />
      <Menu />
    </FilterDropdown>
  </div>
);

/** The toolbar it is made for: a search, scoped views, then one filter per attribute. */
export const FilterRow: StoryFn<typeof FilterDropdown> = () => {
  const [query, setQuery] = useState('');

  return (
    <div className='flex flex-wrap items-center gap-8'>
      <div className='w-240'>
        <SearchInput value={query} onChange={setQuery} placeholder='Search rules' />
      </div>
      <SegmentedTabs defaultValue='all'>
        <SegmentedTabsList>
          <SegmentedTabsTrigger value='all'>All</SegmentedTabsTrigger>
          <SegmentedTabsTrigger value='active'>Active</SegmentedTabsTrigger>
          <SegmentedTabsTrigger value='blocked'>Blocked</SegmentedTabsTrigger>
        </SegmentedTabsList>
      </SegmentedTabs>
      <FilterDropdown
        label='Environment'
        allLabel='All environments'
        collection={createListCollection({ items: environments })}
        data-testid='filter-environment'
      >
        <FilterDropdownTrigger data-analytics-id='RULES_ENV_FILTER' />
        <Menu />
      </FilterDropdown>
      <FilterDropdown
        label='Type'
        multiple
        collection={createListCollection({ items: types })}
        data-testid='filter-type'
      >
        <FilterDropdownTrigger data-analytics-id='RULES_TYPE_FILTER' />
        <Menu withHint />
      </FilterDropdown>
      <FilterDropdown
        label='Scope'
        multiple
        collection={createListCollection({ items: letters })}
        data-testid='filter-scope'
      >
        <FilterDropdownTrigger data-analytics-id='RULES_SCOPE_FILTER' />
        <Menu />
      </FilterDropdown>
    </div>
  );
};

/**
 * Controlled with `value` / `onValueChange`. The handler only ever receives your own values —
 * `[]` for unset — never the internal «All» or "Selected" ones.
 */
export const Controlled: StoryFn<typeof FilterDropdown> = () => {
  const [value, setValue] = useState<string[]>(['pre-production']);
  const collection = createListCollection({ items: environments });

  return (
    <div className='flex flex-col items-start gap-12'>
      <FilterDropdown
        label='Environment'
        allLabel='All environments'
        collection={collection}
        value={value}
        onValueChange={details => setValue(details.value)}
        data-testid='filter-dropdown'
      >
        <FilterDropdownTrigger />
        <Menu />
      </FilterDropdown>
      <p className='sb-annotation' data-testid='filter-dropdown-value'>
        value: {JSON.stringify(value)}
      </p>
      <Button variant='outline' color='neutral' size='small' onClick={() => setValue([])}>
        Reset
      </Button>
    </div>
  );
};
