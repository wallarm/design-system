import figma from '@figma/code-connect';

import { Input } from './Input';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/wip-components?node-id=94-1411';

figma.connect(Input, figmaNodeUrl, {
  props: {
    error: figma.boolean('Error'),
    placeholder: figma.string('Placeholder'),
  },
  example: ({ placeholder }) => <Input placeholder={placeholder} />,
});

figma.connect(Input, figmaNodeUrl, {
  props: {
    error: figma.boolean('Error'),
    placeholder: figma.string('Placeholder'),
  },
  variant: { Error: true },
  example: ({ placeholder }) => (
    <Input placeholder={placeholder} error={true} />
  ),
});

figma.connect(Input, figmaNodeUrl, {
  props: {
    error: figma.boolean('Error'),
    placeholder: figma.string('Placeholder'),
    state: figma.enum('State', {
      Disabled: 'disabled',
    }),
  },
  variant: { State: 'Disabled' },
  example: ({ placeholder, error }) => (
    <Input placeholder={placeholder} error={error} disabled />
  ),
});
