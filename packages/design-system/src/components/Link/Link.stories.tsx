import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { ArrowRight, SquareArrowOutUpRight } from '../../icons';
import { VStack } from '../Stack';
import { Link } from './Link';

const DESCRIPTION = [
  'The navigation member of the Actions family — a styled `<a>` that takes the reader somewhere. If activating it changes where you are it is a `Link`; if it does something in place it is a `Button`, however text-like it looks.',
  '`type` is semantic, so never hand-colour a link, and the hover underline is automatic. Link text has to describe its destination — “Click here” and “Learn more” read as nothing in a screen reader’s link list.',
].join(' ');

const meta = {
  title: 'Navigation/Link',
  component: Link,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof Link>;

export default meta;

/** The default link at its default size, which is `lg` — a link inside smaller copy needs an explicit size. */
export const Basic: StoryFn<typeof meta> = () => <Link href='#'>Link</Link>;

/** `default`, `alt` and `muted`. `alt` is the inverted family for dark surfaces, which is why it barely reads here; the fourth type, `table`, is the master-cell title link and only belongs there. */
export const Types: StoryFn<typeof meta> = () => (
  <VStack>
    <Link href='#' type='default'>
      Link
    </Link>

    <Link href='#' type='alt'>
      Link
    </Link>

    <Link href='#' type='muted'>
      Link
    </Link>
  </VStack>
);

/** `medium` where the surrounding copy is heavier, or to lift a standalone link — there is no bold, so `medium` is as far as it goes. */
export const Weight: StoryFn<typeof meta> = () => (
  <VStack>
    <Link href='#' weight='regular'>
      Link
    </Link>

    <Link href='#' weight='medium'>
      Link
    </Link>
  </VStack>
);

/** `xs` to `xl`, each matched to a text size. An inline link takes the scale of the copy around it rather than being sized on its own. */
export const Sizes: StoryFn<typeof meta> = () => (
  <VStack>
    <Link href='#' size='xl'>
      Link
    </Link>

    <Link href='#' size='lg'>
      Link
    </Link>

    <Link href='#' size='md'>
      Link
    </Link>

    <Link href='#' size='sm'>
      Link
    </Link>

    <Link href='#' size='xs'>
      Link
    </Link>
  </VStack>
);

/** Icons are children, not a prop. A trailing icon is the direction cue — the external-link mark for a new tab, an arrow for “explore” — and a new tab still needs `target` and `rel` set by hand. */
export const Icons: StoryFn<typeof meta> = () => (
  <VStack>
    <Link href='#'>
      Open new tab <SquareArrowOutUpRight />
    </Link>

    <Link href='#'>
      Let's explore <ArrowRight />
    </Link>
  </VStack>
);
