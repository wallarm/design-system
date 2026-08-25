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

const DESCRIPTION = [
  'A full-width message pinned above the header, for something account- or system-wide. The test is whether it would still matter on another page: yes and it is a `Banner`, no and it is an `Alert`.',
  'There is no success variant — “it worked” is a `Toast` — and no `icon` prop either: the icon appears only when a `BannerIcon` is composed in.',
].join(' ');

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
        component: DESCRIPTION,
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

/** The playground — toggle the controls to compose a banner and see which parts are optional. */
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

/** `primary` (dark) and `secondary` (light) are the neutral bars and carry no icon of their own; destructive, info and warning each bring one. */
export const AllColors: StoryFn<BannerProps> = () => (
  <div className='flex flex-col gap-16'>
    <Banner variant='primary'>
      <BannerContent>
        <BannerTitle>Message goes here</BannerTitle>
      </BannerContent>
    </Banner>

    <Banner variant='secondary'>
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

/** A description earns its place by adding the consequence — here the node version the feature needs — never by restating the title. */
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

/** A `BannerLink` inside the title, for when the action belongs in the sentence. Use the inline link or the trailing buttons, never both. */
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

/** Two lines is the ceiling, after which the text truncates into a tooltip. One line is what to aim for. */
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

/** `BannerIcon`’s `icon` prop overrides the variant default, or gives `primary` and `secondary` the icon they otherwise lack — which is how an announcement gets its megaphone. */
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

/** Trailing buttons in `BannerControls`, small and never solid, labelled with the verb that follows: “Renew”, not “Learn more”. */
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

/** `BannerClose` where the reader may dismiss it. Leave it off while the condition still holds, since a banner is meant to outlast a page view. */
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
