import figma from '@figma/code-connect';

import { SquareArrowOutUpRight } from '../../icons';

import { Link } from './Link';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/wip-components?node-id=949-2830';

figma.connect(Link, figmaNodeUrl, {
  props: {
    type: figma.enum('Type', {
      Default: 'default',
      Alt: 'alt',
      Muted: 'muted',
    }),
    size: figma.enum('Size', {
      xs: 'xs',
      sm: 'sm',
      md: 'md',
      lg: 'lg',
      xl: 'xl',
    }),
    medium: figma.boolean('Medium'),
    label: figma.string('Label'),
    newTab: figma.boolean('New tab'),
    rightIcon: figma.boolean('Right icon'),
    rightIconComponent: figma.instance('r-ic'),
  },
  example: ({ type, size, label }) => (
    <Link type={type} size={size}>
      {label}
    </Link>
  ),
});

figma.connect(Link, figmaNodeUrl, {
  props: {
    type: figma.enum('Type', {
      Default: 'default',
      Alt: 'alt',
      Muted: 'muted',
    }),
    size: figma.enum('Size', {
      xs: 'xs',
      sm: 'sm',
      md: 'md',
      lg: 'lg',
      xl: 'xl',
    }),
    medium: figma.boolean('Medium'),
    label: figma.string('Label'),
    newTab: figma.boolean('New tab'),
    rightIcon: figma.boolean('Right icon'),
    rightIconComponent: figma.instance('r-ic'),
  },
  variant: {
    Medium: true,
  },
  example: ({ type, size, label }) => (
    <Link type={type} size={size} weight="medium">
      {label}
    </Link>
  ),
});

figma.connect(Link, figmaNodeUrl, {
  props: {
    type: figma.enum('Type', {
      Default: 'default',
      Alt: 'alt',
      Muted: 'muted',
    }),
    size: figma.enum('Size', {
      xs: 'xs',
      sm: 'sm',
      md: 'md',
      lg: 'lg',
      xl: 'xl',
    }),
    medium: figma.boolean('Medium'),
    label: figma.string('Label'),
    newTab: figma.boolean('New tab'),
    rightIcon: figma.boolean('Right icon'),
    rightIconComponent: figma.instance('r-ic'),
  },
  variant: {
    'New tab': true,
  },
  example: ({ type, size, label }) => (
    <Link type={type} size={size}>
      {label}
      <SquareArrowOutUpRight />
    </Link>
  ),
});

figma.connect(Link, figmaNodeUrl, {
  props: {
    type: figma.enum('Type', {
      Default: 'default',
      Alt: 'alt',
      Muted: 'muted',
    }),
    size: figma.enum('Size', {
      xs: 'xs',
      sm: 'sm',
      md: 'md',
      lg: 'lg',
      xl: 'xl',
    }),
    medium: figma.boolean('Medium'),
    label: figma.string('Label'),
    newTab: figma.boolean('New tab'),
    rightIcon: figma.boolean('Right icon'),
    rightIconComponent: figma.instance('r-ic'),
  },
  variant: {
    'Right icon': true,
  },
  example: ({ type, size, label, rightIconComponent }) => (
    <Link type={type} size={size}>
      {label}
      {rightIconComponent}
    </Link>
  ),
});
