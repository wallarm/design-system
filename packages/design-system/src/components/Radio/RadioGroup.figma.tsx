import figma from '@figma/code-connect';
import { RadioGroup } from './RadioGroup';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/wip-components?node-id=290-5899';

figma.connect(RadioGroup, figmaNodeUrl, {
  props: {
    children: figma.children('radio-item'),
  },
  example: ({ children }) => <RadioGroup value='any'>{children}</RadioGroup>,
});
