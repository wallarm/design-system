import figma from '@figma/code-connect';

import { Textarea } from './Textarea';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/wip-components?node-id=106-126403';

figma.connect(Textarea, figmaNodeUrl, {
  props: {
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Default: 'default',
    }),
    error: figma.boolean('Error'),
    placeholder: figma.string('Placeholder'),
  },
  example: ({ size, placeholder }) => (
    <Textarea size={size} placeholder={placeholder} />
  ),
});

figma.connect(Textarea, figmaNodeUrl, {
  props: {
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Default: 'default',
    }),
    error: figma.boolean('Error'),
    placeholder: figma.string('Placeholder'),
  },
  variant: { Error: true },
  example: ({ size, placeholder }) => (
    <Textarea size={size} placeholder={placeholder} error={true} />
  ),
});

figma.connect(Textarea, figmaNodeUrl, {
  props: {
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Default: 'default',
    }),
    state: figma.enum('State', {
      Disabled: 'disabled',
    }),
    error: figma.boolean('Error'),
    placeholder: figma.string('Placeholder'),
  },
  variant: { State: 'Disabled' },
  example: ({ size, placeholder, error }) => (
    <Textarea size={size} placeholder={placeholder} error={error} disabled />
  ),
});
