import figma from '@figma/code-connect';
import { Button } from './Button';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/wip-components?node-id=36%3A2305';

figma.connect(Button, figmaNodeUrl, {
  props: {
    children: figma.string('Name'),
    leftElement: figma.boolean('Left element'),
    leftIcon: figma.instance('l-ic'),
    rightElement: figma.boolean('Right element'),
    rightIcon: figma.instance('r-ic'),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Large: 'large',
    }),
    loading: figma.enum('State', {
      Loading: true,
    }),
    disabled: figma.enum('State', {
      Disabled: true,
    }),
    color: figma.enum('Color', {
      Brand: 'brand',
      Neutral: 'neutral',
      Destructive: 'destructive',
    }),
    variant: figma.enum('Type', {
      Primary: 'primary',
      Outline: 'outline',
      Ghost: 'ghost',
      Secondary: 'secondary',
    }),
    iconOnly: figma.boolean('Icon only'),
  },
  example: props => (
    <Button
      variant={props.variant}
      color={props.color}
      size={props.size}
      loading={props.loading}
      disabled={props.disabled}
    >
      {props.children}
    </Button>
  ),
});

figma.connect(Button, figmaNodeUrl, {
  props: {
    children: figma.string('Name'),
    leftElement: figma.boolean('Left element'),
    leftIcon: figma.instance('l-ic'),
    rightElement: figma.boolean('Right element'),
    rightIcon: figma.instance('r-ic'),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Large: 'large',
    }),
    loading: figma.enum('State', {
      Loading: true,
    }),
    disabled: figma.enum('State', {
      Disabled: true,
    }),
    color: figma.enum('Color', {
      Brand: 'brand',
      Neutral: 'neutral',
      Destructive: 'destructive',
    }),
    variant: figma.enum('Type', {
      Primary: 'primary',
      Outline: 'outline',
      Ghost: 'ghost',
      Secondary: 'secondary',
    }),
    iconOnly: figma.boolean('Icon only'),
  },
  variant: {
    'Icon only': true,
    'Left element': true,
  },
  example: props => (
    <Button
      variant={props.variant}
      color={props.color}
      size={props.size}
      loading={props.loading}
      disabled={props.disabled}
    >
      {props.leftIcon}
    </Button>
  ),
});

figma.connect(Button, figmaNodeUrl, {
  props: {
    children: figma.string('Name'),
    leftElement: figma.boolean('Left element'),
    leftIcon: figma.instance('l-ic'),
    rightElement: figma.boolean('Right element'),
    rightIcon: figma.instance('r-ic'),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Large: 'large',
    }),
    loading: figma.enum('State', {
      Loading: true,
    }),
    disabled: figma.enum('State', {
      Disabled: true,
    }),
    color: figma.enum('Color', {
      Brand: 'brand',
      Neutral: 'neutral',
      Destructive: 'destructive',
    }),
    variant: figma.enum('Type', {
      Primary: 'primary',
      Outline: 'outline',
      Ghost: 'ghost',
      Secondary: 'secondary',
    }),
    iconOnly: figma.boolean('Icon only'),
  },
  variant: {
    'Left element': true,
  },
  example: props => (
    <Button
      variant={props.variant}
      color={props.color}
      size={props.size}
      loading={props.loading}
      disabled={props.disabled}
    >
      {props.leftIcon}
      {props.children}
    </Button>
  ),
});

figma.connect(Button, figmaNodeUrl, {
  props: {
    children: figma.string('Name'),
    leftElement: figma.boolean('Left element'),
    leftIcon: figma.instance('l-ic'),
    rightElement: figma.boolean('Right element'),
    rightIcon: figma.instance('r-ic'),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Large: 'large',
    }),
    loading: figma.enum('State', {
      Loading: true,
    }),
    disabled: figma.enum('State', {
      Disabled: true,
    }),
    color: figma.enum('Color', {
      Brand: 'brand',
      Neutral: 'neutral',
      Destructive: 'destructive',
    }),
    variant: figma.enum('Type', {
      Primary: 'primary',
      Outline: 'outline',
      Ghost: 'ghost',
      Secondary: 'secondary',
    }),
    iconOnly: figma.boolean('Icon only'),
  },
  variant: {
    'Right element': true,
  },
  example: props => (
    <Button
      variant={props.variant}
      color={props.color}
      size={props.size}
      loading={props.loading}
      disabled={props.disabled}
    >
      {props.children}
      {props.rightIcon}
    </Button>
  ),
});

figma.connect(Button, figmaNodeUrl, {
  props: {
    children: figma.string('Name'),
    leftElement: figma.boolean('Left element'),
    leftIcon: figma.instance('l-ic'),
    rightElement: figma.boolean('Right element'),
    rightIcon: figma.instance('r-ic'),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Large: 'large',
    }),
    loading: figma.enum('State', {
      Loading: true,
    }),
    disabled: figma.enum('State', {
      Disabled: true,
    }),
    color: figma.enum('Color', {
      Brand: 'brand',
      Neutral: 'neutral',
      Destructive: 'destructive',
    }),
    variant: figma.enum('Type', {
      Primary: 'primary',
      Outline: 'outline',
      Ghost: 'ghost',
      Secondary: 'secondary',
    }),
    iconOnly: figma.boolean('Icon only'),
  },
  variant: {
    'Left element': true,
    'Right element': true,
  },
  example: props => (
    <Button
      variant={props.variant}
      color={props.color}
      size={props.size}
      loading={props.loading}
      disabled={props.disabled}
    >
      {props.leftIcon}
      {props.children}
      {props.rightIcon}
    </Button>
  ),
});

figma.connect(Button, figmaNodeUrl, {
  props: {
    children: figma.string('Name'),
    leftElement: figma.boolean('Left element'),
    leftIcon: figma.instance('l-ic'),
    rightElement: figma.boolean('Right element'),
    rightIcon: figma.instance('r-ic'),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Large: 'large',
    }),
    loading: figma.enum('State', {
      Loading: true,
    }),
    disabled: figma.enum('State', {
      Disabled: true,
    }),
    color: figma.enum('Color', {
      Brand: 'brand',
      Neutral: 'neutral',
      Destructive: 'destructive',
    }),
    variant: figma.enum('Type', {
      Primary: 'primary',
      Outline: 'outline',
      Ghost: 'ghost',
      Secondary: 'secondary',
    }),
    iconOnly: figma.boolean('Icon only'),
    badge: figma.boolean('Badge'),
    numericBadge: figma.children('numeric-badge'),
  },
  variant: {
    Badge: true,
  },
  example: props => (
    <Button
      variant={props.variant}
      color={props.color}
      size={props.size}
      loading={props.loading}
      disabled={props.disabled}
    >
      {props.children}
      {props.numericBadge}
    </Button>
  ),
});
