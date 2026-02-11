import figma from '@figma/code-connect';
import { Loader } from './Loader';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/wip-components?node-id=856-394';

figma.connect(Loader, figmaNodeUrl, {
  props: {
    type: figma.enum('Type', {
      Circle: 'circle',
      Sonner: 'sonner',
    }),
    size: figma.enum('Size', {
      sm: 'sm',
      md: 'md',
      lg: 'lg',
      xl: 'xl',
      '2xl': '2xl',
      '3xl': '3xl',
    }),
    color: figma.enum('Style', {
      Primary: 'primary',
      'Primary-alt': 'primary-alt',
      Brand: 'brand',
      Destructive: 'danger',
    }),
  },
  example: ({ type, color, size }) => <Loader type={type} size={size} color={color} />,
});

figma.connect(Loader, figmaNodeUrl, {
  props: {
    type: figma.enum('Type', {
      Circle: 'circle',
      Sonner: 'sonner',
    }),
    size: figma.enum('Size', {
      sm: 'sm',
      md: 'md',
      lg: 'lg',
      xl: 'xl',
      '2xl': '2xl',
      '3xl': '3xl',
    }),
    color: figma.enum('Style', {
      Primary: 'primary',
      'Primary-alt': 'primary-alt',
      Brand: 'brand',
      Destructive: 'danger',
    }),
    background: figma.boolean('Background'),
  },
  variant: {
    Type: 'Circle',
    Background: false,
  },
  example: ({ type, color, size }) => (
    <Loader type={type} size={size} color={color} background={false} />
  ),
});
