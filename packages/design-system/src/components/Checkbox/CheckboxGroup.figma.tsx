import figma from '@figma/code-connect';

import { CheckboxGroup } from './CheckboxGroup';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/wip-components?node-id=290-4065';

figma.connect(CheckboxGroup, figmaNodeUrl, {
  props: {
    children: figma.children('checkbox-item'),
  },
  example: ({ children }) => <CheckboxGroup>{children}</CheckboxGroup>,
});
