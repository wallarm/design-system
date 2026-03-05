import figma from '@figma/code-connect';
import { Skeleton } from './Skeleton';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=5451-23064';

figma.connect(Skeleton, figmaNodeUrl, {
  props: {
    transparent: figma.boolean('Transparent'),
  },
  example: ({ transparent }) => <Skeleton width='100%' height='20px' transparent={transparent} />,
});
