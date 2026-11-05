---
title: Detail drawer
description: Use when a row click opens a read-only view of one entity in a side panel, with key-value attributes, sections, tabs and a nested table.
components: [Drawer, Attribute, Heading, Separator, Stack, Tabs, NumericBadge, DropdownMenu, Button, InlineCodeSnippet, Tag, FormatDateTime, Table, EmptyState, Alert, Tooltip]
keywords: [drawer, detail view, details panel, side panel, side sheet, preview, inspector, entity details, read-only view, attributes, key value, properties, label value, actions menu, header actions, tabs in drawer, nested table, drawer width, 700, resize, row click, master cell]
order: 50
---

# Detail drawer

A detail drawer is a `Drawer` with no footer. It shows one entity as `Attribute` rows, titled sections and an optional nested `Table`.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| Read-only details of one row | `Drawer` opened from `Table` `onMasterCellClick` | A new page, a `Dialog` |
| Edit several fields of the entity | A separate edit drawer or dialog. See [Create and edit forms](./create-edit-forms.md) | Inputs inside the detail drawer |
| Edit one field in place | `InlineEdit` inside `AttributeValue` | A form in the detail drawer |
| Actions on the entity | One "Actions" `DropdownMenu` in `DrawerHeader` | Several buttons in the header or a footer |
| Related collections (roles, rules, members) | `Tabs` with `NumericBadge` counts, one `Table` per tab | Several stacked tables with no tabs |
| A few titled groups of attributes | `Heading` sections split by `Separator` | `Accordion`, `Card` per group |
| Confirm a destructive action | A `Dialog` inside `DrawerContent`. See [Confirmation dialogs](./confirmation-dialogs.md) | `window.confirm` |

If the user must keep the list usable while the drawer is open, pass `modal={false} overlay={false} closeOnOutsideClick={false}`. Otherwise keep the defaults.

## Anatomy

| Part | What renders it | Notes |
| --- | --- | --- |
| Panel | `Drawer` + `DrawerContent` | Default width 640. Draws `rounded-12 border border-border-primary-light bg-bg-surface-2 shadow-xl`. |
| Resize handle | `DrawerResizeHandle` | Optional. First child of `DrawerContent`. Drags between `minWidth` 400 and `maxWidth` 1130. |
| Header | `DrawerHeader` | Title block on the left, your children on the right, close X last. |
| Title | `DrawerTitle` | 18px medium, `leading-28`. Renders the dialog title for screen readers. |
| Entity actions | `DropdownMenu` with a `Button size='small' variant='outline' color='neutral'` trigger | Child of `DrawerHeader`. Renders right of the title. |
| Close button | `DrawerHeader` | Added automatically. **Never** add your own close button. |
| Body | `DrawerBody` | Scrolls. Owns the 24px side gutter. |
| Attribute rows | `Attribute orientation='horizontal'` with `AttributeLabel` and `AttributeValue` | One row per field. |
| Section | `Separator` + `Heading as='h3'` + attribute rows | One section per group in Figma. |
| Section action | `Button size='small'` right of the section `Heading` | For example "Create rule". |
| Tabs | `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent` | Counts in `NumericBadge`. Tab action in `TabsLineActions`. |
| Nested table | `Table` inside a section or a `TabsContent` | Same cell rules as [Entity table](./entity-table.md). |
| Footer | None | A detail drawer has no `DrawerFooter`. |

Value vocabulary. Pick from this table.

| Data | Value | Not |
| --- | --- | --- |
| Plain text | The string as the child of `AttributeValue` | A `Text` wrapper with your own size |
| ID, URL, claim, scope, path | `InlineCodeSnippet code={value} size='md'` from `@wallarm-org/design-system/CodeSnippet` | `Code`, a monospace `span` |
| Several codes in one row | Several `InlineCodeSnippet` in an `HStack gap={4}` | One string joined with spaces |
| Role, tag, label | `Tag` | `Badge`, plain text |
| Timestamp | `FormatDateTime value={…} format='datetime' layout='inline'` | `toLocaleString()` |
| Secret | The text `Set — never shown` | Dots, a masked input |
| Missing value | `Attribute isEmpty` | `N/A`, `0`, an empty `AttributeValue` with your own dash |
| Provider or entity with an icon | Icon plus text in an `HStack gap={6} align='center'` | An `img` with your own margin |

`InlineCodeSnippet` copies its text on click by default. Pass `copyable={false}` if the value must not be copied.

## Layout and spacing

### Figma frame

| Element | Figma | Code |
| --- | --- | --- |
| Drawer width | 700 | `width={640}` by default. `width={700}` only if design confirms it. See [What your app owns](#what-your-app-owns) |
| Header height | 56 | Built in: `pt-16 pb-12 pl-24 pr-16`, title `leading-28` |
| Header actions | "Actions" button 24px tall, close X 24px | `Button size='small'` is 24px |
| Body side gutter | 24 | Built in: `DrawerBody` `px-24` |
| Attribute row | 28 tall | Built in: label and value `py-4` with 20px text |
| Attribute row pitch | 34 (6 between rows) | `VStack gap={6}` around the rows |
| Value column start | 152 from the gutter | `AttributeLabel width={140}`. The row adds `gap-12`, so 140 + 12 = 152 |
| Two attribute columns | 2 × 322, 8 apart, label 100 | `grid grid-cols-2 gap-x-8 gap-y-6`, default `AttributeLabel` width 100 |
| Rows to separator | 8 | `pb-8` on the rows `VStack` |
| Separator | 1px line, 9 tall | `Separator spacing={4}` |
| Section header | 40 tall, 24px text | `HStack justify='between' align='center' className='py-8'` with `Heading as='h3' size='md' weight='medium'` |
| Tabs bar | Full drawer width, 42 tall | `TabsList` inside `<div className='-mx-24'>` |
| Nested table | 16 from the drawer edge | `<div className='-mx-8'>` around `Table` |
| Table header row | 32 | Built in |
| Table row | 36 | Built in |

### Built-in spacing

| Part | Built-in value |
| --- | --- |
| `DrawerPositioner` | `p-8` inset from the viewport |
| `DrawerHeader` | `pt-16 pb-12 pl-24 pr-16`, `gap-12` between title block, your children and the close X |
| `DrawerBody` | `px-24`, `pt-8`, `pb-24` (no footer) |
| `Attribute orientation='horizontal'` | `flex items-start gap-12` |
| `AttributeLabel` (horizontal) | Width clamped to 100–256, `py-4`, `text-sm text-text-secondary`, truncates |
| `AttributeValue` (horizontal) | `flex-1 min-w-0 py-4`, truncates |
| `TabsList` | `px-24`, `border-b-1 border-border-primary-light` |
| `TabsLineActions` | `ml-auto gap-4` |

- **Never** pass `className` to `DrawerHeader` or `DrawerBody`. They accept only `children` and `ref`.
- **Never** add padding inside `DrawerBody`. Content aligns to its 24px gutter.
- The only offsets in this pattern are `-mx-24` on the tabs bar and `-mx-8` on a nested table. Both pull content out of the gutter to match Figma. Use no other negative margins.
- The header puts 12px between your actions and the close X. Figma shows 4px. Keep 12px.

## States

| State | Do | Not |
| --- | --- | --- |
| Entity loading | `Attribute loading` on every row. It swaps label and value for skeletons; the skeleton label is 100 wide whatever `width` you set | A `Loader` over the body |
| Nested table loading | `Table isLoading` with `skeletonCount={3}` | An empty table |
| Nested collection empty | Keep the `Table` with its headers. Render `EmptyState type='collection-empty'` as a direct `Table` child, guarded by `rows.length === 0 && !isLoading` | Hiding the table; `TableEmptyState` (its `py-128` is too tall for a drawer) |
| Empty nested table, action in the section header | `EmptyState` with title and description only | A second create button in `EmptyStateActions` |
| Field has no value | `Attribute isEmpty` | Hiding the row |
| Viewing an old version | `Alert color='info'` first in `DrawerBody`, with "Back to current" and "Restore" in `AlertControls` | A banner in the header |
| Row open in the drawer | `Table activeRowId={selectedId}` highlights the source row | `className` on the row |
| Action running | `loading` on the `Button` that started it, toast on result. See [Action-result toasts](./feedback-toasts.md) | Closing the drawer before the result |

## Rules

- If a row opens the drawer, pass `onMasterCellClick` and `activeRowId` to the list `Table`. Clicks on the row menu do not open the drawer.
- Keep one `Drawer` mounted for the list. Pass `open` and `onOpenChange`. **Never** mount one `Drawer` per row.
- Keep the last selected entity in state after close. The content must not go blank during the close animation.
- Pass `width` as a number of pixels. `width` is read once when the drawer mounts. Changing it later has no effect.
- If the drawer is resizable, put `DrawerResizeHandle` first in `DrawerContent`. Save the width from `onResizeEnd` if it must persist.
- Put entity actions in one `DropdownMenu` in `DrawerHeader`. The trigger is `<Button variant='outline' color='neutral' size='small'>Actions <ChevronDown /></Button>`.
- Order menu items: edit, state changes, "Go to …" links, then `DropdownMenuSeparator`, then destructive items.
- Use `DropdownMenuItem variant='destructive'` for destructive items. Name the entity: "Delete provider", not "Delete".
- If a destructive item is selected, render the confirmation `Dialog` inside `DrawerContent`. See [Layering](../foundations/layering.md).
- Use `Attribute orientation='horizontal'` in a detail drawer. The default orientation is `vertical`, so always pass it.
- Give every `AttributeLabel` in one drawer the same `width`. Labels then line up across sections.
- If labels are long, raise `width` up to 256. **Never** wrap a label onto two lines.
- If a section needs an explanation, put an `Info` icon in a `Tooltip` after the `Heading` text.
- Use `Heading as='h3'` for section titles. `DrawerTitle` is the drawer's heading.
- If the drawer has tabs below the attributes, keep `Tabs` inside `DrawerBody` so attributes and tabs scroll together.
- Put the tab action inside `TabsList`, in `TabsLineActions`, as `Button size='small'`.
- Put a nested `Table` straight into the section or `TabsContent`. Follow [Entity table](./entity-table.md) for columns and cells.
- **Never** use `TableActionBar` in a drawer. Its z-index sits under the drawer. See [Layering](../foundations/layering.md).
- **Never** add a `DrawerFooter` to a detail drawer. Actions live in the header menu and section headers.
- **Never** use `data-slot` in tests. Pass `data-testid` to `Drawer`; parts derive from it.

There is no `DRAWER_SIZES` export; pass the number. There is no `size` prop on `Drawer`. There is no `DrawerActions` or `DrawerHeaderActions` component; put the menu straight into `DrawerHeader`. There is no `AttributeGroup`, `AttributeList` or `DescriptionList` component. There is no section component with a title and action; compose `HStack`, `Heading` and `Button`. There is no `fullBleed` prop on `TabsList` or `Table`.

## Example

```tsx
import { useState } from 'react';
import {
  Attribute,
  AttributeLabel,
  AttributeValue,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerResizeHandle,
  DrawerTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  EmptyStateDescription,
  EmptyStateMessage,
  EmptyStateTitle,
  FormatDateTime,
  Heading,
  HStack,
  NumericBadge,
  Separator,
  Table,
  type TableColumnDef,
  Tabs,
  TabsContent,
  TabsLineActions,
  TabsList,
  TabsTrigger,
  Tag,
  VStack,
} from '@wallarm-org/design-system';
import { InlineCodeSnippet } from '@wallarm-org/design-system/CodeSnippet';
import { ChevronDown, Plus } from '@wallarm-org/design-system/icons';

interface Rule {
  id: string;
  condition: string;
  grant: string;
}

interface Provider {
  id: string;
  name: string;
  clientId: string;
  defaultRole: string | null;
  createdAt: string;
  rules: Rule[];
}

const ruleColumns: TableColumnDef<Rule>[] = [
  { accessorKey: 'condition', header: 'If', size: 480 },
  {
    accessorKey: 'grant',
    header: 'Then grant',
    size: 160,
    cell: ({ row }) => <Tag>{row.original.grant}</Tag>,
  },
];

const LABEL_WIDTH = 140;

interface ProviderDrawerProps {
  provider: Provider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onCreateRule: () => void;
}

export const ProviderDrawer = ({
  provider,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onCreateRule,
}: ProviderDrawerProps) => {
  const [tab, setTab] = useState('rules');

  return (
    <Drawer open={open} onOpenChange={onOpenChange} width={640} data-testid='provider-drawer'>
      <DrawerContent>
        <DrawerResizeHandle />
        <DrawerHeader>
          <DrawerTitle>{provider?.name}</DrawerTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' color='neutral' size='small'>
                Actions
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={onEdit}>Edit provider</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant='destructive' onSelect={onDelete}>
                Delete provider
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DrawerHeader>

        <DrawerBody>
          <VStack gap={6} className='pb-8'>
            <Attribute orientation='horizontal'>
              <AttributeLabel width={LABEL_WIDTH}>Client ID</AttributeLabel>
              <AttributeValue>
                <InlineCodeSnippet code={provider?.clientId ?? ''} size='md' />
              </AttributeValue>
            </Attribute>
            <Attribute orientation='horizontal'>
              <AttributeLabel width={LABEL_WIDTH}>Client secret</AttributeLabel>
              <AttributeValue>Set — never shown</AttributeValue>
            </Attribute>
            <Attribute orientation='horizontal' isEmpty={!provider?.defaultRole}>
              <AttributeLabel width={LABEL_WIDTH}>Default role</AttributeLabel>
              <AttributeValue>{provider?.defaultRole && <Tag>{provider.defaultRole}</Tag>}</AttributeValue>
            </Attribute>
            <Attribute orientation='horizontal'>
              <AttributeLabel width={LABEL_WIDTH}>Created at</AttributeLabel>
              <AttributeValue>
                <FormatDateTime value={provider?.createdAt} format='datetime' layout='inline' />
              </AttributeValue>
            </Attribute>
          </VStack>

          <Separator spacing={4} />

          <Tabs value={tab} onChange={setTab}>
            <div className='-mx-24'>
              <TabsList>
                <TabsTrigger value='rules'>
                  Rules
                  <NumericBadge>{provider?.rules.length ?? 0}</NumericBadge>
                </TabsTrigger>
                <TabsLineActions>
                  <Button size='small' onClick={onCreateRule}>
                    <Plus />
                    Create rule
                  </Button>
                </TabsLineActions>
              </TabsList>
            </div>
            <TabsContent value='rules'>
              <div className='-mx-8 pt-8'>
                <Table
                  data={provider?.rules ?? []}
                  columns={ruleColumns}
                  getRowId={row => row.id}
                  aria-label='Rules'
                >
                  {provider?.rules.length === 0 && (
                    <EmptyState type='collection-empty'>
                      <EmptyStateMessage>
                        <EmptyStateTitle>No rules yet</EmptyStateTitle>
                        <EmptyStateDescription>
                          Create one to grant a role or a group from a claim this provider sends.
                        </EmptyStateDescription>
                      </EmptyStateMessage>
                    </EmptyState>
                  )}
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
```

A section without tabs. Use it for groups like "Configuration" or "Access decisions".

```tsx
import {
  Attribute,
  AttributeLabel,
  AttributeValue,
  Button,
  Heading,
  HStack,
  Separator,
  VStack,
} from '@wallarm-org/design-system';
import { Plus } from '@wallarm-org/design-system/icons';

export const AccessSection = ({ policy, onCreateRule }: { policy: string; onCreateRule: () => void }) => (
  <>
    <Separator spacing={4} />
    <HStack justify='between' align='center' className='py-8'>
      <Heading as='h3' size='md' weight='medium'>
        Access decisions
      </Heading>
      <Button size='small' onClick={onCreateRule}>
        <Plus />
        Create rule
      </Button>
    </HStack>
    <VStack gap={6} className='pb-8'>
      <Attribute orientation='horizontal'>
        <AttributeLabel width={140}>Sign-in policy</AttributeLabel>
        <AttributeValue>{policy}</AttributeValue>
      </Attribute>
    </VStack>
  </>
);
```

## What your app owns

| Concern | Owner | Recipe with the current API |
| --- | --- | --- |
| Drawer width 700 | App | No 700 preset exists. The presets are 640, 960 and 1130 and are not exported. Pass `width={640}`. Pass `width={700}` only if design confirms it; 700 is inside the 400–1130 limits |
| Full-width tabs inside the body | App | `TabsList` has `px-24` and `DrawerBody` has `px-24`. Wrap `TabsList` in `<div className='-mx-24'>`. Its `className` goes to the inner list and cannot fix this |
| Tabs pinned under the header | App | If tabs must not scroll, use the `Drawer` `WithTabs` story layout: `Tabs asChild` around `DrawerHeader`, `TabsList` and `DrawerBody`. Attributes then live inside each `TabsContent` |
| 16px nested table inset | App | No inset option exists. Wrap the `Table` in `<div className='-mx-8'>`. `className='-mx-8'` on `Table` only shifts it left: its root is `w-full` |
| Section header with title and action | App | No section component exists. Compose `HStack`, `Heading as='h3'` and `Button size='small'` |
| Two-column attribute grid | App | No grid component exists. Use `<div className='grid grid-cols-2 gap-x-8 gap-y-6'>` with one `Attribute` per cell |
| Header actions spacing | DS | `DrawerHeader` puts 12px before the close X. Figma shows 4px. Do not override |
| Opening from a row | App | Store `selectedId`. Pass it to `activeRowId`. Set it in `onMasterCellClick` |
| Width persistence | App | Read the final width from `DrawerResizeHandle` `onResizeEnd` and store it yourself |
| Loading the entity | App | Fetch on open. Pass `loading` to each `Attribute` and `isLoading` to each nested `Table` |
| Version history and restore | App | Render an `Alert color='info'` with your own actions. Disable the actions in the header menu |

## Related

- [Spacing](../foundations/spacing.md)
- [Layering](../foundations/layering.md)
- [Resource list page](./resource-list-page.md)
- [Entity table](./entity-table.md)
- [Create and edit forms](./create-edit-forms.md)
- [Confirmation dialogs](./confirmation-dialogs.md)
- [Action-result toasts](./feedback-toasts.md)
- [Empty states](./empty-states.md)
