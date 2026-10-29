// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9345-34137
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/NavPanel/NavPanel.tsx
// component=NavPanel
import figma, { type SlotResult } from 'figma';

// An empty slot comes back as a guid-less SLOT section that renders "Missing snippet".
const filled = (slot?: SlotResult) => !!slot?.some(s => s.type !== 'SLOT' || s.guid);

const instance = figma.selectedInstance;

// `Type` (Slot / Product A / Nested) only changes what sits in the Container slot.
// Nested = "Back to …" item (NavPanelBack via the item template) + private `_dd-item`
// divider, which has no Code Connect, so NavPanelDivider is emitted here.
const header = instance.findInstance('_2nd-rail-product-header');
// Strip braces so placeholder text like `{product-name}` stays text, not a JSX expression.
const productName =
  header.type === 'INSTANCE' ? header.getString('Name').replace(/[{}]/g, '') : 'Product name';
const items = instance.getSlot('Container');
const nested = instance.getEnum('Type', { Nested: true });
const divider = nested
  ? figma.code`
  <NavPanelDivider />`
  : '';

export default {
  id: 'nav-panel',
  example: figma.code`<NavPanel>
  <NavPanelHeader>${productName}</NavPanelHeader>
  ${filled(items) ? items : '...'}${divider}
</NavPanel>`,
  imports: [
    `import { NavPanel, NavPanelHeader${nested ? ', NavPanelDivider' : ''} } from '@wallarm-org/design-system/NavPanel';`,
  ],
  metadata: { nestable: false },
};
