import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Page, type PageProps } from './Page';
import { PageActions } from './PageActions';
import { PageContent } from './PageContent';
import { PageHeader } from './PageHeader';
import { PageTitle } from './PageTitle';

const meta = {
  title: 'Layout/Page',
  component: Page,
  subcomponents: {
    PageActions,
    PageContent,
    PageHeader,
    PageTitle,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Page compound component for defining microfrontend page layout. ' +
          'Communicates layout preferences (fullSize, fixedHeight) to the host shell ' +
          'via PageHostProvider context. Works standalone when no host provider is present.',
      },
    },
  },
  argTypes: {
    name: {
      control: { type: 'text' },
      description: 'Unique page identifier communicated to the host shell',
    },
    fullSize: {
      control: { type: 'boolean' },
      description: 'Whether the page should occupy full available width',
    },
    fixedHeight: {
      control: { type: 'boolean' },
      description: 'Whether the page should have a fixed height',
    },
  },
} satisfies Meta<typeof Page>;

export default meta;

export const Basic: StoryFn<PageProps> = () => {
  return (
    <Page name='full-featured' fullSize fixedHeight>
      <PageHeader>
        <PageTitle>Page title</PageTitle>

        <Badge>1000</Badge>

        <PageActions>
          <Button variant='secondary' color='neutral' size='small'>
            Export
          </Button>
          <Button size='small'>Settings</Button>
        </PageActions>
      </PageHeader>

      <PageContent>
        <p>Full-featured page with header actions, tabs (including disabled), and content area.</p>
      </PageContent>
    </Page>
  );
};

export const StickyHeader: StoryFn<PageProps> = () => {
  return (
    <Page name='sticky-header' contained>
      <PageHeader sticky>
        <PageTitle>Sticky header</PageTitle>

        <PageActions>
          <Button variant='secondary' color='neutral' size='small'>
            Export
          </Button>
          <Button size='small'>Settings</Button>
        </PageActions>
      </PageHeader>

      <PageContent>
        {Array.from({ length: 40 }, (_, i) => (
          <p key={`row-${i + 1}`} className='py-8'>
            Content row {i + 1}
          </p>
        ))}
      </PageContent>
    </Page>
  );
};
