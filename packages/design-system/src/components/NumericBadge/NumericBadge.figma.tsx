import figma from '@figma/code-connect';
import { NumericBadge } from './NumericBadge';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/wip-components?node-id=56-1561&m=dev';

figma.connect(NumericBadge, figmaNodeUrl, {
  props: {
    type: figma.enum('Type', {
      Solid: 'solid',
      Secondary: 'secondary',
      Outline: 'outline',
    }),
    color: figma.enum('Color', {
      Neutral: 'neutral',
      'Neutral-alt': 'neutral-alt',
      Brand: 'brand',
      Danger: 'danger',
      Info: 'info',
      Success: 'success',
    }),
    size: figma.enum('Size', {
      Medium: 'default',
      Small: 'small',
    }),
    children: figma.string('#'),
  },
  example: ({ type, color, size, children }) => (
    <NumericBadge type={type} color={color} size={size}>
      {children}
    </NumericBadge>
  ),
});
