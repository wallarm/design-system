import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { ArrowRight } from '../../icons';
import { Button } from '../Button';
import { UtilityPage, type UtilityPageProps } from './UtilityPage';

const DESCRIPTION = [
  'The whole-screen state template — 404, 403, 500, offline — for when the app itself cannot render; reach for `EmptyState` when only a region came back empty, and `Banner` or `Alert` when the app still works and this is only a message.',
  'It replaces the view and brings its own background and `Logo`, so what you supply is copy and one primary way out, not a layout.',
].join(' ');

const meta = {
  title: 'Pages/UtilityPage',
  component: UtilityPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: DESCRIPTION,
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

/** The lightest case — the address is wrong, not the product — so the description points at the link and the single button is the way back. */
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

/** A permission wall rather than a failure: the copy names whose role is short and who can change it, so the reader knows the next move is a person and not a retry. */
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

/** Ours to fix, said plainly, with the house reassurance that protection keeps running while the console does not. It is also the only story with a second button — one primary way out, at most one secondary. */
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

/** The connection dropped, not the service: 'Try again' is the way out, and the copy promises automatic reconnection so nobody sits watching the button. */
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
