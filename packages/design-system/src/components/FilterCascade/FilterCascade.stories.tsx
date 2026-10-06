import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { FilterCascade } from './FilterCascade';
import { FilterCascadeClear } from './FilterCascadeClear';
import { FilterCascadeContent } from './FilterCascadeContent';
import { useFilterCascade } from './FilterCascadeContext';
import {
  FilterCascadeItem,
  FilterCascadeItemDescription,
  FilterCascadeItemIcon,
  FilterCascadeItemText,
} from './FilterCascadeItem';
import {
  FilterCascadeEmpty,
  FilterCascadeGroupLabel,
  FilterCascadeLevel,
} from './FilterCascadeLevel';
import { FilterCascadeSearch } from './FilterCascadeSearch';
import { FilterCascadeCheckboxItem, FilterCascadeSection } from './FilterCascadeSection';
import { FilterCascadeTrigger } from './FilterCascadeTrigger';
import { createFilterCascadeCollection, type FilterCascadeNode } from './lib';

const DESCRIPTION = [
  'A filter over a hierarchy — organization › deployment › application, region › zone. The same 36px pill as `FilterDropdown`; its menu opens each level beside the previous one, and a node at any depth can be picked.',
  'The trigger reads the picked path: «Scope · ● a › ● b». The ✕ (or Backspace on the trigger) clears it.',
  'Compose the menu from parts — `useFilterCascade` gives the open levels — to add group labels, a search over the top level and rows that are not part of the path; with no children, `FilterCascadeContent` renders every level by itself.',
  'Reach for `FilterDropdown` when the values are flat.',
].join(' ');

/** The level dots from the Flow management Scope marker. */
const Dot = ({ color }: { color: string }) => (
  <span aria-hidden className={`inline-block size-6 shrink-0 rounded-full ${color}`} />
);
const deploymentDot = <Dot color='bg-badge-sky-strong' />;
const applicationDot = <Dot color='bg-badge-teal-strong' />;

const applications = (deployment: string, names: string[]): FilterCascadeNode[] =>
  names.map((name, index) => ({
    value: `${deployment}/${name}`,
    label: name,
    icon: applicationDot,
    description: index === 0 ? '2 policies' : 'No policies',
  }));

const scopes: FilterCascadeNode[] = [
  { value: 'org', label: 'Organization only', icon: <Dot color='bg-badge-violet-strong' /> },
  {
    value: 'production-us',
    label: 'Production US',
    icon: deploymentDot,
    description: '4 policies',
    children: [
      { value: 'production-us/level', label: 'Deployment level', icon: deploymentDot },
      ...applications('production-us', ['api', 'checkout', 'mobile-gateway']),
    ],
  },
  {
    value: 'staging-us',
    label: 'Staging US',
    icon: deploymentDot,
    description: 'No policies',
    children: [
      { value: 'staging-us/level', label: 'Deployment level', icon: deploymentDot },
      ...applications('staging-us', ['api']),
    ],
  },
  {
    value: 'production-eu',
    label: 'production-eu-central-1-cluster',
    icon: deploymentDot,
    description: '1 policy',
    children: applications('production-eu', ['checkout-api']),
  },
];

const collection = createFilterCascadeCollection(scopes);

const meta = {
  title: 'Patterns/FilterCascade',
  component: FilterCascade,
  parameters: {
    layout: 'padded',
    docs: { description: { component: DESCRIPTION } },
  },
  args: { label: 'Scope', collection },
} satisfies Meta<typeof FilterCascade>;

export default meta;

export const Default: StoryFn<typeof FilterCascade> = () => (
  <FilterCascade label='Scope' collection={collection} data-testid='filter-cascade'>
    <FilterCascadeTrigger />
    <FilterCascadeContent />
  </FilterCascade>
);

/** A picked path reads in the trigger; only the earlier segments truncate. */
export const Picked: StoryFn<typeof FilterCascade> = () => {
  const [value, setValue] = useState<string[]>(['production-eu', 'production-eu/checkout-api']);
  return (
    <div className='flex flex-col gap-12'>
      <FilterCascade
        label='Scope'
        collection={collection}
        value={value}
        onValueChange={details => setValue(details.value)}
        data-testid='filter-cascade-picked'
      >
        <FilterCascadeTrigger />
        <FilterCascadeContent />
      </FilterCascade>
      <code className='text-xs text-text-secondary'>value: {JSON.stringify(value)}</code>
    </div>
  );
};

/** Picking a node that opens a level — «this deployment, any application». */
export const ParentPicked: StoryFn<typeof FilterCascade> = () => (
  <FilterCascade
    label='Scope'
    collection={collection}
    defaultValue={['staging-us']}
    data-testid='filter-cascade-parent'
  >
    <FilterCascadeTrigger />
    <FilterCascadeContent />
  </FilterCascade>
);

export const Disabled: StoryFn<typeof FilterCascade> = () => (
  <FilterCascade
    label='Scope'
    collection={collection}
    defaultValue={['production-us', 'production-us/api']}
    disabled
    data-testid='filter-cascade-disabled'
  >
    <FilterCascadeTrigger />
    <FilterCascadeContent />
  </FilterCascade>
);

/** Many deployments: the search over the top level appears from eight. */
const manyDeployments: FilterCascadeNode[] = [
  scopes[0] as FilterCascadeNode,
  ...[
    'Production US',
    'Production EU',
    'Staging US',
    'Staging EU',
    'Sandbox',
    'QA',
    'Load test',
    'Canary',
  ].map((name, index) => ({
    value: name.toLowerCase().replace(/ /g, '-'),
    label: name,
    icon: deploymentDot,
    description: index % 3 === 0 ? `${index + 2} policies` : 'No policies',
    children: [
      { value: `${name}/level`, label: 'Deployment level', icon: deploymentDot },
      ...applications(name, ['api', 'checkout']),
    ],
  })),
];
const manyCollection = createFilterCascadeCollection(manyDeployments);

/**
 * The Flow management Scope filter, composed: «Organization only» above the «Deployments» group,
 * «Applications» in the next level, a search over deployments, and a toggle row under the levels.
 */
const ScopeLevels = () => {
  const { levels, isEmpty } = useFilterCascade();
  if (isEmpty) return <FilterCascadeEmpty />;
  return levels.map(level => {
    const [first, ...rest] = level.items;
    const top = level.depth === 0 && first?.node.value === 'org';
    return (
      <FilterCascadeLevel key={level.depth} level={level}>
        {top && first && <FilterCascadeItem item={first} />}
        <FilterCascadeGroupLabel>
          {level.depth === 0 ? 'Deployments' : 'Applications'}
        </FilterCascadeGroupLabel>
        {(top ? rest : level.items).map(item => (
          <FilterCascadeItem key={item.node.value} item={item}>
            <FilterCascadeItemIcon />
            <span className='flex min-w-0 flex-1 flex-col'>
              <FilterCascadeItemText />
              <FilterCascadeItemDescription />
            </span>
          </FilterCascadeItem>
        ))}
      </FilterCascadeLevel>
    );
  });
};

export const Composed: StoryFn<typeof FilterCascade> = () => {
  const [value, setValue] = useState<string[]>([]);
  const [showOrg, setShowOrg] = useState(true);
  return (
    <FilterCascade
      label='Scope'
      collection={manyCollection}
      value={value}
      onValueChange={details => setValue(details.value)}
      data-testid='filter-cascade-composed'
    >
      <FilterCascadeTrigger>
        <FilterCascadeClear data-analytics-id='SCOPE_CLEAR' />
      </FilterCascadeTrigger>
      <FilterCascadeContent>
        <FilterCascadeSearch placeholder='Search' />
        <ScopeLevels />
        <FilterCascadeSection>
          <FilterCascadeCheckboxItem checked={showOrg} onCheckedChange={setShowOrg}>
            Show organization policies
          </FilterCascadeCheckboxItem>
        </FilterCascadeSection>
      </FilterCascadeContent>
    </FilterCascade>
  );
};
