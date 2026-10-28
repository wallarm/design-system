// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=647-3325
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/SegmentedControl/SegmentedControl.tsx
// component=SegmentedControl

import figma, { type InstanceHandle } from 'figma';

const instance = figma.selectedInstance;

const fullWidth = instance.getEnum('Full-width', { On: true });
const morePills = !fullWidth && instance.getBoolean('More pills');

// Pills are private `_segmented-pill` instances (not connectable), so read their props here.
// Full-width=Off keeps them in 'Slot', Full-width=On in 'Slot 2'; the overflow pill sits in 'more'.
const isPill = (node: { type: string; name: string }) =>
  node.type === 'INSTANCE' && node.name === '_segmented-pill';
const pillsIn = (path: string) =>
  instance
    .findLayers(isPill, { path: [path] })
    .filter((node): node is InstanceHandle => node.type === 'INSTANCE');

const pillContent = (pill: InstanceHandle) => {
  const text = pill.findText('Tab');
  const label = pill.getBoolean('Label') && text.type === 'TEXT' ? text.textContent : '';
  const leftIcon = pill.getBoolean('Left element')
    ? pill.getInstanceSwap('l-ic')?.executeTemplate().example
    : undefined;
  const rightIcon = pill.getBoolean('Right element')
    ? pill.getInstanceSwap('r-ic')?.executeTemplate().example
    : undefined;
  const badgeLayer = pill.getBoolean('Badge') ? pill.findInstance('numeric-badge') : undefined;
  const badge = badgeLayer?.type === 'INSTANCE' ? badgeLayer.executeTemplate().example : undefined;
  return figma.code`${
    leftIcon
      ? figma.code`
    ${leftIcon}`
      : ''
  }${
    label
      ? figma.code`
    ${label}`
      : ''
  }${
    rightIcon
      ? figma.code`
    ${rightIcon}`
      : ''
  }${
    badge
      ? figma.code`
    ${badge}`
      : ''
  }`;
};

const pills = pillsIn(fullWidth ? 'Slot 2' : 'Slot');
const selectedIndex = pills.findIndex(pill => pill.getEnum('Selected', { On: true }));

const items = pills.map(
  (pill, index) => figma.code`
  <SegmentedControlItem value='${String(index + 1)}'${figma.helpers.react.renderProp('disabled', pill.getEnum('State', { Disabled: true }))}>${pillContent(pill)}
  </SegmentedControlItem>`,
);

const morePill = morePills ? pillsIn('more')[0] : undefined;
const more = morePills
  ? figma.code`
  <SegmentedControlSeparator />
  <SegmentedControlButton onClick={() => {}}>${morePill ? pillContent(morePill) : ''}
  </SegmentedControlButton>`
  : '';

export default {
  id: 'segmented-control',
  example: figma.code`<SegmentedControl${selectedIndex >= 0 ? figma.code` defaultValue='${String(selectedIndex + 1)}'` : ''}${figma.helpers.react.renderProp('fullWidth', fullWidth)}>${items}${more}
</SegmentedControl>`,
  imports: [
    `import { SegmentedControl, SegmentedControlItem${morePills ? ', SegmentedControlButton, SegmentedControlSeparator' : ''} } from '@wallarm-org/design-system/SegmentedControl';`,
  ],
  metadata: { nestable: true },
};
