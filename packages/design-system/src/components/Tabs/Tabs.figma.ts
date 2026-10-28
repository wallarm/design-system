// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=626-9076
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Tabs/Tabs.tsx
// component=Tabs

import figma, { type InstanceHandle } from 'figma';

const instance = figma.selectedInstance;

const size = instance.getEnum('Size', { Medium: undefined, Small: 'small' });
const moreTabs = instance.getBoolean('More tabs');
const actions = instance.getBoolean('Actions');

// Tabs are private `_tab-item` instances (not connectable), so read their props here.
// Each Size variant keeps its items in its own slot ('Slot' or 'Slot 2'); the overflow item sits in 'more'.
const isTabItem = (node: { type: string; name: string }) =>
  node.type === 'INSTANCE' && node.name === '_tab-item';
const itemsIn = (path: string) =>
  instance
    .findLayers(isTabItem, { path: [path] })
    .filter((node): node is InstanceHandle => node.type === 'INSTANCE');

const itemContent = (item: InstanceHandle) => {
  const text = item.findText('Tab');
  const textContent = text.type === 'TEXT' ? text.textContent : 'Tab';
  const label = item.getBoolean('Label') ? textContent : '';
  const leftIcon = item.getBoolean('Left element')
    ? item.getInstanceSwap('l-ic')?.executeTemplate().example
    : undefined;
  const rightIcon = item.getBoolean('Right element')
    ? item.getInstanceSwap('r-ic')?.executeTemplate().example
    : undefined;
  const badgeLayer = item.getBoolean('Badge') ? item.findInstance('numeric-badge') : undefined;
  const badge = badgeLayer?.type === 'INSTANCE' ? badgeLayer.executeTemplate().example : undefined;
  // children is required in code: fall back to the layer text when every element is hidden.
  if (!label && !leftIcon && !rightIcon && !badge) {
    return figma.code`
      ${textContent}`;
  }
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

const items = [...itemsIn('Slot'), ...itemsIn('Slot 2')];
const selectedIndex = items.findIndex(item => item.getEnum('Selected', { On: true }));
// `variant` lives on <Tabs> in code but only on the private `_tab-item` in Figma.
const grayscale = items.some(item => item.getEnum('Grayscale', { On: true }));

const triggers = items.map(
  (item, index) => figma.code`
    <TabsTrigger value='${String(index + 1)}'${figma.helpers.react.renderProp('disabled', item.getEnum('State', { Disabled: true }))}>${itemContent(item)}
    </TabsTrigger>`,
);

const moreItem = moreTabs ? itemsIn('more')[0] : undefined;
const more = moreTabs
  ? figma.code`
    <TabsSeparator />
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <TabsButton${figma.helpers.react.renderProp('size', size)}>${
          moreItem
            ? itemContent(moreItem)
            : figma.code`
      More`
        }
        </TabsButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Action</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>`
  : '';

// Line actions hold connected Buttons (their imports come from the nested template) and separators.
const lineActionsLayer = actions ? instance.findInstance('_tab-line-actions') : undefined;
const lineActionChildren =
  lineActionsLayer?.type === 'INSTANCE'
    ? lineActionsLayer
        .findConnectedInstances(() => true)
        .filter((node): node is InstanceHandle => node.type === 'INSTANCE')
    : [];
const hasActionSeparator = lineActionChildren.some(node => node.name === 'separator');
const lineActions = actions
  ? figma.code`
    <TabsLineActions>${lineActionChildren.map(node =>
      node.name === 'separator'
        ? figma.code`
      <TabsSeparator mx={8} />`
        : figma.code`
      ${node.executeTemplate().example}`,
    )}
    </TabsLineActions>`
  : '';

const panels = items.map(
  (_, index) => figma.code`
  <TabsContent value='${String(index + 1)}'>Content</TabsContent>`,
);

const subcomponents = [
  'TabsList',
  'TabsTrigger',
  'TabsContent',
  ...(moreTabs || hasActionSeparator ? ['TabsSeparator'] : []),
  ...(moreTabs ? ['TabsButton'] : []),
  ...(actions ? ['TabsLineActions'] : []),
];

export default {
  id: 'tabs',
  example: figma.code`<Tabs${selectedIndex >= 0 ? figma.code` defaultValue='${String(selectedIndex + 1)}'` : ''}${figma.helpers.react.renderProp('size', size)}${grayscale ? figma.code` variant='grayscale'` : ''}>
  <TabsList>${triggers}${more}${lineActions}
  </TabsList>${panels}
</Tabs>`,
  imports: [
    `import { Tabs, ${subcomponents.join(', ')} } from '@wallarm-org/design-system/Tabs';`,
    ...(moreTabs
      ? [
          "import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@wallarm-org/design-system/DropdownMenu';",
        ]
      : []),
  ],
  metadata: { nestable: true },
};
