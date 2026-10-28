// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=821-16083
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Breadcrumbs/Breadcrumbs.tsx
// component=Breadcrumbs

import figma, { type InstanceHandle } from 'figma';

const instance = figma.selectedInstance;

// Items live in the root's Slot as private `_breadcrumb-item` instances (not connectable, so
// getSlot().connectedInstances can't see them). They're picked by their `Truncated` property,
// not by layer name, so renamed layers still match and `_bc-joint` separators are skipped.
// Separators are inserted by <Breadcrumbs> itself; `_bc-joint` Type=Slash has no code equivalent
// (code always renders a chevron).
const items = instance
  .findLayers(
    layer =>
      layer.type === 'INSTANCE' &&
      Object.keys(layer.properties).some(key => key.split('#')[0] === 'Truncated'),
  )
  .filter(item => item.type === 'INSTANCE');

// Icon templates render without `size`; stories use size='md' (16px) — fix belongs in src/icons.
const icon = (item: InstanceHandle, toggle: string, swap: string) =>
  item.getBoolean(toggle) ? item.getInstanceSwap(swap)?.executeTemplate().example : undefined;

const renderedItems = items.map((item, index) => {
  if (item.getBoolean('Truncated')) {
    return figma.code`
  <BreadcrumbsEllipsis onClick={() => {}} />`;
  }

  const text = item.findText('Breadcrumb');
  const textContent = text.type === 'TEXT' ? text.textContent : '';
  const label = item.getBoolean('Label') ? textContent : '';
  // Icon-only items still need a name; the hidden `Breadcrumb` text is reused for it.
  const ariaLabel = label ? '' : ` aria-label='${textContent}'`;
  const leftIcon = icon(item, 'Left icon', 'l-ic');
  const rightIcon = icon(item, 'Right icon', 'r-ic');
  const content = figma.code`${
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
  }`;

  if (item.getBoolean('Dropdown')) {
    return figma.code`
  <BreadcrumbsScopeSwitcher
    value='current'
    items={[{ id: 'current', label: '${textContent}', href: '#' }]}
    onSelect={() => {}}
  >${content}
  </BreadcrumbsScopeSwitcher>`;
  }

  // Figma's `Current` variant is deliberately not read: code sets isCurrent (@internal) on the
  // last child automatically, so the current item is derived from position.
  const href = index === items.length - 1 ? '' : " href='#'";
  return figma.code`
  <BreadcrumbsItem${href}${ariaLabel}>${content}
  </BreadcrumbsItem>`;
});

const usesEllipsis = items.some(item => item.getBoolean('Truncated'));
const usesScopeSwitcher = items.some(item => item.getBoolean('Dropdown'));

export default {
  id: 'breadcrumbs',
  example: figma.code`<Breadcrumbs>${renderedItems}
</Breadcrumbs>`,
  imports: [
    `import { Breadcrumbs, BreadcrumbsItem${usesEllipsis ? ', BreadcrumbsEllipsis' : ''}${usesScopeSwitcher ? ', BreadcrumbsScopeSwitcher' : ''} } from '@wallarm-org/design-system/Breadcrumbs';`,
  ],
  metadata: { nestable: true },
};
