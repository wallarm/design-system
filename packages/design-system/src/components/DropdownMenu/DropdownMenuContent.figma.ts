// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=269-7128
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/DropdownMenu/DropdownMenuContent.tsx
// component=DropdownMenuContent

import figma, { type InstanceHandle } from 'figma';

const instance = figma.selectedInstance;

// Menu rows live in the Slot as private `_dd-item` instances (not connectable on their own),
// so read their properties here and render the matching code sub-component per row.
const rows = instance
  .findLayers(node => node.type === 'INSTANCE' && node.name.startsWith('_dd-item'))
  .filter((node): node is InstanceHandle => node.type === 'INSTANCE');

const text = (row: InstanceHandle, layer: string) => {
  const handle = row.findText(layer, { traverseInstances: true });
  return handle.type === 'TEXT' ? handle.textContent : '';
};

const renderItem = (row: InstanceHandle) => {
  const variant = row.getEnum('Type', { Destructive: 'destructive', Brand: 'brand' });
  const disabled = row.getEnum('State', { Disable: true });
  const name = row.getString('Name');
  const icon = row.getBoolean('Left-icon')
    ? row.getInstanceSwap('l-ic')?.executeTemplate().example
    : undefined;
  const description = row.getBoolean('Description') ? row.getString('Item description') : '';
  const rightElement = row.getBoolean('Right-element') ? row.findInstance('_right-element') : null;
  const right =
    rightElement?.type === 'INSTANCE'
      ? rightElement.getEnum('Content', {
          kbi: 'shortcut',
          Badge: 'shortcut',
          Radio: 'radio',
          Checkbox: 'checkbox',
        })
      : undefined;
  // Checkbox / radio / switch layers are all named `checkbox`; read the visible one's `Selected`.
  const control =
    right && rightElement?.type === 'INSTANCE' ? rightElement.findInstance('checkbox') : null;
  const selected =
    control?.type === 'INSTANCE' && control.getEnum('Selected', { On: true }) === true;
  // kbi -> KbdGroup, Badge -> NumericBadge (both connected).
  const shortcut =
    right === 'shortcut' && rightElement?.type === 'INSTANCE'
      ? figma.code`
    <DropdownMenuShortcut>
      ${rightElement.findConnectedInstances(() => true).map(i => i.executeTemplate().example)}
    </DropdownMenuShortcut>`
      : '';

  const content = figma.code`${icon ? figma.code`<DropdownMenuItemIcon>${icon}</DropdownMenuItemIcon>` : ''}
    ${
      description
        ? figma.code`<DropdownMenuItemContent>
      <DropdownMenuItemText>${name}</DropdownMenuItemText>
      <DropdownMenuItemDescription>${description}</DropdownMenuItemDescription>
    </DropdownMenuItemContent>`
        : figma.code`<DropdownMenuItemText>${name}</DropdownMenuItemText>`
    }${shortcut}`;
  const props = figma.code`${figma.helpers.react.renderProp('variant', variant)}${figma.helpers.react.renderProp('disabled', disabled)}`;

  if (row.getBoolean('Nested')) {
    return figma.code`<DropdownMenu>
    <DropdownMenuTriggerItem${figma.helpers.react.renderProp('variant', variant)}>
      ${content}
    </DropdownMenuTriggerItem>
    <DropdownMenuContent>
      <DropdownMenuItem>Submenu item</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>`;
  }
  if (right === 'checkbox') {
    return figma.code`<DropdownMenuCheckboxItem checked={${selected}}${props}>
    ${content}
  </DropdownMenuCheckboxItem>`;
  }
  if (right === 'radio') {
    // Consecutive radio rows are wrapped in one DropdownMenuRadioGroup by renderRows.
    return figma.code`<DropdownMenuRadioItem${figma.helpers.react.renderProp('value', name)}${props}>
    ${content}
  </DropdownMenuRadioItem>`;
  }
  return figma.code`<DropdownMenuItem${props}>
    ${content}
  </DropdownMenuItem>`;
};

const renderRow = (row: InstanceHandle) => {
  switch (row.getPropertyValue('Content')) {
    case 'Item':
      return renderItem(row);
    case 'Separator':
      return figma.code`<DropdownMenuSeparator />`;
    case 'Header':
      // Header-icon / Header-badge / Header-label / Header-action: no DropdownMenuLabel equivalent.
      return figma.code`<DropdownMenuLabel>${text(row, 'Header')}</DropdownMenuLabel>`;
    case 'Search':
      return figma.code`<DropdownMenuInput${figma.helpers.react.renderProp('placeholder', text(row, 'Placeholder'))} />`;
    case 'Footer':
    case 'Footer (Reset)': {
      // Footer: Cancel/Apply under `Actions` plus a top-level button shown by `Left action`.
      // Footer (Reset): a single top-level button.
      const actions = row.findConnectedInstances(() => true, { path: ['Actions'] });
      const buttons =
        actions.length && !row.getBoolean('Left action')
          ? actions
          : row.findConnectedInstances(() => true);
      return figma.code`<DropdownMenuFooter>
    ${buttons.map(button => button.executeTemplate().example)}
  </DropdownMenuFooter>`;
    }
    default:
      // No results, Drag, Filter suggest, Footer-info: no code equivalent.
      return '';
  }
};

const isRadioRow = (row: InstanceHandle) => {
  if (row.getPropertyValue('Content') !== 'Item' || row.getBoolean('Nested')) return false;
  const right = row.getBoolean('Right-element') ? row.findInstance('_right-element') : null;
  return right?.type === 'INSTANCE' && right.getEnum('Content', { Radio: true }) === true;
};

const radioValue = (row: InstanceHandle) => {
  const right = row.findInstance('_right-element');
  const radio = right.type === 'INSTANCE' ? right.findInstance('checkbox') : null;
  return radio?.type === 'INSTANCE' && radio.getEnum('Selected', { On: true })
    ? row.getString('Name')
    : undefined;
};

// Groups consecutive radio rows into one DropdownMenuRadioGroup (value = the selected row's Name).
const renderRows = () => {
  const out: unknown[] = [];
  let group: InstanceHandle[] = [];
  const flush = () => {
    if (!group.length) return;
    const value = group.map(radioValue).find(Boolean);
    out.push(figma.code`<DropdownMenuRadioGroup${figma.helpers.react.renderProp('value', value)}>
    ${group.map(renderRow)}
  </DropdownMenuRadioGroup>`);
    group = [];
  };
  for (const row of rows) {
    if (isRadioRow(row)) {
      group.push(row);
      continue;
    }
    flush();
    out.push(renderRow(row));
  }
  flush();
  return out;
};

const example = figma.code`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant='outline' color='neutral'>Open</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    ${renderRows()}
  </DropdownMenuContent>
</DropdownMenu>`;

export default {
  id: 'dropdown-menu',
  example,
  imports: [
    "import { Button } from '@wallarm-org/design-system/Button';",
    "import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuFooter, DropdownMenuInput, DropdownMenuItem, DropdownMenuItemContent, DropdownMenuItemDescription, DropdownMenuItemIcon, DropdownMenuItemText, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger, DropdownMenuTriggerItem } from '@wallarm-org/design-system/DropdownMenu';",
  ],
  metadata: { nestable: true },
};
