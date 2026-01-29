import figma from '@figma/code-connect';

import { Checkbox } from './Checkbox';
import { CheckboxDescription } from './CheckboxDescription';
import { CheckboxIndicator } from './CheckboxIndicator';
import { CheckboxLabel } from './CheckboxLabel';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/wip-components?node-id=286-1921';

figma.connect(Checkbox, figmaNodeUrl, {
  props: {
    checked: figma.boolean('Selected'),
    indeterminate: figma.boolean('Indeterminate'),
    disabled: figma.boolean('Disabled'),
    label: figma.textContent('Label'),
    description: figma.boolean('Description'),
    descriptionText: figma.string('Descript'),
  },
  example: ({ checked, label }) => (
    <Checkbox checked={checked}>
      <CheckboxIndicator />
      <CheckboxLabel>{label}</CheckboxLabel>
    </Checkbox>
  ),
});

figma.connect(Checkbox, figmaNodeUrl, {
  props: {
    checked: figma.boolean('Selected'),
    indeterminate: figma.boolean('Indeterminate'),
    disabled: figma.boolean('Disabled'),
    label: figma.textContent('Label'),
    description: figma.boolean('Description'),
    descriptionText: figma.string('Descript'),
  },
  variant: {
    Indeterminate: true,
  },
  example: ({ label, disabled }) => (
    <Checkbox checked="indeterminate" disabled={disabled}>
      <CheckboxIndicator />
      <CheckboxLabel>{label}</CheckboxLabel>
    </Checkbox>
  ),
});

figma.connect(Checkbox, figmaNodeUrl, {
  props: {
    checked: figma.boolean('Selected'),
    indeterminate: figma.boolean('Indeterminate'),
    disabled: figma.boolean('Disabled'),
    label: figma.textContent('Label'),
    description: figma.boolean('Description'),
    descriptionText: figma.string('Descript'),
  },
  variant: {
    Disabled: true,
  },
  example: ({ label, checked, disabled }) => (
    <Checkbox checked={checked} disabled={disabled}>
      <CheckboxIndicator />
      <CheckboxLabel>{label}</CheckboxLabel>
    </Checkbox>
  ),
});

figma.connect(Checkbox, figmaNodeUrl, {
  props: {
    checked: figma.boolean('Selected'),
    indeterminate: figma.boolean('Indeterminate'),
    disabled: figma.boolean('Disabled'),
    label: figma.textContent('Label'),
    description: figma.boolean('Description'),
    descriptionText: figma.string('Descript'),
  },
  variant: {
    Description: true,
  },
  example: ({ checked, label, disabled, descriptionText }) => (
    <Checkbox checked={checked} disabled={disabled}>
      <CheckboxIndicator />
      <CheckboxLabel>{label}</CheckboxLabel>
      <CheckboxDescription>{descriptionText}</CheckboxDescription>
    </Checkbox>
  ),
});
