import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { FilterCascade } from './FilterCascade';
import { FilterCascadeClear } from './FilterCascadeClear';
import { FilterCascadeContent } from './FilterCascadeContent';
import {
  FilterCascadeGroupLabel,
  FilterCascadeItems,
  FilterCascadeLevels,
  FilterCascadeParentItem,
} from './FilterCascadeLevel';
import { FilterCascadeSearch } from './FilterCascadeSearch';
import { FilterCascadeCheckboxItem, FilterCascadeSection } from './FilterCascadeSection';
import { FilterCascadeTrigger } from './FilterCascadeTrigger';
import { createFilterCascadeCollection } from './lib';

const DESCRIPTION = [
  'A filter over a hierarchy — organization › deployment › application, region › zone. The same 36px pill as `FilterDropdown`; each level opens as its own panel beside the option that opened it, and an item at any depth can be picked. The trigger reads the path: «Scope ● a › ● b», the tooltip carries it whole.',
  'Items are the consumer’s own objects, read through accessors; a level can load when it is first opened (`loadChildren`), and `parentLabel` adds the option that picks the level’s parent — «Deployment level». The search finds items at every depth.',
  'Compose the panels with `FilterCascadeLevels` to add group labels and options set apart; with no children, `FilterCascadeContent` renders the levels by itself. Reach for `FilterDropdown` when the values are flat.',
].join(' ');

type Kind = 'organization' | 'deployment' | 'application';

interface Scope {
  kind: Kind;
  uid: string;
  name: string;
  policies?: number;
}

/** The Flow management Scope marker: 6px dots, violet · sky · teal by level. */
const DOT: Record<Kind, string> = {
  organization: 'bg-badge-violet-strong',
  deployment: 'bg-badge-sky-strong',
  application: 'bg-badge-teal-strong',
};
const Dot = ({ kind }: { kind: Kind }) => (
  <span aria-hidden className={`inline-block size-6 shrink-0 rounded-full ${DOT[kind]}`} />
);

const policies = (count?: number) =>
  count === undefined
    ? undefined
    : count === 0
      ? 'No policies'
      : `${count} ${count === 1 ? 'policy' : 'policies'}`;

const organizationOnly: Scope = { kind: 'organization', uid: 'org', name: 'Organization only' };

const deploymentNames = [
  'Production US',
  'Production EU',
  'Staging US',
  'Staging EU',
  'Sandbox',
  'QA',
  'Load test',
  'Canary',
];
const deployments: Scope[] = deploymentNames.map((name, index) => ({
  kind: 'deployment',
  uid: name.toLowerCase().replace(/ /g, '-'),
  name,
  policies: index % 3 === 0 ? index + 2 : 0,
}));

const applicationsOf = (deployment: Scope): Scope[] =>
  ['api', 'checkout', 'mobile-gateway'].map((name, index) => ({
    kind: 'application',
    uid: `${deployment.uid}-${name}`,
    name,
    policies: index === 0 ? 2 : 0,
  }));

/** The applications arrive a moment after a deployment is first opened. */
const loadApplications = (deployment: Scope) =>
  new Promise<Scope[]>(resolve => setTimeout(() => resolve(applicationsOf(deployment)), 400));

const scopeAccessors = {
  getValue: (scope: Scope) => scope.uid,
  getLabel: (scope: Scope) => scope.name,
  hasChildren: (scope: Scope) => scope.kind === 'deployment',
  getIcon: (scope: Scope) => <Dot kind={scope.kind} />,
  getDescription: (scope: Scope) => policies(scope.policies),
};

const scopes = createFilterCascadeCollection<Scope>(
  [organizationOnly, ...deployments],
  scopeAccessors,
);

/** Plain `{ value, label, children }` items need no accessors. */
const regions = createFilterCascadeCollection([
  {
    value: 'eu',
    label: 'Europe',
    children: [
      { value: 'fra', label: 'Frankfurt' },
      { value: 'ams', label: 'Amsterdam' },
    ],
  },
  {
    value: 'us',
    label: 'United States',
    children: [
      { value: 'iad', label: 'North Virginia' },
      { value: 'sfo', label: 'San Francisco' },
    ],
  },
  { value: 'sg', label: 'Singapore' },
]);

const meta = {
  title: 'Patterns/FilterCascade',
  component: FilterCascade,
  parameters: {
    layout: 'padded',
    docs: { description: { component: DESCRIPTION } },
  },
  args: { label: 'Region', collection: regions },
} satisfies Meta<typeof FilterCascade>;

export default meta;

/** The minimal form: plain items, every level rendered by `FilterCascadeContent`. */
export const Default: StoryFn<typeof FilterCascade> = () => (
  <FilterCascade label='Region' collection={regions} data-testid='filter-cascade'>
    <FilterCascadeTrigger />
    <FilterCascadeContent />
  </FilterCascade>
);

/** The Flow management Scope menu, as in Figma. */
const ScopeMenu = ({ withToggle = true }: { withToggle?: boolean }) => {
  const [showOrganization, setShowOrganization] = useState(true);
  return (
    <FilterCascadeContent>
      <FilterCascadeSearch placeholder='Search' />
      <FilterCascadeLevels>
        {level =>
          level.depth === 0 ? (
            <>
              <FilterCascadeItems filter={item => item.node.value === organizationOnly.uid} />
              <FilterCascadeGroupLabel>Deployments</FilterCascadeGroupLabel>
              <FilterCascadeItems filter={item => item.node.value !== organizationOnly.uid} />
            </>
          ) : (
            <>
              <FilterCascadeParentItem />
              <FilterCascadeGroupLabel>Applications</FilterCascadeGroupLabel>
              <FilterCascadeItems />
            </>
          )
        }
      </FilterCascadeLevels>
      {withToggle && (
        <FilterCascadeSection>
          <FilterCascadeCheckboxItem
            icon={<Dot kind='organization' />}
            checked={showOrganization}
            onCheckedChange={setShowOrganization}
          >
            Show organization policies
          </FilterCascadeCheckboxItem>
        </FilterCascadeSection>
      )}
    </FilterCascadeContent>
  );
};

/** The Scope filter of Flow management: lazy applications, «Deployment level», search, toggle. */
export const ScopeFilter: StoryFn<typeof FilterCascade> = () => {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div className='flex flex-col gap-12'>
      <FilterCascade
        label='Scope'
        collection={scopes}
        loadChildren={loadApplications}
        parentLabel='Deployment level'
        value={value}
        onValueChange={details => setValue(details.value)}
        data-testid='filter-cascade-scope'
      >
        <FilterCascadeTrigger>
          <FilterCascadeClear data-analytics-id='SCOPE_CLEAR' />
        </FilterCascadeTrigger>
        <ScopeMenu />
      </FilterCascade>
      <code className='text-xs text-text-secondary'>value: {JSON.stringify(value)}</code>
    </div>
  );
};

const longCollection = createFilterCascadeCollection<Scope>(
  [{ kind: 'deployment', uid: 'eu1', name: 'production-eu-central-1-cluster' }],
  scopeAccessors,
);

/** A picked application: the trigger reads the path; only the deployment segment truncates. */
export const Picked: StoryFn<typeof FilterCascade> = () => (
  <FilterCascade
    label='Scope'
    collection={longCollection}
    loadChildren={async () => [{ kind: 'application', uid: 'checkout', name: 'checkout-api' }]}
    defaultValue={['eu1', 'checkout']}
    data-testid='filter-cascade-picked'
  >
    <FilterCascadeTrigger />
    <FilterCascadeContent />
  </FilterCascade>
);

/** The deployment itself, picked through «Deployment level». */
export const ParentPicked: StoryFn<typeof FilterCascade> = () => (
  <FilterCascade
    label='Scope'
    collection={scopes}
    loadChildren={loadApplications}
    parentLabel='Deployment level'
    defaultValue={['staging-us']}
    data-testid='filter-cascade-parent'
  >
    <FilterCascadeTrigger />
    <ScopeMenu withToggle={false} />
  </FilterCascade>
);

/** A level that fails to load offers a retry. */
export const LoadError: StoryFn<typeof FilterCascade> = () => (
  <FilterCascade
    label='Scope'
    collection={scopes}
    loadChildren={() => Promise.reject(new Error('Unavailable'))}
    parentLabel='Deployment level'
    data-testid='filter-cascade-error'
  >
    <FilterCascadeTrigger />
    <ScopeMenu withToggle={false} />
  </FilterCascade>
);

export const Disabled: StoryFn<typeof FilterCascade> = () => (
  <FilterCascade
    label='Region'
    collection={regions}
    defaultValue={['eu', 'fra']}
    disabled
    data-testid='filter-cascade-disabled'
  >
    <FilterCascadeTrigger />
    <FilterCascadeContent />
  </FilterCascade>
);
