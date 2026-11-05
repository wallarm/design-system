---
title: Detail drawer
description: Use when a row click opens a read-only view of one entity in a side panel, with key-value attributes, sections, tabs and a nested table.
components: [Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerBody, DrawerResizeHandle, Attribute, AttributeLabel, AttributeValue, Heading, Separator, HStack, VStack, Tabs, TabsList, TabsTrigger, TabsContent, TabsLineActions, NumericBadge, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, Button, InlineCodeSnippet, Tag, FormatDateTime, Table, EmptyState, EmptyStateMessage, EmptyStateTitle, Alert, AlertContent, AlertTitle, AlertControls, Tooltip, Dialog]
keywords: [drawer, detail view, details panel, side panel, side sheet, preview, inspector, entity details, read-only view, attributes, key value, properties, label value, actions menu, header actions, tabs in drawer, nested table, drawer width, 700, resize, row click, master cell]
order: 50
---

# Detail drawer

A detail drawer is a `Drawer` with no footer. It shows one entity as `Attribute` rows, titled sections and an optional nested `Table`.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| Read-only details of one row | This pattern, opened from `Table` `onMasterCellClick` | A new page, a `Dialog` |
| Edit several fields | A separate edit drawer or dialog. See [Create and edit forms](./create-edit-forms.md) | Inputs inside the detail drawer |
| Edit one field in place | `InlineEdit` inside `AttributeValue` | A form in the drawer |
| Actions on the entity | One "Actions" `DropdownMenu` in `DrawerHeader` | Several header buttons, a footer |
| Related collections (roles, rules, members) | `Tabs` with `NumericBadge` counts, one `Table` per tab | Stacked tables with no tabs |
| A few titled groups of attributes | `Heading` sections split by `Separator` | `Accordion`, a `Card` per group |
| Confirm a destructive action | A `Dialog` inside `DrawerContent`. See [Confirmation dialogs](./confirmation-dialogs.md) | `window.confirm` |
| Keep the list usable while open | `modal={false} overlay={false} closeOnOutsideClick={false}` | Default props |

## Rules

**Drawer**

- Mount one controlled `Drawer` (`open`, `onOpenChange`) for the list. **Never** one per row.
- Open it from the list `Table` `onMasterCellClick`; mark the row with `activeRowId`. Row-menu clicks do not open it.
- Keep the last entity in state after close so content does not blank.
- Pass `width={640}`. Use 700 (the Figma frame) only if design confirms it. `width` is read once on mount.
- If resizable, put `DrawerResizeHandle` first in `DrawerContent` (400–1130px).
- **Never** add a `DrawerFooter` or your own close button.
- In tests, pass `data-testid` to `Drawer`. **Never** select by `data-slot`.

**Header actions**

- One `DropdownMenu` in `DrawerHeader`, trigger `Button variant='outline' color='neutral' size='small'` "Actions" + `ChevronDown`.
- Order: edit, state changes, "Go to …" links, `DropdownMenuSeparator`, destructive items.
- Destructive items use `variant='destructive'` and name the entity: "Delete provider".
- Keep the built-in 12px before the close X, though Figma shows 4px.

**Spacing**

- `DrawerBody` owns the 24px gutter. **Never** pad inside it or pass `className` to `DrawerHeader`/`DrawerBody`.
- Attribute rows: `VStack gap={6} className='pb-8'`. Sections: `Separator spacing={4}`.
- Section header: `HStack justify='between' align='center' className='py-8'`, `Heading as='h3' size='md' weight='medium'`, optional `Button size='small'`.
- Full-width tabs: `<div className='-mx-24'>` around `TabsList`, not its `className`. Table 16px from the edge: `<div className='-mx-8'>` around `Table`, never on it. No other negative margins.

**Attributes**

- Always pass `orientation='horizontal'`; the default is vertical.
- One `AttributeLabel` `width` per drawer: 140 matches Figma; up to 256 for long labels. **Never** wrap a label.
- Two columns: `grid grid-cols-2 gap-x-8 gap-y-6`, default label width.
- Section help: an `Info` icon in a `Tooltip` after the heading.

| Data | Value | Not |
| --- | --- | --- |
| Plain text | The string as the `AttributeValue` child | A `Text` with your own size |
| ID, URL, claim, scope, path | `InlineCodeSnippet code={value} size='md'` | `Code`, a monospace `span` |
| Several codes | Several `InlineCodeSnippet` in `HStack gap={4}` | One joined string |
| Role, tag, label | `Tag` | `Badge`, plain text |
| Timestamp | `FormatDateTime format='datetime' layout='inline'` | `toLocaleString()` |
| Secret | "Set — never shown" | Dots, a masked input |
| Missing value | `Attribute isEmpty` | `N/A`, `0`, your own dash |
| Icon with text | `HStack gap={6} align='center'` | An `img` with your own margin |

`InlineCodeSnippet` copies on click; `copyable={false}` turns that off.

**Tabs and tables**

- Keep `Tabs` in `DrawerBody` to scroll with the attributes. Pinned tabs: `Tabs asChild` around `DrawerHeader`, `TabsList`, `DrawerBody` (`Drawer` `WithTabs` story); attributes then go in each `TabsContent`.
- Tab action: `Button size='small'` in `TabsLineActions`.
- Nested tables follow [Entity table](./entity-table.md). **Never** use `TableActionBar` in a drawer: it renders underneath.

**Does not exist:** `DRAWER_SIZES`, a `size` prop on `Drawer`, `DrawerActions`, `DrawerHeaderActions`, `AttributeGroup`, `AttributeList`, `DescriptionList`, a section component, `fullBleed` on `TabsList` or `Table`.

## Examples

The list opens one shared drawer from the master cell.

```story
Default
```

The drawer shell with a resize handle and the header actions menu.

```story
Header
```

Attribute rows with a code value, a secret, a missing value and a timestamp.

```story
Attributes
```

A section with a title and an action.

```story
Section
```

Full-width tabs with a count and an inset nested table that stays visible when empty.

```story
NestedTable
```

## States

| State | Show | Example component |
| --- | --- | --- |
| Entity loading | `loading` on every `Attribute` (skeleton label is 100 wide whatever `width`). Not a `Loader` over the body | `Attribute` |
| Nested table loading | `isLoading` with `skeletonCount={3}` | `Table` |
| Nested collection empty | Keep headers; `type='collection-empty'` as a direct `Table` child when `rows.length === 0 && !isLoading`. Title and description only, no `EmptyStateActions`. Not `TableEmptyState` (too tall) | `EmptyState` |
| Field has no value | `isEmpty`; never hide the row | `Attribute` |
| Viewing an old version | `color='info'` first in `DrawerBody`, "Back to current" and "Restore" in `AlertControls`; disable header actions | `Alert` |
| Row open in the drawer | `activeRowId={selectedId}`; not a row `className` | `Table` |
| Action running | `loading` on its button, then a toast; keep the drawer open | `Button` |

The entity is loading.

```story
Loading
```

Viewing an old version.

```story
OldVersion
```

## What your app owns

| You own | The DS owns |
| --- | --- |
| `selectedId`, `open`, fetching | Animation, focus trap, close X |
| Width; persisting it via `onResizeEnd` | Resize drag and limits |
| Attributes, sections, tabs, label width | Row height, truncation, skeletons |
| Menu items and handlers | Menu positioning and keyboard |
| Section headers, grid, bleed offsets | Body gutter, header spacing |
| Confirmation, version restore | Nothing; compose `Dialog`, `Alert` |

## Related

- [Entity table](./entity-table.md), [Resource list page](./resource-list-page.md)
- [Create and edit forms](./create-edit-forms.md), [Confirmation dialogs](./confirmation-dialogs.md)
- [Action-result toasts](./feedback-toasts.md), [Empty states](./empty-states.md)
- [Spacing](../foundations/spacing.md), [Layering](../foundations/layering.md)
