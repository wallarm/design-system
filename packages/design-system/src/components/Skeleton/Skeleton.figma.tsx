import figma from '@figma/code-connect';
import { Skeleton } from './Skeleton';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=5451-23064';

figma.connect(Skeleton, figmaNodeUrl, {
  props: {
    animated: figma.boolean('Animated'),
    transparent: figma.boolean('Transparent'),
  },
  example: ({ animated, transparent }) => (
    <Skeleton animated={animated} transparent={transparent} />
  ),
});
