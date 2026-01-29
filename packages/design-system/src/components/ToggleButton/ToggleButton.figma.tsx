import figma from '@figma/code-connect';

import { ToggleButton } from './ToggleButton';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/wip-components?node-id=295-6384&m=dev';

figma.connect(ToggleButton, figmaNodeUrl, {
  props: {
    children: figma.string('Name'),
    leftElement: figma.boolean('Left element'),
    leftIcon: figma.instance('l-ic'),
    rightElement: figma.boolean('Right element'),
    rightIcon: figma.instance('r-ic'),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Default: 'large',
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
    }),
    variant: figma.enum('Type', {
      Outline: 'outline',
      Ghost: 'ghost',
    }),
    iconOnly: figma.boolean('Icon only'),
    selected: figma.boolean('Selected'),
  },
  example: (props) => (
    <ToggleButton
      variant={props.variant}
      color={props.color}
      size={props.size}
      loading={props.loading}
      disabled={props.disabled}
      active={props.selected}
    >
      {props.children}
    </ToggleButton>
  ),
});

figma.connect(ToggleButton, figmaNodeUrl, {
  props: {
    children: figma.string('Name'),
    leftIcon: figma.instance('l-ic'),
    rightIcon: figma.instance('r-ic'),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Default: 'large',
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
    }),
    variant: figma.enum('Type', {
      Outline: 'outline',
      Ghost: 'ghost',
    }),
    iconOnly: figma.boolean('Icon only'),
    selected: figma.boolean('Selected'),
  },
  variant: {
    'Icon only': true,
    'Left element': true,
  },
  example: (props) => (
    <ToggleButton
      variant={props.variant}
      color={props.color}
      size={props.size}
      loading={props.loading}
      disabled={props.disabled}
    >
      {props.leftIcon}
    </ToggleButton>
  ),
});

figma.connect(ToggleButton, figmaNodeUrl, {
  props: {
    children: figma.string('Name'),
    leftElement: figma.boolean('Left element'),
    leftIcon: figma.instance('l-ic'),
    rightElement: figma.boolean('Right element'),
    rightIcon: figma.instance('r-ic'),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Default: 'large',
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
    }),
    variant: figma.enum('Type', {
      Outline: 'outline',
      Ghost: 'ghost',
    }),
    iconOnly: figma.boolean('Icon only'),
    selected: figma.boolean('Selected'),
  },
  variant: {
    'Left element': true,
  },
  example: (props) => (
    <ToggleButton
      variant={props.variant}
      color={props.color}
      size={props.size}
      loading={props.loading}
      disabled={props.disabled}
      active={props.selected}
    >
      {props.leftIcon}
      {props.children}
    </ToggleButton>
  ),
});

figma.connect(ToggleButton, figmaNodeUrl, {
  props: {
    children: figma.string('Name'),
    leftElement: figma.boolean('Left element'),
    leftIcon: figma.instance('l-ic'),
    rightElement: figma.boolean('Right element'),
    rightIcon: figma.instance('r-ic'),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Default: 'large',
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
    }),
    variant: figma.enum('Type', {
      Outline: 'outline',
      Ghost: 'ghost',
    }),
    iconOnly: figma.boolean('Icon only'),
    selected: figma.boolean('Selected'),
  },
  variant: {
    'Right element': true,
  },
  example: (props) => (
    <ToggleButton
      variant={props.variant}
      color={props.color}
      size={props.size}
      loading={props.loading}
      disabled={props.disabled}
      active={props.selected}
    >
      {props.children}
      {props.rightIcon}
    </ToggleButton>
  ),
});

figma.connect(ToggleButton, figmaNodeUrl, {
  props: {
    children: figma.string('Name'),
    leftElement: figma.boolean('Left element'),
    leftIcon: figma.instance('l-ic'),
    rightElement: figma.boolean('Right element'),
    rightIcon: figma.instance('r-ic'),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Default: 'large',
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
    }),
    variant: figma.enum('Type', {
      Outline: 'outline',
      Ghost: 'ghost',
    }),
    iconOnly: figma.boolean('Icon only'),
    selected: figma.boolean('Selected'),
  },
  variant: {
    'Left element': true,
    'Right element': true,
  },
  example: (props) => (
    <ToggleButton
      variant={props.variant}
      color={props.color}
      size={props.size}
      loading={props.loading}
      disabled={props.disabled}
      active={props.selected}
    >
      {props.leftIcon}
      {props.children}
      {props.rightIcon}
    </ToggleButton>
  ),
});

figma.connect(ToggleButton, figmaNodeUrl, {
  props: {
    children: figma.string('Name'),
    leftElement: figma.boolean('Left element'),
    leftIcon: figma.instance('l-ic'),
    rightElement: figma.boolean('Right element'),
    rightIcon: figma.instance('r-ic'),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Default: 'large',
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
    }),
    variant: figma.enum('Type', {
      Outline: 'outline',
      Ghost: 'ghost',
    }),
    iconOnly: figma.boolean('Icon only'),
    selected: figma.boolean('Selected'),
    badge: figma.boolean('Badge'),
    numericBadge: figma.children('numeric-badge'),
  },
  variant: {
    Badge: true,
  },
  example: (props) => (
    <ToggleButton
      variant={props.variant}
      color={props.color}
      size={props.size}
      loading={props.loading}
      disabled={props.disabled}
      active={props.selected}
    >
      {props.children}
      {props.numericBadge}
    </ToggleButton>
  ),
});
