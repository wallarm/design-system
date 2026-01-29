import figma from '@figma/code-connect';

import { Separator } from './Separator';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/wip-components?node-id=314-10573';

figma.connect(Separator, figmaNodeUrl, {
  props: {
    orientation: figma.enum('Orientation', {
      Vertical: 'vertical',
      Horizontal: 'horizontal',
    }),
  },
  example: ({ orientation }) => <Separator orientation={orientation} />,
});
