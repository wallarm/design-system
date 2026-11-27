// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12994-5965
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/TableOfContents/TableOfContentsItem.tsx
// component=TableOfContentsItem
import figma from 'figma';

const instance = figma.selectedInstance;

const label = instance.getString('Item name');
const level = instance.getEnum('Level', { '1st': 1, '2nd': 2 }) ?? 1;
// Active is not an item prop: the root's `value` names the active item.
const active = instance.getEnum('Active', { On: true }) ?? false;
// The number is a plain text layer ('1' on level 1, '1.1' on level 2), not a component property.
const numberLayer =
  instance.getEnum('Numeric', { On: true }) === true
    ? instance.findText(level === 2 ? '1.1' : '1')
    : undefined;
const number = numberLayer?.type === 'TEXT' ? numberLayer.textContent : undefined;
// Section ids are the page's; a slug of the label stands in for one.
const value = label
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

export default {
  id: 'toc-item',
  example: figma.code`<TableOfContentsItem value='${value}'${
    number ? figma.code` number='${number}'` : ''
  }${level === 2 ? figma.code` level={2}` : ''}>${label}</TableOfContentsItem>`,
  imports: ["import { TableOfContentsItem } from '@wallarm-org/design-system/TableOfContents';"],
  metadata: { nestable: true, props: { value, active } },
};
