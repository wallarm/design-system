import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Megaphone } from '../../icons';
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
          'until the state that caused them is resolved. Supports 5 variants: primary ' +
          '(dark/neutral), secondary, destructive, info, and warning. Compose BannerIcon to ' +
          'show a leading icon — destructive, info, and warning render a default icon, while ' +
          'primary and secondary render none unless you pass a custom `icon`. Compose with: ' +
          'BannerIcon, BannerContent, BannerTitle, BannerDescription, BannerLink, ' +
          'BannerControls, BannerClose.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'destructive', 'info', 'warning'],
      description: 'Visual variant of the banner',
    },
  },
} satisfies Meta<typeof Banner>;

export default meta;

interface BannerControlArgs extends BannerProps {
  customIcon: boolean;
  description: boolean;
  inlineAction: boolean;
  actions: boolean;
  closable: boolean;
  title: string;
  text: string;
}

/**
 * Interactive preview — toggle the controls below to compose the banner.
 * BannerIcon shows the default icon on destructive, info, and warning; enable
 * "customIcon" to override it (and to add an icon to primary/secondary).
 */
export const Default: StoryFn<BannerControlArgs> = ({
  variant,
  customIcon,
  description,
  inlineAction,
  actions,
  closable,
  title,
  text,
}) => (
  <Banner variant={variant}>
    <BannerIcon
      icon={customIcon ? <Megaphone size='lg' className='text-icon-brand' /> : undefined}
    />
    <BannerContent>
      <BannerTitle action={inlineAction ? <BannerLink href='#'>Action</BannerLink> : undefined}>
        {title}
      </BannerTitle>
      {description && <BannerDescription>{text}</BannerDescription>}
    </BannerContent>
    {(actions || closable) && (
      <BannerControls>
        {actions && (
          <Button variant='secondary' color='neutral' size='small'>
            Button
          </Button>
        )}
        {closable && <BannerClose />}
      </BannerControls>
    )}
  </Banner>
);

Default.args = {
  variant: 'info',
  customIcon: false,
  description: false,
  inlineAction: false,
  actions: false,
  closable: false,
  title: 'Message goes here',
  text: 'Description goes here',
};

Default.argTypes = {
  customIcon: {
    control: 'boolean',
    description: 'Override with a custom icon',
  },
  description: { control: 'boolean', description: 'Show the description line' },
  inlineAction: {
    control: 'boolean',
    description: 'Show an inline action link in the title',
  },
  actions: { control: 'boolean', description: 'Show a trailing action button' },
  closable: { control: 'boolean', description: 'Show the close button' },
  title: { control: 'text', description: 'Title (message) text' },
  text: { control: 'text', description: 'Description text' },
};

/**
 * primary and secondary have no icon by default; destructive, info, and warning
 * each render their own default icon.
 */
export const AllColors: StoryFn<BannerProps> = () => (
  <div className='flex flex-col gap-16'>
    <Banner variant='primary'>
      <BannerIcon />
      <BannerContent>
        <BannerTitle>Message goes here</BannerTitle>
      </BannerContent>
    </Banner>

    <Banner variant='secondary'>
      <BannerIcon />
      <BannerContent>
        <BannerTitle>Message goes here</BannerTitle>
      </BannerContent>
    </Banner>

    <Banner variant='destructive'>
      <BannerIcon />
      <BannerContent>
        <BannerTitle>Message goes here</BannerTitle>
      </BannerContent>
    </Banner>

    <Banner variant='info'>
      <BannerIcon />
      <BannerContent>
        <BannerTitle>Message goes here</BannerTitle>
      </BannerContent>
    </Banner>

    <Banner variant='warning'>
      <BannerIcon />
      <BannerContent>
        <BannerTitle>Message goes here</BannerTitle>
      </BannerContent>
    </Banner>
  </div>
);

export const WithDescription: StoryFn<BannerProps> = () => (
  <Banner variant='info'>
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
  <Banner variant='warning'>
    <BannerIcon />
    <BannerContent>
      <BannerTitle action={<BannerLink href='#'>Learn more</BannerLink>}>
        You have exceeded the monthly quota for your company
      </BannerTitle>
    </BannerContent>
  </Banner>
);

/**
 * Long messages wrap and clamp to a maximum of two lines, then truncate with an
 * ellipsis. A tooltip reveals the full text on hover. One line is preferred.
 */
export const LongText: StoryFn<BannerProps> = () => (
  <Banner variant='primary'>
    <BannerContent>
      <BannerTitle lineClamp={2}>
        Banner will render at most two lines before truncating the text. Banners address system-wide
        conditions, not individual user actions. The voice should be institutional and factual, even
        when the situation is urgent. Every word must earn its place within the 2-line budget, but
        one line is more preferred.
      </BannerTitle>
    </BannerContent>
    <BannerControls>
      <BannerClose />
    </BannerControls>
  </Banner>
);

/**
 * Override the default variant icon (or add one to primary/secondary) by
 * passing the `icon` prop to BannerIcon.
 */
export const CustomIcon: StoryFn<BannerProps> = () => (
  <Banner variant='secondary'>
    <BannerIcon icon={<Megaphone size='lg' className='text-icon-brand' />} />
    <BannerContent>
      <BannerTitle action={<BannerLink href='#'>View plans</BannerLink>}>
        New features are now available on the Pro plan
      </BannerTitle>
    </BannerContent>
    <BannerControls>
      <BannerClose />
    </BannerControls>
  </Banner>
);

export const WithActions: StoryFn<BannerProps> = () => (
  <Banner variant='destructive'>
    <BannerIcon />
    <BannerContent>
      <BannerTitle>Your subscription has expired</BannerTitle>
    </BannerContent>
    <BannerControls>
      <Button variant='outline' color='neutral' size='small'>
        Dismiss
      </Button>
      <Button variant='outline' color='neutral' size='small'>
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
    <Banner variant='primary'>
      <BannerContent>
        <BannerTitle>A new version of the dashboard is available</BannerTitle>
      </BannerContent>
      <BannerControls>
        <BannerClose onClick={() => setOpen(false)} />
      </BannerControls>
    </Banner>
  );
};
