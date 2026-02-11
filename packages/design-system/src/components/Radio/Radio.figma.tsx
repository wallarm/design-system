import figma from '@figma/code-connect';
import { Radio } from './Radio';
import { RadioDescription } from './RadioDescription';
import { RadioIndicator } from './RadioIndicator';
import { RadioLabel } from './RadioLabel';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/wip-components?node-id=290-5732';

figma.connect(Radio, figmaNodeUrl, {
  props: {
    disabled: figma.boolean('Disable'),
    label: figma.textContent('Label'),
    description: figma.boolean('Description'),
    descriptionText: figma.string('Descript'),
  },
  example: ({ label }) => (
    <Radio value={label}>
      <RadioIndicator />
      <RadioLabel>{label}</RadioLabel>
    </Radio>
  ),
});

figma.connect(Radio, figmaNodeUrl, {
  props: {
    disabled: figma.boolean('Disable'),
    label: figma.textContent('Label'),
    description: figma.boolean('Description'),
    descriptionText: figma.string('Descript'),
  },
  variant: {
    Disable: true,
  },
  example: ({ label, disabled }) => (
    <Radio value={label} disabled={disabled}>
      <RadioIndicator />
      <RadioLabel>{label}</RadioLabel>
    </Radio>
  ),
});

figma.connect(Radio, figmaNodeUrl, {
  props: {
    disabled: figma.boolean('Disable'),
    label: figma.textContent('Label'),
    description: figma.boolean('Description'),
    descriptionText: figma.string('Descript'),
  },
  variant: {
    Description: true,
  },
  example: ({ label, disabled, descriptionText }) => (
    <Radio value={label} disabled={disabled}>
      <RadioIndicator />
      <RadioLabel>{label}</RadioLabel>
      <RadioDescription>{descriptionText}</RadioDescription>
    </Radio>
  ),
});
