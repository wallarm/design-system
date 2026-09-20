import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Breadcrumbs } from '../Breadcrumbs/Breadcrumbs';
import { BreadcrumbsItem } from '../Breadcrumbs/BreadcrumbsItem';
import { Button } from '../Button';
import { NumericBadge } from '../NumericBadge';
import { SearchInput } from '../SearchInput';
import { SegmentedTabs } from '../SegmentedTabs/SegmentedTabs';
import { SegmentedTabsList } from '../SegmentedTabs/SegmentedTabsList';
import { SegmentedTabsTrigger } from '../SegmentedTabs/SegmentedTabsTrigger';
import { SettingsHeader, type SettingsHeaderProps } from './SettingsHeader';
import { SettingsHeaderActions } from './SettingsHeaderActions';
import { SettingsHeaderBreadcrumbs } from './SettingsHeaderBreadcrumbs';
import { SettingsHeaderDescription } from './SettingsHeaderDescription';
import { SettingsHeaderFilters } from './SettingsHeaderFilters';
import { SettingsHeaderHeading } from './SettingsHeaderHeading';
import { SettingsHeaderTitle } from './SettingsHeaderTitle';

const DESCRIPTION = [
  'A compound settings-page header with three optional rows: breadcrumbs, a heading row (title, description, and actions), and a filter bar.',
  'All rows are optional — compose only what the page needs. Existing DS components (Breadcrumbs, SearchInput, SegmentedTabs, Button) are passed as children, never reimplemented.',
].join(' ');

const meta = {
  title: 'Layout/SettingsHeader',
  component: SettingsHeader,
  subcomponents: {
    SettingsHeaderActions,
    SettingsHeaderBreadcrumbs,
    SettingsHeaderDescription,
    SettingsHeaderFilters,
    SettingsHeaderHeading,
    SettingsHeaderTitle,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof SettingsHeader>;

export default meta;

/** All three rows: breadcrumbs, heading with description and action, and a filter bar with search and segmented tabs. */
export const Full: StoryFn<SettingsHeaderProps> = () => {
  const [search, setSearch] = useState('');

  return (
    <SettingsHeader>
      <SettingsHeaderBreadcrumbs>
        <Breadcrumbs>
          <BreadcrumbsItem href='/settings'>Settings</BreadcrumbsItem>
          <BreadcrumbsItem>Service accounts</BreadcrumbsItem>
        </Breadcrumbs>
      </SettingsHeaderBreadcrumbs>

      <SettingsHeaderHeading>
        <div className='flex flex-col'>
          <SettingsHeaderTitle>Service accounts</SettingsHeaderTitle>
          <SettingsHeaderDescription>
            Identities for automation and API access — they sign in with keys or tokens instead of a
            password.
          </SettingsHeaderDescription>
        </div>
        <SettingsHeaderActions>
          <Button variant='primary' color='brand'>
            Create service account
          </Button>
        </SettingsHeaderActions>
      </SettingsHeaderHeading>

      <SettingsHeaderFilters>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder='Search name'
          className='w-[320px]'
        />
        <SegmentedTabs defaultValue='all'>
          <SegmentedTabsList>
            <SegmentedTabsTrigger value='all'>
              All <NumericBadge>1</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='active'>
              Active <NumericBadge>1</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='deactivated'>
              Deactivated <NumericBadge>1</NumericBadge>
            </SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      </SettingsHeaderFilters>
    </SettingsHeader>
  );
};

/** Just the heading row with title, description, and no actions or filters. */
export const HeadingOnly: StoryFn<SettingsHeaderProps> = () => (
  <SettingsHeader>
    <SettingsHeaderHeading>
      <div className='flex flex-col'>
        <SettingsHeaderTitle>General settings</SettingsHeaderTitle>
        <SettingsHeaderDescription>
          Configure your workspace preferences and notifications.
        </SettingsHeaderDescription>
      </div>
    </SettingsHeaderHeading>
  </SettingsHeader>
);

/** Breadcrumbs, heading with multiple action buttons, no filter bar. */
export const WithBreadcrumbsAndActions: StoryFn<SettingsHeaderProps> = () => (
  <SettingsHeader>
    <SettingsHeaderBreadcrumbs>
      <Breadcrumbs>
        <BreadcrumbsItem href='/settings'>Settings</BreadcrumbsItem>
        <BreadcrumbsItem>Integrations</BreadcrumbsItem>
      </Breadcrumbs>
    </SettingsHeaderBreadcrumbs>

    <SettingsHeaderHeading>
      <div className='flex flex-col'>
        <SettingsHeaderTitle>Integrations</SettingsHeaderTitle>
        <SettingsHeaderDescription>
          Connect third-party services to your workspace.
        </SettingsHeaderDescription>
      </div>
      <SettingsHeaderActions>
        <Button variant='secondary' color='neutral'>
          Export
        </Button>
        <Button variant='primary' color='brand'>
          Add integration
        </Button>
      </SettingsHeaderActions>
    </SettingsHeaderHeading>
  </SettingsHeader>
);

/** The simplest usage — only a page title, no description, actions, or filters. */
export const TitleOnly: StoryFn<SettingsHeaderProps> = () => (
  <SettingsHeader>
    <SettingsHeaderHeading>
      <SettingsHeaderTitle>Dashboard</SettingsHeaderTitle>
    </SettingsHeaderHeading>
  </SettingsHeader>
);
