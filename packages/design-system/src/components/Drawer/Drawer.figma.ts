// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=2507-20115
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Drawer/Drawer.tsx
// component=Drawer

import figma, { type InstanceHandle } from 'figma';

const instance = figma.selectedInstance;

// Small (640) is the code default; custom sizes get placeholder values to replace.
const width = instance.getEnum('Size', {
  Medium: 960,
  Large: 1130,
  'Custom (%)': '50%',
  'Custom (fixed)': 1000,
});

const examples = (nodes: ReturnType<InstanceHandle['findConnectedInstances']>) =>
  nodes.map(node => node.executeTemplate().example);

const header = instance.findInstance('_header');
const title = header.type === 'INSTANCE' ? header.getString('Title') : 'Drawer title';
const description =
  header.type === 'INSTANCE' && header.getBoolean('2nd line')
    ? header.getString('Description')
    : undefined;
// The Actions slot also holds the close X Button; DrawerHeader renders DrawerClose itself,
// so only the extra actions inside `_drawer-header-actions` are emitted.
const headerActionsLayer =
  header.type === 'INSTANCE' && header.getBoolean('Header actions')
    ? header.findInstance('_drawer-header-actions')
    : undefined;
const headerActions =
  headerActionsLayer?.type === 'INSTANCE'
    ? examples(headerActionsLayer.findConnectedInstances(() => true))
    : [];

// Figma's `tabs` is only the tab bar; code wraps the drawer content in <Tabs asChild>
// (WithTabs story), so build TabsList / TabsContent here from the `_tab-item` labels.
const tabsLayer = instance.getBoolean('Tabs') ? instance.findInstance('tabs') : undefined;
const tabLabels =
  tabsLayer?.type === 'INSTANCE'
    ? tabsLayer
        .findLayers(node => node.type === 'INSTANCE' && node.name === '_tab-item')
        .filter(
          (node): node is InstanceHandle =>
            node.type === 'INSTANCE' && !node.path?.includes('more'),
        )
        .map(item => {
          const text = item.findText('Tab');
          return text.type === 'TEXT' ? text.textContent : 'Tab';
        })
    : [];
const hasTabs = tabLabels.length > 0;

const stepperLayer = instance.getBoolean('Stepper') ? instance.findInstance('stepper') : undefined;
const stepper =
  stepperLayer?.type === 'INSTANCE' && stepperLayer.hasCodeConnect()
    ? stepperLayer.executeTemplate().example
    : undefined;
const resizeHandle = instance.getBoolean('Resize handle');
const body = instance.getSlot('Slot');

const footer = instance.getBoolean('Footer') ? instance.findInstance('_footer') : undefined;
const footerActions =
  footer?.type === 'INSTANCE'
    ? examples(footer.findConnectedInstances(() => true, { path: ['Actions'] }))
    : [];
const leftActionsLayer =
  footer?.type === 'INSTANCE' && footer.getBoolean('More actions')
    ? footer.findInstance('_drawer-footer-actions')
    : undefined;
const footerLeftActions =
  leftActionsLayer?.type === 'INSTANCE'
    ? examples(leftActionsLayer.findConnectedInstances(() => true))
    : [];
// With a secondary + primary pair, the secondary one dismisses the drawer (as in the stories).
const closesOnFirst = footerActions.length > 1;

const tabsList = hasTabs
  ? figma.code`
      <TabsList>${tabLabels.map(
        (label, index) => figma.code`
        <TabsTrigger value='${String(index + 1)}'>${label}</TabsTrigger>`,
      )}
      </TabsList>`
  : '';
const bodyContent = hasTabs
  ? tabLabels.map(
      (_, index) => figma.code`
        <TabsContent value='${String(index + 1)}'>${index === 0 && body ? body : 'Content'}</TabsContent>`,
    )
  : figma.code`
        ${body ?? ''}`;

const footerCode =
  footerActions.length || footerLeftActions.length
    ? figma.code`
      <DrawerFooter>${
        footerLeftActions.length
          ? figma.code`
        <DrawerFooterControls placement='left'>${footerLeftActions.map(
          action => figma.code`
          ${action}`,
        )}
        </DrawerFooterControls>`
          : ''
      }${
        footerActions.length
          ? figma.code`
        <DrawerFooterControls>${footerActions.map((action, index) =>
          index === 0 && closesOnFirst
            ? figma.code`
          <DrawerClose asChild>
            ${action}
          </DrawerClose>`
            : figma.code`
          ${action}`,
        )}
        </DrawerFooterControls>`
          : ''
      }
      </DrawerFooter>`
    : '';

const content = figma.code`${
  resizeHandle
    ? figma.code`
      <DrawerResizeHandle />`
    : ''
}
      <DrawerHeader>
        <DrawerTitle>${title}</DrawerTitle>${
          description
            ? figma.code`
        <DrawerDescription>${description}</DrawerDescription>`
            : ''
        }${headerActions.map(
          action => figma.code`
        ${action}`,
        )}
      </DrawerHeader>${tabsList}${
        stepper
          ? figma.code`
      ${stepper}`
          : ''
      }
      <DrawerBody>${bodyContent}
      </DrawerBody>${footerCode}`;

const example = figma.code`<Drawer${figma.helpers.react.renderProp('width', width)}>
  <DrawerTrigger asChild>
    <Button>Open drawer</Button>
  </DrawerTrigger>
  <DrawerContent>${
    hasTabs
      ? figma.code`
    <Tabs defaultValue='1' asChild>${content}
    </Tabs>`
      : content
  }
  </DrawerContent>
</Drawer>`;

const drawerImports = [
  'Drawer',
  'DrawerBody',
  ...(closesOnFirst ? ['DrawerClose'] : []),
  'DrawerContent',
  ...(description ? ['DrawerDescription'] : []),
  ...(footer ? ['DrawerFooter'] : []),
  ...(footerActions.length || footerLeftActions.length ? ['DrawerFooterControls'] : []),
  'DrawerHeader',
  ...(resizeHandle ? ['DrawerResizeHandle'] : []),
  'DrawerTitle',
  'DrawerTrigger',
];

export default {
  id: 'drawer',
  example,
  imports: [
    `import { ${drawerImports.join(', ')} } from '@wallarm-org/design-system/Drawer';`,
    "import { Button } from '@wallarm-org/design-system/Button';",
    ...(hasTabs
      ? [
          "import { Tabs, TabsContent, TabsList, TabsTrigger } from '@wallarm-org/design-system/Tabs';",
        ]
      : []),
  ],
  metadata: { nestable: false },
};
