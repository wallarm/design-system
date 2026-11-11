// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=290-4065
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Checkbox/CheckboxGroup.tsx
// component=CheckboxGroup

import figma, { type ErrorSection } from 'figma';

const instance = figma.selectedInstance;

const card = instance.getEnum('Card', { On: 'card' });

// Options are the connected checkbox-item / checkbox-card instances in the visible slot.
// Their templates expose the item body via metadata props; the group owns checked state, so each
// option gets a unique value here (repeated or non-latin labels would otherwise collide).
interface ItemProps {
  body: unknown;
  slug: string;
  disabled: boolean;
  checked: boolean;
  indeterminate: boolean;
  info: boolean;
}
const usedValues = new Set<string>();
const items = (instance.getSlot(card ? 'options2' : 'options')?.connectedInstances ?? []).map(
  option => {
    const props = option.executeTemplate().metadata?.props as ItemProps | undefined;
    if (!props) {
      const error: ErrorSection = {
        type: 'ERROR',
        message: 'CheckboxGroup option is not a Checkbox / Checkbox card instance',
      };
      return { snippet: [error], value: '', checked: false, info: false };
    }
    const base = props.slug || 'option';
    let value = base;
    for (let n = 2; usedValues.has(value); n++) value = `${base}-${n}`;
    usedValues.add(value);
    // Indeterminate is a parent "select all" row: its own checked prop overrides the group state.
    const snippet = figma.code`<Checkbox value='${value}'${props.indeterminate ? figma.code` checked='indeterminate'` : ''}${figma.helpers.react.renderProp('disabled', props.disabled)}>
      ${props.body}
    </Checkbox>`;
    return { snippet, value, checked: props.checked, info: props.info };
  },
);
const checkedValues = items.filter(item => item.checked).map(item => `'${item.value}'`);

// Label / description / error come from the nested input-label and input-description layers.
const labelLayer = instance.findInstance('input-label');
const label = labelLayer.type === 'INSTANCE' ? labelLayer : undefined;
const labelText = label?.getString('Input label') ?? 'Label';
// FieldLabel.figma.ts is not reused: its example is a whole <Field> with an <Input />.
// With a CheckboxGroup child, Field renders an Ark Fieldset (no FieldContext), so FieldIndicator
// would crash and Field's `required` does nothing: the indicator is spelled out as Text instead.
const mandatory = label?.getBoolean('Mandatory') ?? false;
const optional = !mandatory && (label?.getBoolean('Optional') ?? false);
const labelInfo = label?.getBoolean('Info') ?? false;
const descriptionLayer = label?.getEnum('Description', { On: true })
  ? label.findInstance('input-description')
  : undefined;
const description =
  descriptionLayer?.type === 'INSTANCE' ? descriptionLayer.getString('Description') : undefined;
const errorLayer = instance.getBoolean('Error')
  ? instance.findInstance('input-description')
  : undefined;
const error = errorLayer?.type === 'INSTANCE' ? errorLayer.getString('Error text') : undefined;

const tooltip = figma.code`
    <Tooltip>
      <TooltipTrigger>
        <Info />
      </TooltipTrigger>
      <TooltipContent>Additional information</TooltipContent>
    </Tooltip>
  `;
const needsTooltip = labelInfo || items.some(item => item.info);

export default {
  id: 'checkbox-group',
  example: figma.code`<Field${figma.helpers.react.renderProp('invalid', error !== undefined)}>
  <FieldLabel>
    ${labelText}${mandatory ? figma.code` <Text size='sm' color='danger'>*</Text>` : ''}${optional ? figma.code` <Text size='sm' color='secondary'>(Optional)</Text>` : ''}${labelInfo ? tooltip : ''}
  </FieldLabel>${
    description
      ? figma.code`
  <FieldDescription>${description}</FieldDescription>`
      : ''
  }
  <CheckboxGroup${figma.helpers.react.renderProp('variant', card)}${checkedValues.length ? figma.code` defaultValue={[${checkedValues.join(', ')}]}` : ''}>
    ${items.map(item => item.snippet)}
  </CheckboxGroup>${
    error
      ? figma.code`
  <FieldError>${error}</FieldError>`
      : ''
  }
</Field>`,
  imports: [
    "import { Checkbox, CheckboxDescription, CheckboxGroup, CheckboxIndicator, CheckboxLabel } from '@wallarm-org/design-system/Checkbox';",
    "import { Field, FieldDescription, FieldError, FieldLabel } from '@wallarm-org/design-system/Field';",
    ...(mandatory || optional ? ["import { Text } from '@wallarm-org/design-system/Text';"] : []),
    ...(needsTooltip
      ? [
          "import { Tooltip, TooltipContent, TooltipTrigger } from '@wallarm-org/design-system/Tooltip';",
          "import { Info } from '@wallarm-org/design-system/icons';",
        ]
      : []),
  ],
  metadata: { nestable: true },
};
