import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Button } from '../Button';
import { Banner, type BannerProps } from './Banner';
import { BannerClose } from './BannerClose';
import { BannerContent } from './BannerContent';
import { BannerControls } from './BannerControls';
import { BannerDescription } from './BannerDescription';
import { BannerIcon } from './BannerIcon';
import { BannerLink } from './BannerLink';
import { BannerTitle } from './BannerTitle';

const meta = {
  title: 'Messaging/Banner',
  component: Banner,
  subcomponents: {
    BannerClose,
    BannerContent,
    BannerControls,
    BannerDescription,
    BannerIcon,
    BannerLink,
    BannerTitle,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Banner displays a prominent, full-width message at the top of the page ' +
          '(above the header) to communicate system-wide status, announcements, warnings, ' +
          'errors, or promotional messages. Banners persist until dismissed by the user or ' +
          'until the state that caused them is resolved. Supports 5 color variants: primary ' +
          '(dark/neutral), secondary, destructive, info, and warning. Compose with: BannerIcon, ' +
          'BannerContent, BannerTitle, BannerDescription, BannerLink, BannerControls, BannerClose.',
      },
    },
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'destructive', 'info', 'warning'],
      description: 'Color variant of the banner',
    },
  },
} satisfies Meta<typeof Banner>;

export default meta;

export const AllColors: StoryFn<BannerProps> = () => (
  <div className='flex flex-col gap-16'>
    <Banner color='primary'>
      <BannerIcon />
      <BannerContent>
        <BannerTitle>Message goes here</BannerTitle>
      </BannerContent>
    </Banner>

    <Banner color='secondary'>
      <BannerIcon />
      <BannerContent>
        <BannerTitle>Message goes here</BannerTitle>
      </BannerContent>
    </Banner>

    <Banner color='destructive'>
      <BannerIcon />
      <BannerContent>
        <BannerTitle>Message goes here</BannerTitle>
      </BannerContent>
    </Banner>

    <Banner color='info'>
      <BannerIcon />
      <BannerContent>
        <BannerTitle>Message goes here</BannerTitle>
      </BannerContent>
    </Banner>

    <Banner color='warning'>
      <BannerIcon />
      <BannerContent>
        <BannerTitle>Message goes here</BannerTitle>
      </BannerContent>
    </Banner>
  </div>
);

export const WithDescription: StoryFn<BannerProps> = () => (
  <Banner color='info'>
    <BannerIcon />
    <BannerContent>
      <BannerTitle>Credential Stuffing Detection</BannerTitle>
      <BannerDescription>
        Credential Stuffing Detection requires Wallarm node version 4.10.3 or higher.
      </BannerDescription>
    </BannerContent>
  </Banner>
);

export const WithInlineLink: StoryFn<BannerProps> = () => (
  <Banner color='warning'>
    <BannerIcon />
    <BannerContent>
      <BannerTitle action={<BannerLink href='#'>Learn more</BannerLink>}>
        You have exceeded the monthly quota for your company
      </BannerTitle>
    </BannerContent>
  </Banner>
);

export const WithActions: StoryFn<BannerProps> = () => (
  <Banner color='destructive'>
    <BannerIcon />
    <BannerContent>
      <BannerTitle>Your subscription has expired</BannerTitle>
    </BannerContent>
    <BannerControls>
      <Button variant='secondary' color='neutral' size='small'>
        Dismiss
      </Button>
      <Button variant='secondary' color='neutral' size='small'>
        Renew
      </Button>
    </BannerControls>
  </Banner>
);

export const Closable: StoryFn<BannerProps> = () => {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <div className='p-16'>
        <Button onClick={() => setOpen(true)}>Show banner</Button>
      </div>
    );
  }

  return (
    <Banner color='primary'>
      <BannerIcon />
      <BannerContent>
        <BannerTitle>A new version of the dashboard is available</BannerTitle>
      </BannerContent>
      <BannerControls>
        <BannerClose onClick={() => setOpen(false)} />
      </BannerControls>
    </Banner>
  );
};

export const NoIcon: StoryFn<BannerProps> = () => (
  <Banner color='secondary'>
    <BannerContent>
      <BannerTitle>Scheduled maintenance is planned for this weekend</BannerTitle>
    </BannerContent>
    <BannerControls>
      <BannerClose />
    </BannerControls>
  </Banner>
);

export const Playground: StoryFn<BannerProps> = args => (
  <Banner {...args}>
    <BannerIcon />
    <BannerContent>
      <BannerTitle action={<BannerLink href='#'>Action</BannerLink>}>Message goes here</BannerTitle>
      <BannerDescription>Description goes here</BannerDescription>
    </BannerContent>
    <BannerControls>
      <BannerClose />
    </BannerControls>
  </Banner>
);

Playground.args = {
  color: 'primary',
};
