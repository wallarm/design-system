import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import { ArrowRight, SquareArrowOutUpRight } from '../../icons';
import { VStack } from '../Stack';

import { Link } from './Link';

const meta = {
  title: 'Navigation/Link',
  component: Link,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Link>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => <Link href="#">Link</Link>;

export const Types: StoryFn<typeof meta> = () => (
  <VStack>
    <Link href="#" type="default">
      Link
    </Link>

    <Link href="#" type="alt">
      Link
    </Link>

    <Link href="#" type="muted">
      Link
    </Link>
  </VStack>
);

export const Weight: StoryFn<typeof meta> = () => (
  <VStack>
    <Link href="#" weight="regular">
      Link
    </Link>

    <Link href="#" weight="medium">
      Link
    </Link>
  </VStack>
);

export const Sizes: StoryFn<typeof meta> = () => (
  <VStack>
    <Link href="#" size="xl">
      Link
    </Link>

    <Link href="#" size="lg">
      Link
    </Link>

    <Link href="#" size="md">
      Link
    </Link>

    <Link href="#" size="sm">
      Link
    </Link>

    <Link href="#" size="xs">
      Link
    </Link>
  </VStack>
);

export const Icons: StoryFn<typeof meta> = () => (
  <VStack>
    <Link href="#">
      Open new tab <SquareArrowOutUpRight />
    </Link>

    <Link href="#">
      Let's explore <ArrowRight />
    </Link>
  </VStack>
);
