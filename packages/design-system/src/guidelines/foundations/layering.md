---
title: Layering
description: Use when an overlay must paint above another one, or when you consider adding a z-index class to app code.
components: [Drawer, Dialog, DropdownMenu, Select, Popover, Calendar, FilterCascade, Tooltip, Toaster, SearchModal, Tour, SelectionBulkBar, TableActionBar, FeedbackPulse, PageHeader]
keywords: [z-index, z, stacking, layer, portal, overlay, modal, nested drawer, dialog over drawer, dropdown in dialog, tooltip above, toast above, sticky header, popper]
order: 50
---

# Layering

Overlays stack themselves by nesting depth. App code never sets z-index on a design-system overlay.

## What you use

| Need | Use | Not |
| --- | --- | --- |
| A panel over the page | `Drawer` | A `fixed` div with `z-50` |
| A modal over the page or over a drawer | `Dialog` from `@wallarm-org/design-system/Dialog` | A second `Drawer` styled as a modal |
| A menu, select, popover or date picker inside a drawer or dialog | `DropdownMenu`, `Select`, `Popover`, `Calendar`, `FilterCascade` as-is | A `z-[100]` class on the content |
| A hint above everything | `Tooltip` | A `Popover` with a raised z-index |
| A notification above every drawer and dialog | `useToast()` from `@wallarm-org/design-system/Toast`, plus one `Toaster` | A `Drawer` without overlay |
| A sticky page header | `PageHeader` with `sticky` | `sticky top-0 z-50` in app code |
| Bulk actions for a table in a drawer or dialog | Buttons in `DrawerFooter` or `DialogFooter` | `TableActionBar` |

What does not exist:

- No z-index token scale and no `z-overlay`, `z-modal`, `z-popover` or `z-toast` utility.
- No `zIndex` prop on any overlay.
- No `portal={false}` or container prop on `Drawer`, `Dialog`, `DropdownMenu`, `Select`, `Popover` or `Tooltip`.
- No `Overlay` export. The backdrop comes from `Drawer` and `Dialog` when `overlay` is `true`.
- No `Dialog` in the package root. Import it from `@wallarm-org/design-system/Dialog`.

## Rules

- If an overlay opens from inside another overlay, render it as a React child of the parent's content. Depth comes from the React tree.
- If you open a `Dialog` from a `Drawer`, put the `Dialog` inside `DrawerContent`. Only a React-ancestor drawer or dialog dismisses the nested one.
- If you nest a `Drawer` in a `Drawer`, or a `Dialog` in a `Dialog`, expect the parent to scale back. A `Dialog` over a `Drawer` does not scale the drawer.
- If a dropdown, select, popover, calendar or tooltip sits in any overlay, use it as-is. It already paints above its host.
- If your app has its own fixed element (chat widget), keep its z-index below 40. At 40 or higher it paints over the drawer backdrop.
- If your app has its own sticky element inside a scroll area, use `z-10`.
- **Never** add a `z-*` class or `style={{ zIndex }}` to `DrawerContent`, `DropdownMenuContent`, `SelectPositioner`, `PopoverContent`, `CalendarContent` or `TooltipContent`.
- **Never** override `--drawer-overlay-z-index`, `--drawer-positioner-z-index`, `--tooltip-z-index` or `--toast-z-index` in app CSS.
- **Never** wrap an overlay trigger in `transform`, `filter` or `isolation: isolate` to fix stacking. Overlay content is portaled to `document.body`.
- **Never** open `SearchModal` from inside a `Drawer` or `Dialog`. The backdrops cover the search box.
- **Never** start a `Tour` while a `Drawer` or `Dialog` is open. The drawer ties with or covers the tour.
- **Never** show `TableActionBar` for a table inside a `Drawer` or `Dialog`. The drawer ties with or covers the bar.

## Examples

A menu inside a drawer paints above the drawer with no z-index class.

```tsx
<DrawerContent>
  <DrawerBody>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' color='neutral'>Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </DrawerBody>
</DrawerContent>
```

A confirm dialog opened from a drawer is a React child of `DrawerContent`.

```tsx
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@wallarm-org/design-system/Dialog';

<DrawerFooter>
  <Dialog>
    <DialogTrigger asChild>
      <Button variant='primary' color='brand'>Delete</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogTitle>Delete rule?</DialogTitle>
    </DialogContent>
  </Dialog>
</DrawerFooter>
```

An app-owned floating widget stays below the drawer backdrop.

```tsx
<div className='fixed right-16 bottom-16 z-30'>{chat}</div>
```

## Reference

### Depth-based overlays

`Drawer`, `Dialog`, `DropdownMenu`, `Select`, `Popover`, `Calendar` and `FilterCascade`. Each level adds 20.

| Depth | Backdrop | Content |
| --- | --- | --- |
| 0 | 40 | 50 |
| 1 | 60 | 70 |
| 2 | 80 | 90 |
| 3 | 100 | 110 |

### Fixed overlays

| Component | z-index |
| --- | --- |
| `Tooltip` | 1000 |
| `Toaster` | 900 |
| `SelectionBulkBar` (`placement='floating'`) | 200 |
| `TableActionBar`, `Tour`, `FeedbackPulse` | 50 |
| `SearchModal` | 41 |

### Variables

| Variable | Value |
| --- | --- |
| `--drawer-overlay-z-index` | 40 |
| `--drawer-positioner-z-index` | 50 |
| `--toast-z-index` | 900 |
| `--tooltip-z-index` | 1000 |

### In-flow values

In-component only; never competes with overlays.

| Value | Where |
| --- | --- |
| `z-10` | `PageHeader` `sticky`, sticky menu group labels, pinned table body cells |
| `z-30` to `z-40` | Table headers |
