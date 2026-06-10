import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { ArrowRight } from '../../icons';
import { Button } from '../Button';
import { UtilityPage, type UtilityPageProps } from './UtilityPage';

const meta = {
  title: 'Pages/UtilityPage',
  component: UtilityPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full-page layout for error and utility pages. Displays a centered card with a decorative background, Wallarm branding, error title, description, and action buttons passed as children.',
      },
    },
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    description: { control: 'text' },
  },
} satisfies Meta<typeof UtilityPage>;

export default meta;

export const Error404: StoryFn<UtilityPageProps> = args => (
  <UtilityPage {...args}>
    <Button variant='primary' color='brand' size='large'>
      Take me home
    </Button>
  </UtilityPage>
);

Error404.args = {
  title: '404',
  subtitle: 'Page not found.',
  description: 'Check the link or head back home.',
};

export const Error403: StoryFn<UtilityPageProps> = args => (
  <UtilityPage {...args}>
    <Button variant='primary' color='brand' size='large'>
      Take me home
    </Button>
  </UtilityPage>
);

Error403.args = {
  title: '403',
  subtitle: 'No access.',
  description:
    "Your role doesn't include this page. If you think it should, your admin can fix that.",
};

export const Error500: StoryFn<UtilityPageProps> = args => (
  <UtilityPage {...args}>
    <Button variant='primary' color='brand' size='large'>
      Take me home
    </Button>
    <Button variant='secondary' color='neutral' size='large'>
      Still broken? Check status <ArrowRight />
    </Button>
  </UtilityPage>
);

Error500.args = {
  title: '500',
  subtitle: 'Something broke.',
  description:
    'On our side, not yours. Your protection is still running \u2014 the console just hiccuped.',
};

export const Offline: StoryFn<UtilityPageProps> = args => (
  <UtilityPage {...args}>
    <Button variant='primary' color='brand' size='large'>
      Try again
    </Button>
  </UtilityPage>
);

Offline.args = {
  title: 'Offline',
  subtitle: 'Something broke.',
  description:
    "Your protection isn't affected \u2014 it runs outside this tab. We'll reconnect automatically.",
};
