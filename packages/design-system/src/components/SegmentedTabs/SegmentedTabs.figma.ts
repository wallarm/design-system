// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=1956-8100
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/SegmentedTabs/SegmentedTabs.tsx
// component=SegmentedTabs

import figma, { type InstanceHandle, type TextHandle } from 'figma';

const instance = figma.selectedInstance;

// Pills are private `_segmented-pill-tab` instances in the "Slot" (Actionable pills=On) or
// "Slot 2" (Off) slot, so their props are read here. The "More" pill sits outside the slots.
// Matched by structure (has a "Selected" prop), not layer name, so renamed pills still count.
const isPill = (node: InstanceHandle | TextHandle) =>
  node.type === 'INSTANCE' && 'Selected' in node.properties;
const pills = ['Slot', 'Slot 2']
  .flatMap(slot => instance.findLayers(isPill, { path: [slot] }))
  .filter((pill): pill is InstanceHandle => pill.type === 'INSTANCE');

const icon = (pill: InstanceHandle, toggle: string, swap: string) =>
  pill.getBoolean(toggle) ? pill.getInstanceSwap(swap)?.executeTemplate().example : undefined;
const menu = (trigger: unknown) => figma.code`<DropdownMenu>
        <DropdownMenuTrigger asChild>
          ${trigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Action</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>`;
const line = (content: unknown) =>
  content
    ? figma.code`
      ${content}`
    : '';

let selected: string | undefined;
let usesTriggerButton = false;

const triggers = pills.map((pill, index) => {
  const value = String(index + 1);
  if (pill.getEnum('Selected', { On: true })) selected = value;

  const text = pill.findText('Tab');
  const label = pill.getBoolean('Label') && text.type === 'TEXT' ? text.textContent : '';
  const badgeLayer = pill.getBoolean('Badge') ? pill.findInstance('numeric-badge') : undefined;
  const badge = badgeLayer?.type === 'INSTANCE' ? badgeLayer.executeTemplate().example : undefined;
  const actionable = pill.getEnum('Actionable', { On: true }) ?? false;
  usesTriggerButton ||= actionable;

  const disabled = pill.getEnum('State', { Disabled: true });
  const indicator = pill.getBoolean('Unsaved changes');

  return figma.code`
    <SegmentedTabsTrigger value='${value}'${disabled ? ' disabled' : ''}${indicator ? ' indicator' : ''}>${line(
      icon(pill, 'Left element', 'l-ic'),
    )}${line(label)}${line(badge)}${line(icon(pill, 'Right element', 'r-ic'))}${line(
      actionable ? menu(figma.code`<SegmentedTabsTriggerButton />`) : undefined,
    )}
    </SegmentedTabsTrigger>`;
});

const morePills = instance.getBoolean('More pills');
const moreText = instance.findText('Tab', { path: ['more'], traverseInstances: true });
const moreLabel = moreText.type === 'TEXT' && moreText.textContent ? moreText.textContent : 'More';
const more = morePills
  ? figma.code`
    <SegmentedTabsSeparator />
    ${menu(figma.code`<SegmentedTabsButton>
            <Ellipsis />
            ${moreLabel}
          </SegmentedTabsButton>`)}`
  : '';

const contents = pills.map(
  (_, index) => figma.code`
  <SegmentedTabsContent value='${String(index + 1)}'>...</SegmentedTabsContent>`,
);

const parts = [
  'SegmentedTabs',
  'SegmentedTabsContent',
  'SegmentedTabsList',
  'SegmentedTabsTrigger',
  ...(usesTriggerButton ? ['SegmentedTabsTriggerButton'] : []),
  ...(morePills ? ['SegmentedTabsButton', 'SegmentedTabsSeparator'] : []),
];

export default {
  id: 'segmented-tabs',
  example: figma.code`<SegmentedTabs${selected ? ` defaultValue='${selected}'` : ''}>
  <SegmentedTabsList>${triggers}${more}
  </SegmentedTabsList>${contents}
</SegmentedTabs>`,
  imports: [
    `import { ${parts.sort().join(', ')} } from '@wallarm-org/design-system/SegmentedTabs';`,
    ...(usesTriggerButton || morePills
      ? [
          "import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@wallarm-org/design-system/DropdownMenu';",
        ]
      : []),
    ...(morePills ? ["import { Ellipsis } from '@wallarm-org/design-system/icons';"] : []),
  ],
  metadata: { nestable: true },
};
