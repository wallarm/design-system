// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=267-5305
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Select/SelectContent.tsx
// component=SelectContent

import figma, { type InstanceHandle } from 'figma';

const instance = figma.selectedInstance;

// Menu rows live in the Slot as private `_select-item` instances (not connectable on their own),
// so read their properties here and render the matching code sub-component per row.
// Rows are matched by their `Content` + `Selected` variants, not by layer name, so renamed rows still count.
const rows = instance
  .findLayers(
    node =>
      node.type === 'INSTANCE' &&
      typeof node.getPropertyValue('Content') === 'string' &&
      typeof node.getPropertyValue('Selected') === 'string',
  )
  .filter((node): node is InstanceHandle => node.type === 'INSTANCE');

const text = (row: InstanceHandle, layer: string) => {
  const handle = row.findText(layer, { traverseInstances: true });
  return handle.type === 'TEXT' ? handle.textContent : '';
};

const kind = (row: InstanceHandle) => row.getPropertyValue('Content');
const items = rows.filter(row => kind(row) === 'Item');
const search = rows.find(row => kind(row) === 'Search');
const footer = rows.find(row => kind(row) === 'Footer');

// Unique collection values: default rows all share the Name 'Item name'.
const values: string[] = [];
for (const [index, row] of items.entries()) {
  const slug = row
    .getString('Name')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  values.push(!slug || values.includes(slug) ? `${slug || 'item'}-${index + 1}` : slug);
}

// The checkbox right element only appears in multi-select menus.
const multiple = items.some(row => row.getBoolean('Right-element'));
const selected = items
  .filter(row => row.getEnum('Selected', { On: true }))
  .map(row => `'${values[items.indexOf(row)]}'`);

const renderItem = (row: InstanceHandle) => {
  const index = items.indexOf(row);
  const icon = row.getBoolean('Left-icon')
    ? row.getInstanceSwap('l-ic')?.executeTemplate().example
    : undefined;
  const description = row.getBoolean('Description') ? row.getString('Item description') : '';
  return figma.code`<SelectOption item={collection.items[${index}]}>
        ${icon ?? ''}<SelectOptionText>${row.getString('Name')}</SelectOptionText>${
          description
            ? figma.code`
        <SelectOptionDescription>${description}</SelectOptionDescription>`
            : ''
        }
        <SelectOptionIndicator />
      </SelectOption>`;
};

// A Header row opens a SelectGroup (Ark's ItemGroupLabel requires one) that runs until the next
// Header or Separator. Search/Footer render outside SelectContent; Badge, Action, Header-counter
// have no code equivalent.
type Section = ReturnType<typeof figma.code>;
const content: Section[] = [];
let group: { label: string; children: Section[] } | undefined;
const closeGroup = () => {
  if (group) {
    content.push(figma.code`<SelectGroup>
        <SelectGroupLabel>${group.label}</SelectGroupLabel>
        ${group.children}
      </SelectGroup>`);
  }
  group = undefined;
};
for (const row of rows) {
  const rowKind = kind(row);
  if (rowKind === 'Header') {
    closeGroup();
    group = { label: text(row, 'Header'), children: [] };
  } else if (rowKind === 'Separator') {
    closeGroup();
    content.push(figma.code`<SelectSeparator />`);
  } else if (rowKind === 'Item' || rowKind === 'No results') {
    const section = rowKind === 'Item' ? renderItem(row) : figma.code`<SelectEmptyState />`;
    (group ? group.children : content).push(section);
  }
}
closeGroup();

const collectionItems = items.map((row, index) => {
  const label = row.getString('Name').replace(/'/g, "\\'");
  const disabled = row.getEnum('State', { Disable: true }) ? ', disabled: true' : '';
  return `{ label: '${label}', value: '${values[index]}'${disabled} }`;
});

const example = figma.code`const collection = createListCollection({
  items: [${collectionItems.join(', ')}],
});${
  search
    ? figma.code`
const { searchValue, onSearchChange } = useSelectSearch(collection);`
    : ''
}

<Select collection={collection}${multiple ? ' multiple' : ''}${
  selected.length > 0 ? ` defaultValue={[${selected.join(', ')}]}` : ''
}>
  <SelectButton />
  <SelectPositioner>${
    search
      ? figma.code`
    <SelectHeader>
      <SelectSearchInput placeholder='${text(search, 'Placeholder')}' value={searchValue} onChange={onSearchChange} />
    </SelectHeader>`
      : ''
  }
    <SelectContent>
      ${content}
    </SelectContent>${
      footer
        ? figma.code`
    <SelectFooter variant='actions'>
      ${footer.findConnectedInstances(() => true).map(button => button.executeTemplate().example)}
    </SelectFooter>`
        : ''
    }
  </SelectPositioner>
</Select>`;

const used = rows.map(kind);
const selectImports = [
  'createListCollection',
  'Select',
  'SelectButton',
  'SelectContent',
  ...(used.includes('No results') ? ['SelectEmptyState'] : []),
  ...(footer ? ['SelectFooter'] : []),
  ...(used.includes('Header') ? ['SelectGroup', 'SelectGroupLabel'] : []),
  ...(search ? ['SelectHeader'] : []),
  ...(items.some(row => row.getBoolean('Description')) ? ['SelectOptionDescription'] : []),
  ...(items.length > 0 ? ['SelectOption', 'SelectOptionIndicator', 'SelectOptionText'] : []),
  'SelectPositioner',
  ...(search ? ['SelectSearchInput'] : []),
  ...(used.includes('Separator') ? ['SelectSeparator'] : []),
  ...(search ? ['useSelectSearch'] : []),
].join(', ');

export default {
  id: 'select-content',
  example,
  imports: [
    `import { ${selectImports} } from '@wallarm-org/design-system/Select';`,
    ...(footer ? ["import { Button } from '@wallarm-org/design-system/Button';"] : []),
  ],
  metadata: { nestable: true },
};
