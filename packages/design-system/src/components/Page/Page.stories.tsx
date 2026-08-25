import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Page, type PageProps } from './Page';
import { PageActions } from './PageActions';
import { PageContent } from './PageContent';
import { PageHeader } from './PageHeader';
import { PageTitle } from './PageTitle';

const DESCRIPTION = [
  'The frame a microfrontend page renders into — a header carrying the title and its actions, then the content below.',
  'It tells the host shell how it wants to be laid out (`fullSize`, `fixedHeight`) through context and falls back to sensible behaviour when there is no host, so the same page works inside the console and on its own.',
].join(' ');

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
        component: DESCRIPTION,
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

/** The whole frame: `PageTitle` with a count beside it, `PageActions` on the right, `PageContent` below, asking the shell for the full width and a fixed height. */
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

/** `contained` gives the page its own scroll container, which is what lets `PageHeader sticky` stick. Without it the shell does the scrolling and the header leaves with the content. */
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
