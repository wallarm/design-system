---
title: Filtering
description: Use when narrowing a list or table by attributes, or picking values from a long list — filter chips, hierarchical scope, query builder, searchable select, picker dialog.
components: [FilterDropdown, FilterCascade, FilterInput, SearchInput, Select, SegmentedTabs, SegmentedControl, NumericBadge, Table, TableEmptyState, EmptyState, Dialog, Page, Field, Button]
keywords: [filter, filters, filter bar, filter chip, filter pill, facet, facets, toolbar, scope filter, hierarchy, cascade, query builder, search, searchable select, combobox, autocomplete, select search, picker, picker dialog, add users, multi select, view toggle]
order: 90
---

# Filtering

Filtering narrows a list without leaving the page. Pick the control by the shape of the values.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| Free-text match on name or ID | `SearchInput` in `PageToolbar` | `Input` with a search icon |
| One status with live counts | `SegmentedTabs` + `NumericBadge` | `FilterDropdown` |
| One flat attribute, one value or «All» | `FilterDropdown` | `Select` in a toolbar |
| One flat attribute, several values OR-ed | `FilterDropdown multiple` | Several `Checkbox` rows |
| A hierarchy (organization › deployment › application) | `FilterCascade` | Nested `DropdownMenu`s, two `FilterDropdown`s |
| Many attributes, operators, AND/OR | `FilterInput` | A row of five or more `FilterDropdown`s |
| A value inside a form | `Select` in `Field` | `FilterDropdown` |
| Pick rows from a large set (add users to a group) | Picker dialog: `Dialog width={960}` + `Table` with selection | A multi `Select` with hundreds of options |
| Switch between table and schema views | `SegmentedControl` with icons, right end of the toolbar | `Tabs` |

- If there are more than four filter attributes, use `FilterInput`.
- If the values have no parent, use `FilterDropdown`. If they do, use `FilterCascade`.
- If a filter applies to a form value, it is not a filter. Use `Select`.

## Anatomy

### Filter bar

| # | Part | Component | Import |
| --- | --- | --- | --- |
| 1 | Row | `PageToolbar` | `@wallarm-org/design-system` |
| 2 | Search | `SearchInput` with `className='w-[320px]'` | `@wallarm-org/design-system` |
| 3 | Flat filter | `FilterDropdown` › `FilterDropdownTrigger` + `FilterDropdownContent` | `@wallarm-org/design-system` |
| 4 | Menu parts | `FilterDropdownSearch`, `FilterDropdownAllOption`, `FilterDropdownSelected`, `FilterDropdownGroup`, `FilterDropdownGroupLabel`, `FilterDropdownOption`, `FilterDropdownEmpty`, `FilterDropdownFooter` | `@wallarm-org/design-system` |
| 5 | Hierarchical filter | `FilterCascade` › `FilterCascadeTrigger` + `FilterCascadeContent` | `@wallarm-org/design-system/FilterCascade` |
| 6 | Cascade parts | `FilterCascadeSearch`, `FilterCascadeLevels`, `FilterCascadeItems`, `FilterCascadeParentItem`, `FilterCascadeGroupLabel`, `FilterCascadeSection`, `FilterCascadeCheckboxItem`, `FilterCascadeClear` | `@wallarm-org/design-system/FilterCascade` |
| 7 | View toggle | `SegmentedControl` › `SegmentedControlItem` | `@wallarm-org/design-system` |

`FilterCascadeTrigger`, `FilterCascadeContent`, `FilterCascadeSearch` and `FilterCascadeClear` are not exported from the package root. Import the whole cascade from `@wallarm-org/design-system/FilterCascade`.

### Searchable select

| # | Part | Component |
| --- | --- | --- |
| 1 | Root | `Select` with `collection` from `createListCollection` |
| 2 | Trigger in a form | `SelectInput` inside `Field` |
| 3 | Menu | `SelectPositioner` › `SelectHeader` + `SelectContent` |
| 4 | Search | `SelectSearchInput` in `SelectHeader`, state from `useSelectSearch` |
| 5 | Option | `SelectOption` › `SelectOptionText`, `SelectOptionDescription`, `SelectOptionHint`, `SelectOptionIndicator` |
| 6 | Pinned group | `SelectGroup` › `SelectGroupLabel` |
| 7 | No match | `SelectEmptyState` |

### Picker dialog

| # | Part | Component | Import |
| --- | --- | --- | --- |
| 1 | Frame | `Dialog width={960}` › `DialogContent` | `@wallarm-org/design-system/Dialog` |
| 2 | Title, close X | `DialogHeader` › `DialogTitle` | `@wallarm-org/design-system/Dialog` |
| 3 | Search and status | `SearchInput` + `SegmentedTabs` with `NumericBadge` | `@wallarm-org/design-system` |
| 4 | Rows | `Table` with `rowSelection` and `onRowSelectionChange` | `@wallarm-org/design-system` |
| 5 | Actions | `DialogFooter` › `DialogClose asChild` Cancel + primary "Add N users" | `@wallarm-org/design-system/Dialog` |

## Layout and spacing

Spacing utilities count in pixels: `gap-8` is 8px. See [Spacing](../foundations/spacing.md).

### Filter bar

| Element | Figma | Code |
| --- | --- | --- |
| Row height | 36 | Every control is 36 high by default |
| Search | 320 × 36 | `SearchInput className='w-[320px]'` |
| Search to first filter, filter to filter | 8 | Wrap search and filters in `<div className='flex items-center gap-8'>` |
| Filter trigger | 36 high, hugs its text, max 180 | `FilterDropdownTrigger`; `h-36 max-w-180` built in |
| Unset filter | Dashed border | Built in (`border-dashed`) |
| Set filter | Solid border, shadow | Built in (`border-solid shadow-2xs`) |
| Scope chip with a path | Wider than 180; each earlier segment truncates at 120 | `FilterCascadeTrigger`; built in |
| View toggle | Right end, 36 high, 40-wide icon pills | `SegmentedControl className='ml-auto'` |
| Toolbar gutter | 24 | Built into `PageToolbar` (`px-24`) |

| Menu | Built-in size |
| --- | --- |
| `FilterDropdownContent` | `min-w-128 max-w-360`, at most 340 high |
| `FilterCascadeContent` level panel | `w-320` per level, levels open side by side |
| `SelectPositioner` | `min-w-240 max-w-320` |
| Single-line option | 32 high (`py-6` + 20 line) |
| Option with `SelectOptionDescription` | 48 high (adds a 16 line) |

- If the toolbar has filters, group `SearchInput` and the filters in one `flex items-center gap-8` div. `PageToolbar` keeps its own `gap-12` between that group and the rest.
- If the toolbar has a view toggle, give it `className='ml-auto'`. It goes last.
- **Never** add `gap-*`, `px-*` or `py-*` to `PageToolbar`.
- **Never** set a width on `FilterDropdownTrigger` or `FilterCascadeTrigger`. They hug their text.

### Searchable select

- If the menu must match the trigger width, pass `positioning={{ sameWidth: true }}` to `Select` and `className='min-w-full max-w-full'` to `SelectPositioner`.
- If you do neither, the menu is 240 to 320 wide, whatever the trigger width.

### Picker dialog

| Element | Figma | Code |
| --- | --- | --- |
| Width | 960 | `Dialog width={960}` |
| Header | 64 high | `DialogHeader` (`pt-16 pb-12 pl-24 pr-16`), built in |
| Side gutter | 24 | `DialogBody` (`px-24`), built in |
| Search to status tabs | 12 | `<div className='flex items-center gap-12'>`; `SearchInput className='flex-1'` |
| Toolbar to table | 8 | Wrap the body in `<div className='flex flex-col gap-8'>` |
| Header row | 32 | `Table`, built in |
| Row with name and email | 56 | Two-line cell, see [Entity table](./entity-table.md) |
| Checkbox column | 32 | Built in (33 wide) when `onRowSelectionChange` is set |
| Footer | Cancel + primary, 8 apart | `DialogFooter` (`px-24 py-16 gap-8 justify-end`), built in |

- `DialogBody` has no `className` prop. Put layout classes on one child div.
- **Never** pad `DialogBody`, `DialogHeader` or `DialogFooter`.

## States

### Filter bar

| State | Do | Not |
| --- | --- | --- |
| Filter unset | Single mode reads `allLabel` ("All environments"); multi mode reads `label` | An empty trigger |
| One value set | Single: the value. Multi: "Type • Lua" | Custom trigger text |
| Several values set | "Type • 2" with a `NumericBadge`, built in | A tag per value in the toolbar |
| Reset one filter | Multi: the ✕ on the trigger, or Backspace on the focused trigger. Single: «All» | A separate Reset button per filter |
| Reset the scope chip | The ✕ returns to the page default, everything shown | Stepping up one level |
| 8 or more options | `FilterDropdownSearch` appears; `searchThreshold` changes the count | Always showing search |
| Search matches nothing | Render `FilterDropdownEmpty` ("Nothing matches"). The cascade shows `FilterCascadeEmpty` ("No results"), built in | Closing the menu |
| Cascade level loading or failed | Built in: loading rows, then a Retry row | Your own spinner |
| Filters match no rows | `TableEmptyState` › `EmptyState type='collection-empty'` with `Button variant='outline' color='neutral'` "Reset filters"; see [Empty states](./empty-states.md) | A create CTA |

### Searchable select

| State | Do | Not |
| --- | --- | --- |
| Long list (8 or more) | `SelectHeader` › `SelectSearchInput` | Scrolling only |
| No match | `SelectEmptyState description='No results for "…"'` | An empty menu |
| Detected or default value | Pin it first in its own `SelectGroup` ("Suggested") | Sorting it alphabetically |
| Settings page | Selecting saves and fires a toast; see [Feedback toasts](./feedback-toasts.md) | A Save button for one select |

### Picker dialog

| State | Do | Not |
| --- | --- | --- |
| Nothing selected | Primary is `disabled`, label "Add users" | An enabled primary that does nothing |
| Rows selected | Primary reads "Add 1 user", "Add 3 users" | "Add" without a count, "Add 1 users" |
| Request running | Primary `loading`; the dialog stays open | Closing before the request resolves |
| Success | Close, then toast "3 users added" | Keeping the dialog open |
| Search matches nothing | `EmptyState type='collection-empty'` as a direct `Table` child | `TableEmptyState` (too tall for a dialog) |
| Already a member | Leave the row out of `data` | A disabled row with no reason |

## Rules

- Apply a filter the moment it is picked. There is no Apply step in `FilterDropdown` or `FilterCascade`.
- Give every `FilterDropdown` a `label`. It names the trigger, the aria-label and «Clear {label}».
- If the attribute is exclusive, use single mode with `allLabel`. «All …» is the reset.
- If values combine, use `multiple`. Values are OR-ed.
- Build `collection` with `createListCollection({ items })`. For groups pass `groupBy`.
- Render options from `useFilterDropdown().groups` so the list follows the search. Call it in a child component of `FilterDropdown`.
- Read the value from `onValueChange(details)` as `details.value`. `[]` means unset.
- For `FilterCascade`, build `collection` with `createFilterCascadeCollection(items, accessors)`. Plain `{ value, label, children }` items need no accessors.
- If a cascade level loads on demand, pass `loadChildren` and mark parents with `hasChildren`.
- If a parent itself is pickable ("Deployment level"), pass `parentLabel`.
- If a menu needs an on/off toggle ("Show organization policies"), use `FilterCascadeCheckboxItem` in `FilterCascadeSection`. The menu stays open.
- Show "No policies" for a zero count. **Never** leave the description line empty.
- Use `FilterInput` with `fields` metadata and `value` / `onChange(ExprNode | null)`. Its menus and chips are internal.
- Use `Select` with `SelectInput` inside `Field` for form values.
- Put `SelectSearchInput` inside `SelectHeader`. Feed it `searchValue` and `onSearchChange` from `useSelectSearch`.
- Pass the original collection to `Select`. Render options from `filteredCollection`.
- If options carry an icon, set `icon` on the `SelectDataItem`. `SelectButton` shows the picked icon in the trigger.
- If a picker selects rows, use `Table` selection. Pass `getRowId` so selection survives search.
- **Never** put `FilterDropdown` inside a form.
- **Never** add an Apply or OK button to a filter menu.
- **Never** stack two `SegmentedTabs` in one toolbar.

There is no `FilterBar` component. There is no `PageFilters` slot. There is no `Combobox` component; a searchable select is `Select` + `useSelectSearch`. There is no `onApply` prop on any filter. There is no `width` prop on `FilterDropdownTrigger`. `SelectButtonTag` is a tag-shaped trigger, not a chip list; `SelectInput` with `multiple` renders the chips itself. There is no `DIALOG_SIZES` export; pass `width={960}`.

## Example

### Filter bar

```tsx
import { useState } from 'react';
import {
  createListCollection,
  FilterDropdown,
  FilterDropdownAllOption,
  FilterDropdownContent,
  FilterDropdownEmpty,
  FilterDropdownFooter,
  FilterDropdownGroup,
  FilterDropdownGroupLabel,
  FilterDropdownOption,
  FilterDropdownSearch,
  FilterDropdownSelected,
  FilterDropdownTrigger,
  PageToolbar,
  SearchInput,
  SegmentedControl,
  SegmentedControlItem,
  useFilterDropdown,
} from '@wallarm-org/design-system';
import {
  createFilterCascadeCollection,
  FilterCascade,
  FilterCascadeContent,
  FilterCascadeGroupLabel,
  FilterCascadeItems,
  FilterCascadeLevels,
  FilterCascadeParentItem,
  FilterCascadeSearch,
  FilterCascadeTrigger,
} from '@wallarm-org/design-system/FilterCascade';
import { List, Workflow } from '@wallarm-org/design-system/icons';

interface Option {
  value: string;
  label: string;
  count?: number;
}

interface Scope {
  uid: string;
  name: string;
  kind: 'organization' | 'deployment' | 'application';
  policies: number;
}

const typeOptions = createListCollection<Option>({
  items: [
    { value: 'lua', label: 'Lua', count: 12 },
    { value: 'wasm', label: 'WASM', count: 4 },
    { value: 'plugin', label: 'Plugin', count: 7 },
  ],
});

const stateOptions = createListCollection<Option>({
  items: [
    { value: 'enabled', label: 'Enabled' },
    { value: 'disabled', label: 'Disabled' },
  ],
});

const scopes = createFilterCascadeCollection<Scope>(
  [
    { uid: 'org', name: 'Organization only', kind: 'organization', policies: 3 },
    { uid: 'prod-eu', name: 'Production EU', kind: 'deployment', policies: 5 },
    { uid: 'staging', name: 'Staging', kind: 'deployment', policies: 0 },
  ],
  {
    getValue: scope => scope.uid,
    getLabel: scope => scope.name,
    hasChildren: scope => scope.kind === 'deployment',
    getDescription: scope => (scope.policies === 0 ? 'No policies' : `${scope.policies} policies`),
  },
);

const loadApplications = async (deployment: Scope): Promise<Scope[]> => [
  { uid: `${deployment.uid}-api`, name: 'api', kind: 'application', policies: 2 },
];

const FilterMenu = () => {
  const { groups } = useFilterDropdown<Option>();

  return (
    <FilterDropdownContent>
      <FilterDropdownSearch />
      <FilterDropdownAllOption />
      <FilterDropdownSelected<Option>>
        {item => <FilterDropdownOption item={item} hint={item.count} />}
      </FilterDropdownSelected>
      {groups.map(([group, items]) => (
        <FilterDropdownGroup key={group}>
          {group && <FilterDropdownGroupLabel>{group}</FilterDropdownGroupLabel>}
          {items.map(item => (
            <FilterDropdownOption key={item.value} item={item} hint={item.count} />
          ))}
        </FilterDropdownGroup>
      ))}
      <FilterDropdownEmpty />
      <FilterDropdownFooter />
    </FilterDropdownContent>
  );
};

const ScopeMenu = () => (
  <FilterCascadeContent>
    <FilterCascadeSearch placeholder='Search' />
    <FilterCascadeLevels>
      {level =>
        level.depth === 0 ? (
          <>
            <FilterCascadeItems filter={item => item.node.value === 'org'} />
            <FilterCascadeGroupLabel>Deployments</FilterCascadeGroupLabel>
            <FilterCascadeItems filter={item => item.node.value !== 'org'} />
          </>
        ) : (
          <>
            <FilterCascadeParentItem />
            <FilterCascadeGroupLabel>Applications</FilterCascadeGroupLabel>
            <FilterCascadeItems />
          </>
        )
      }
    </FilterCascadeLevels>
  </FilterCascadeContent>
);

export const PoliciesToolbar = () => {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [state, setState] = useState<string[]>([]);
  const [view, setView] = useState('table');

  return (
    <PageToolbar>
      <div className='flex items-center gap-8'>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder='Search name or ID'
          className='w-[320px]'
        />
        <FilterCascade
          label='Scope'
          collection={scopes}
          loadChildren={loadApplications}
          parentLabel='Deployment level'
          value={scope}
          onValueChange={details => setScope(details.value)}
        >
          <FilterCascadeTrigger />
          <ScopeMenu />
        </FilterCascade>
        <FilterDropdown
          label='Type'
          multiple
          collection={typeOptions}
          value={types}
          onValueChange={details => setTypes(details.value)}
        >
          <FilterDropdownTrigger />
          <FilterMenu />
        </FilterDropdown>
        <FilterDropdown
          label='State'
          allLabel='All states'
          collection={stateOptions}
          value={state}
          onValueChange={details => setState(details.value)}
        >
          <FilterDropdownTrigger />
          <FilterMenu />
        </FilterDropdown>
      </div>
      <SegmentedControl value={view} onChange={setView} className='ml-auto'>
        <SegmentedControlItem value='table'>
          <List />
          <span className='sr-only'>Table view</span>
        </SegmentedControlItem>
        <SegmentedControlItem value='schema'>
          <Workflow />
          <span className='sr-only'>Schema view</span>
        </SegmentedControlItem>
      </SegmentedControl>
    </PageToolbar>
  );
};
```

### Searchable select

```tsx
import {
  createListCollection,
  Field,
  FieldLabel,
  Select,
  SelectContent,
  type SelectDataItem,
  SelectEmptyState,
  SelectGroup,
  SelectGroupLabel,
  SelectHeader,
  SelectInput,
  SelectOption,
  SelectOptionDescription,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
  SelectSearchInput,
  useSelectSearch,
} from '@wallarm-org/design-system';

const timezones = createListCollection<SelectDataItem>({
  items: [
    { value: 'Europe/Berlin', label: 'Berlin', description: 'UTC+01:00', category: 'Suggested' },
    { value: 'UTC', label: 'UTC', description: 'UTC+00:00', category: 'All time zones' },
    { value: 'Europe/London', label: 'London', description: 'UTC+00:00', category: 'All time zones' },
    { value: 'America/New_York', label: 'New York', description: 'UTC−05:00', category: 'All time zones' },
  ],
  groupBy: item => item.category ?? '',
});

interface TimezoneSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const TimezoneSelect = ({ value, onChange }: TimezoneSelectProps) => {
  const { searchValue, onSearchChange, filteredCollection } = useSelectSearch(timezones);

  return (
    <Field>
      <FieldLabel>Time zone</FieldLabel>
      <Select
        collection={timezones}
        value={[value]}
        onValueChange={details => onChange(details.value[0] ?? value)}
        positioning={{ sameWidth: true }}
      >
        <SelectInput placeholder='Choose a time zone' />
        <SelectPositioner className='min-w-full max-w-full'>
          <SelectHeader>
            <SelectSearchInput value={searchValue} onChange={onSearchChange} />
          </SelectHeader>
          <SelectContent>
            {filteredCollection.size === 0 ? (
              <SelectEmptyState description={`No results for "${searchValue}"`} />
            ) : (
              filteredCollection.group().map(([group, items]) => (
                <SelectGroup key={group}>
                  <SelectGroupLabel>{group}</SelectGroupLabel>
                  {items.map(item => (
                    <SelectOption key={item.value} item={item}>
                      <SelectOptionText>{item.label}</SelectOptionText>
                      <SelectOptionDescription>{item.description}</SelectOptionDescription>
                      <SelectOptionIndicator />
                    </SelectOption>
                  ))}
                </SelectGroup>
              ))
            )}
          </SelectContent>
        </SelectPositioner>
      </Select>
    </Field>
  );
};
```

### Picker dialog

```tsx
import { useState } from 'react';
import {
  Button,
  createTableColumnHelper,
  NumericBadge,
  SearchInput,
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
  Table,
  type TableColumnDef,
  type TableRowSelectionState,
} from '@wallarm-org/design-system';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@wallarm-org/design-system/Dialog';

interface Candidate {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'deactivated';
}

const columnHelper = createTableColumnHelper<Candidate>();

const columns: TableColumnDef<Candidate>[] = [
  columnHelper.accessor('name', { header: 'Name', size: 256 }),
  columnHelper.accessor('email', { header: 'Email', size: 256 }),
  columnHelper.accessor('status', { header: 'Status', size: 140 }),
];

interface AddUsersDialogProps {
  groupName: string;
  candidates: Candidate[];
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (ids: string[]) => void;
}

export const AddUsersDialog = ({
  groupName,
  candidates,
  open,
  pending,
  onOpenChange,
  onAdd,
}: AddUsersDialogProps) => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selection, setSelection] = useState<TableRowSelectionState>({});

  const needle = query.trim().toLowerCase();
  const rows = candidates.filter(
    user =>
      (status === 'all' || user.status === status) &&
      (user.name.toLowerCase().includes(needle) || user.email.toLowerCase().includes(needle)),
  );
  const countOf = (value: string) =>
    candidates.filter(user => value === 'all' || user.status === value).length;

  const selectedIds = Object.keys(selection).filter(id => selection[id]);
  const count = selectedIds.length;
  const label = count === 0 ? 'Add users' : `Add ${count} ${count === 1 ? 'user' : 'users'}`;

  const handleAdd = () => onAdd(selectedIds);

  return (
    <Dialog width={960} open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add users to {groupName}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className='flex flex-col gap-8'>
            <div className='flex items-center gap-12'>
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder='Search name or email'
                className='flex-1'
              />
              <SegmentedTabs value={status} onChange={setStatus}>
                <SegmentedTabsList>
                  <SegmentedTabsTrigger value='all'>All</SegmentedTabsTrigger>
                  <SegmentedTabsTrigger value='active'>
                    Active <NumericBadge>{countOf('active')}</NumericBadge>
                  </SegmentedTabsTrigger>
                  <SegmentedTabsTrigger value='deactivated'>
                    Deactivated <NumericBadge>{countOf('deactivated')}</NumericBadge>
                  </SegmentedTabsTrigger>
                </SegmentedTabsList>
              </SegmentedTabs>
            </div>
            <Table
              aria-label='Users to add'
              data={rows}
              columns={columns}
              getRowId={row => row.id}
              rowSelection={selection}
              onRowSelectionChange={setSelection}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='ghost' color='neutral'>
              Cancel
            </Button>
          </DialogClose>
          <Button disabled={selectedIds.length === 0} loading={pending} onClick={handleAdd}>
            {label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

## What your app owns

| Concern | Owner | Recipe with the current API |
| --- | --- | --- |
| Filtering the data | App | Filters only hold values. Apply `details.value` to your query or array yourself |
| URL state | App | Sync every filter value to the URL yourself. The DS has no router integration |
| Reset all filters | App | No built-in "Reset all". Set every filter value to `[]` and the search to `''` |
| Gap between search and filters | App | `PageToolbar` is `gap-12`; Figma uses 8. Wrap them in `<div className='flex items-center gap-8'>` |
| Scope level dots (6px, violet / sky / teal) | App | No scope marker component. Return a `size-6 rounded-full` span with `bg-badge-violet-strong`, `bg-badge-sky-strong` or `bg-badge-teal-strong` from `getIcon` |
| Scope "Own only", "Without organization" chip states | App | Not built in. Model them as `FilterCascadeCheckboxItem` toggles and keep their state yourself |
| Option counts | App | Pass them as `hint` on `FilterDropdownOption` or as `getDescription` on the cascade |
| Menu matching trigger width | App | `Select positioning={{ sameWidth: true }}` + `SelectPositioner className='min-w-full max-w-full'` |
| Pinned "current" option | App | Order the items yourself and put the pinned one in its own `category` |
| Server-side search in a picker | App | `useSelectSearch` and `Table` filter nothing on the server. Debounce `query` and refetch `data` |
| Picker selection across pages | App | `rowSelection` keys are row ids. Keep them when `data` changes; pass `getRowId` |
| Two-line user cell in the picker | App | No user cell component. Render name and muted email in `cell`; see [Entity table](./entity-table.md) |

## Related

- [Spacing](../foundations/spacing.md)
- [Resource list page](./resource-list-page.md)
- [Entity table](./entity-table.md)
- [Empty states](./empty-states.md)
- [Settings page](./settings-page.md)
- [Feedback toasts](./feedback-toasts.md)
- [Create and edit forms](./create-edit-forms.md)
