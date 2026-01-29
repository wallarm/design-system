import figma from '@figma/code-connect';

import { NumericBadge } from './NumericBadge';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/wip-components?node-id=56-1561&m=dev';

figma.connect(NumericBadge, figmaNodeUrl, {
  props: {
    type: figma.enum('Type', {
      Primary: 'primary',
      'Primary-alt': 'primary-alt',
      Brand: 'brand',
      Destructive: 'destructive',
      Outline: 'outline',
      'New / Info': 'info',
    }),
    children: figma.string('#'),
  },
  example: ({ type, children }) => (
    <NumericBadge type={type}>{children}</NumericBadge>
  ),
});
