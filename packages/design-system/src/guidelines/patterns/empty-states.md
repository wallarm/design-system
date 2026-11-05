---
title: Empty states
description: Use when a table, nested table, tab, section, column or menu has no content and you must pick the EmptyState scale, copy and action.
components: [EmptyState, EmptyStateIllustration, EmptyStateMessage, EmptyStateTitle, EmptyStateDescription, EmptyStateActions, EmptyStateLink, TableEmptyState, Table, SelectEmptyState, FilterDropdownEmpty, FilterCascadeEmpty, Tabs, Button]
keywords: [empty state, empty, no data, no results, nothing found, zero state, blank slate, no items yet, nothing yet, first use, onboarding, empty table, empty tab, empty column, empty list, dependency, select first, reset filters, caught up, placeholder]
order: 90
---

# Empty states

An empty state is `EmptyState` placed where the content would be. The header around it stays.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| A page table with no rows | `TableEmptyState` › `EmptyState type='collection-empty'` | Hiding `PageHeader` or `PageToolbar` |
| A table in a drawer or section with no rows | `EmptyState type='collection-empty'` as a direct `Table` child | `TableEmptyState` (its `py-128` is too tall) |
| Search or filters matched nothing | `EmptyState type='collection-empty'` with a reset action | A create action |
| An earlier choice is missing ("Select a service first") | `EmptyState type='collection-empty'` with no actions | Disabling the whole section silently |
| A tab or popover panel with nothing in it | `EmptyState type='collection-empty'` inside the `TabsContent` | Hiding the tab |
| A card, kanban column or chart with no data | `EmptyState type='no-results'` | The medallion and a pixel title |
| A `Select` with no options | Nothing. `SelectContent` renders `SelectEmptyState` when it has no children | A hand-built "No results" row |
| A `FilterDropdown` search with no matches | `FilterDropdownEmpty` | `EmptyState` |
| A `FilterCascade` search with no matches | Nothing. `FilterCascadeLevel` renders `FilterCascadeEmpty` | `EmptyState` |
| One missing value in a cell or attribute | The em dash `'—'`. See [Entity table](./entity-table.md) | `EmptyState` |

`type` sets the scale, not the cause. If the empty area fills a page, table or panel, use `collection-empty`. If it sits inside a small container, use `no-results`.

## Anatomy

| # | Part | Component | Required |
| --- | --- | --- | --- |
| 1 | Root, sets the scale | `EmptyState` (`type` `'collection-empty'` default, or `'no-results'`) | Yes |
| 2 | Icon tile (medallion) | `EmptyStateIllustration` holding one icon from `@wallarm-org/design-system/icons` | `collection-empty` only |
| 3 | Text block | `EmptyStateMessage` | Yes |
| 4 | Title | `EmptyStateTitle` | Yes, except in a chart card |
| 5 | One or two sentences | `EmptyStateDescription` | Yes for `collection-empty` |
| 6 | Buttons | `EmptyStateActions` holding `Button size='medium'` | Reset filters; create only when no header has a create button |
| 7 | Learn-more link | `EmptyStateLink` | Optional |
| 8 | Table wrapper | `TableEmptyState` as a child of `Table` | Page tables only |

Import all parts from `@wallarm-org/design-system`. Sub-components read `type` from the root. **Never** pass `type` to a sub-component; they have no `type` prop.

`EmptyState` renders `role='status'`. Do not add another live region around it.

## Layout and spacing

Spacing utilities count in pixels: `py-24` is 24px. See [Spacing](../foundations/spacing.md).

### Figma frames

| Context | Figma | Code |
| --- | --- | --- |
| Nested table in a drawer (SSO rules, IAM resources) | 560 × 140 under a 32 header | `EmptyState type='collection-empty'` as a direct `Table` child; the table header stays |
| Notification popover tab | 380 × 140–156 | `EmptyState type='collection-empty'`, no actions |
| Kanban column | 240 × 56, centred | `EmptyState type='no-results'`, title only |
| Page table | Centred under the header | `TableEmptyState` adds `py-128` |

### Built-in spacing

| Component | Classes |
| --- | --- |
| `EmptyState type='collection-empty'` | `flex flex-col items-center text-center m-[0_auto] gap-16 py-24 max-w-[560px] min-w-[256px]` |
| `EmptyState type='no-results'` | `flex flex-col items-center text-center m-[0_auto] gap-8 py-8 w-[240px]` |
| `EmptyStateIllustration` | `size-36 rounded-[15px] p-8 text-xl text-icon-secondary`; the icon is 20 |
| `EmptyStateMessage` | `gap-8` for `collection-empty`, `gap-4` for `no-results` |
| `EmptyStateTitle` | `collection-empty`: `font-pixel text-base leading-base text-text-primary`. `no-results`: `font-sans-display text-sm font-medium text-text-secondary` |
| `EmptyStateDescription` | `Text size='xs' color='secondary' align='center'` (12 / 16) |
| `EmptyStateActions` | `flex items-center justify-center gap-12` |
| `EmptyStateLink` | `Link size='md'` |
| `TableEmptyState` | `py-128`; renders only when the row model is empty and `isLoading` is false |

- If the empty state sits in a page table, wrap it in `TableEmptyState`.
- If the empty state sits in a nested table, render `EmptyState` directly as a `Table` child. Guard it with `data.length === 0 && !isLoading`.
- Leave the icon at its default size. The medallion sizes it to 20 through `text-xl`.
- **Never** add `py-*`, `gap-*` or `w-*` to `EmptyState` or its parts. The scale owns them.
- **Never** wrap `EmptyState` in a `Card` or a bordered box to make it look framed.
- **Never** place a bare icon. An illustration always sits in `EmptyStateIllustration`.

There is no `size` prop on `EmptyState`. There is no `variant` prop. There is no `icon`, `title` or `action` prop; compose the sub-components. There is no `className` prop on `TableEmptyState`. There is no unframed illustration.

## States

| Cause | Scale | Title | Description | Action |
| --- | --- | --- | --- | --- |
| Nothing created yet, page table | `collection-empty` | "No {items} yet" | What creating one does | None. `PageActions` keeps the create button |
| Nothing created yet, nested table or section | `collection-empty` | "No rules yet" | "Create one to grant a role or a group from a claim this provider sends." | None. The section header keeps the create button |
| Search or filters matched nothing | `collection-empty` | "No results found" | "Try resetting your search or filters." | `Button variant='outline' color='neutral'` "Reset filters" |
| Earlier choice missing | `collection-empty` | "Select a service first" | "Choose a service to pick its operations." | None |
| Tab with nothing new | `collection-empty` | "You're all caught up" | "No new notifications." | None |
| Tab with nothing read | `collection-empty` | "Nothing read yet" | "Notifications you've read will show up here." | None |
| Kanban column or card with no items | `no-results` | "Nothing runs here yet" | Omit | None |
| Chart card with no data | `no-results` | Omit | "No data found for selected period" | None |
| Loading | None | None | None | `Table isLoading` shows skeleton rows |

- If data is loading, do not render an empty state. `TableEmptyState` already hides while `isLoading` is true.
- If a dependency is missing, say which choice unlocks the section. Do not say "No {items} yet".
- If the same section can be dependency-empty or nothing-yet, switch the copy. Figma marks these as different states.
- If each tab can be empty, write copy per tab. **Never** reuse one generic sentence across tabs.

## Rules

- Write the title as a short statement: "No rules yet". **Never** write an accusation: "You have no rules".
- Keep the description to one or two sentences. Say what the user gets, or what unlocks the area.
- Show one create action per screen. If `PageActions` or a section header has the create button, the empty state has no button.
- If no header has a create button, put `Button size='medium'` in `EmptyStateActions`.
- **Never** offer a create action when search or filters matched nothing. Offer "Reset filters" in `variant='outline' color='neutral'`.
- Pick an icon that names the entity: `Users` for users, `Shapes` for rules, `CheckCheck` for caught up, `History` for read.
- Keep `PageHeader`, `PageToolbar`, section headers and table column headers visible when empty.
- Use `type='no-results'` only inside small containers: cards, kanban columns, menus.
- **Never** render `EmptyState` inside `SelectContent`. `SelectContent` renders `SelectEmptyState` when it has no children.
- **Never** render `EmptyState` inside `FilterDropdownContent` or `FilterCascade`. Use `FilterDropdownEmpty`; `FilterCascadeLevel` renders `FilterCascadeEmpty` itself.
- **Never** use an `Alert` or a toast to say a list is empty.

## Example

```tsx
import {
  Button,
  createTableColumnHelper,
  EmptyState,
  EmptyStateDescription,
  EmptyStateIllustration,
  EmptyStateMessage,
  EmptyStateTitle,
  Table,
  type TableColumnDef,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from '@wallarm-org/design-system';
import { CheckCheck, History, Plus, Shapes } from '@wallarm-org/design-system/icons';

interface Rule {
  id: string;
  condition: string;
  grant: string;
}

const columnHelper = createTableColumnHelper<Rule>();

const columns: TableColumnDef<Rule>[] = [
  columnHelper.accessor('condition', { header: 'If', size: 480 }),
  columnHelper.accessor('grant', { header: 'Then grant', size: 160 }),
];

interface RulesSectionProps {
  rules: Rule[];
  isLoading: boolean;
  onCreate: () => void;
}

// Nested table in a drawer: the section header owns the create action.
export const RulesSection = ({ rules, isLoading, onCreate }: RulesSectionProps) => (
  <section className='flex flex-col gap-12'>
    <div className='flex items-center justify-between'>
      <Text size='lg' weight='medium'>
        Rules
      </Text>
      <Button size='small' onClick={onCreate}>
        <Plus />
        Create rule
      </Button>
    </div>
    <Table aria-label='Rules' data={rules} columns={columns} getRowId={row => row.id} isLoading={isLoading}>
      {rules.length === 0 && !isLoading && (
        <EmptyState type='collection-empty'>
          <EmptyStateIllustration>
            <Shapes />
          </EmptyStateIllustration>
          <EmptyStateMessage>
            <EmptyStateTitle>No rules yet</EmptyStateTitle>
            <EmptyStateDescription>
              Create one to grant a role or a group from a claim this provider sends.
            </EmptyStateDescription>
          </EmptyStateMessage>
        </EmptyState>
      )}
    </Table>
  </section>
);

interface NotificationTabsProps {
  unreadCount: number;
  readCount: number;
}

// Per-tab copy: each tab says why it is empty.
export const NotificationTabs = ({ unreadCount, readCount }: NotificationTabsProps) => (
  <Tabs defaultValue='new'>
    <TabsList>
      <TabsTrigger value='new'>New</TabsTrigger>
      <TabsTrigger value='read'>Read</TabsTrigger>
    </TabsList>
    <TabsContent value='new'>
      {unreadCount === 0 && (
        <EmptyState type='collection-empty'>
          <EmptyStateIllustration>
            <CheckCheck />
          </EmptyStateIllustration>
          <EmptyStateMessage>
            <EmptyStateTitle>You're all caught up</EmptyStateTitle>
            <EmptyStateDescription>No new notifications.</EmptyStateDescription>
          </EmptyStateMessage>
        </EmptyState>
      )}
    </TabsContent>
    <TabsContent value='read'>
      {readCount === 0 && (
        <EmptyState type='collection-empty'>
          <EmptyStateIllustration>
            <History />
          </EmptyStateIllustration>
          <EmptyStateMessage>
            <EmptyStateTitle>Nothing read yet</EmptyStateTitle>
            <EmptyStateDescription>Notifications you've read will show up here.</EmptyStateDescription>
          </EmptyStateMessage>
        </EmptyState>
      )}
    </TabsContent>
  </Tabs>
);

// Small container: compact scale, title only.
export const PhaseColumnEmpty = () => (
  <EmptyState type='no-results'>
    <EmptyStateMessage>
      <EmptyStateTitle>Nothing runs here yet</EmptyStateTitle>
    </EmptyStateMessage>
  </EmptyState>
);
```

For the page-table version with "Reset filters", see [Resource list page](./resource-list-page.md).

## What your app owns

| Concern | Owner | Recipe with the current API |
| --- | --- | --- |
| Deciding the cause | App | Pass a flag for nothing-yet, filtered, or dependency-missing. The DS cannot tell them apart |
| Copy per entity and per tab | App | Write the title and description for each place. There are no default strings on `EmptyState` |
| Compact table empty state | App | `TableEmptyState` has a fixed `py-128` and no `className`. In drawers and sections render `EmptyState` directly in `Table` and guard it with `data.length === 0 && !isLoading` |
| Dependency gating | App | Render the dependency-empty state until the earlier field has a value. See [Create and edit forms](./create-edit-forms.md) |
| Error state | App | No error variant exists. Render your own message; do not reuse `EmptyState` for a failed request |
| Notification center | App | No popover block exists. Compose `Popover`, `Tabs` and `EmptyState` |
| Kanban column | App | No kanban component exists. Place `EmptyState type='no-results'` centred in your column |
| Figma update note | Design | Figma notes "+ to update empty state component". Follow the code scale until the component changes |

## Related

- [Resource list page](./resource-list-page.md)
- [Entity table](./entity-table.md)
- [Detail drawer](./detail-drawer.md)
- [Create and edit forms](./create-edit-forms.md)
- [Filtering](./filtering.md)
- [Spacing](../foundations/spacing.md)
- [Typography](../foundations/typography.md)
