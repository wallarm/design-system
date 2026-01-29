import figma from '@figma/code-connect';

import { Kbd } from './Kbd';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/wip-components?node-id=94-4053';

figma.connect(Kbd, figmaNodeUrl, {
  props: {
    letter: figma.boolean('Letter'),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
    }),
    tooltip: figma.boolean('Tooltip'),
  },
  variant: {
    Letter: true,
  },
  example: ({ size }) => <Kbd size={size}>K</Kbd>,
});
