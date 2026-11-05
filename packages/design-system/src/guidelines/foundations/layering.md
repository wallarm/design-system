---
title: Layering
description: Use when an overlay must paint above another one, or when you consider adding a z-index class to app code.
components: [Drawer, Dialog, DropdownMenu, Select, Popover, Calendar, FilterCascade, Tooltip, Toaster, SearchModal, Tour, SelectionBulkBar, TableActionBar, FeedbackPulse, CodeSnippetRoot, Table, PageHeader]
keywords: [z-index, z, stacking, layer, layer-index, portal, overlay, modal, nested drawer, dialog over drawer, dropdown in dialog, tooltip above, toast above, sticky header, popper]
order: 50
---

# Layering

Overlay components compute their own z-index from the overlay's nesting depth. App code never sets z-index on a design-system overlay.

## What you use

You use nothing. Each overlay reads its z-index from CSS variables in `@wallarm-org/design-system/theme`.

| Need | Use | Not |
| --- | --- | --- |
| A panel over the page | `Drawer` | A `fixed` div with `z-50` |
| A modal over the page or over a drawer | `Dialog` from `@wallarm-org/design-system/Dialog` | A second `Drawer` styled as a modal |
| A menu, select, popover or date picker inside a drawer or dialog | `DropdownMenu`, `Select`, `Popover`, `Calendar`, `FilterCascade` as-is | A `z-[100]` class on the content |
| A hint above everything | `Tooltip` | A `Popover` with a raised z-index |
| A notification above every drawer and dialog | `useToast()` plus one `Toaster` | A `Drawer` without overlay |
| A sticky page header | `PageHeader` with `sticky` | `sticky top-0 z-50` in app code |

There is no z-index token scale. There is no `z-overlay`, `z-modal`, `z-popover` or `z-toast` utility. The only layering variables are listed under Reference.

`Dialog` is not exported from the package root `@wallarm-org/design-system`. Import it from `@wallarm-org/design-system/Dialog`.

## How it works

1. Every overlay content renders in a portal. The portal target is the end of `document.body`.
2. Zag's layer stack gives each open layer an index. It writes the index as `--layer-index` on the layer node. The first open layer gets 0.
3. `Drawer`, `Dialog`, `DropdownMenu`, `Select`, `Popover`, `Calendar` and `FilterCascade` share one stack. Each one computes its z-index with the same formula.
4. The positioner gets `50 + layer-index * 20`. The backdrop gets `40 + layer-index * 20`.
5. Menu, select, popover, calendar and cascade contents copy their computed z-index onto the popper positioner. They re-copy it when `--layer-index` changes.
6. `Tooltip` never joins the layer stack. It uses a fixed top tier, `--tooltip-z-index` (1000).
7. The `Toaster` region uses a fixed tier, `--toast-z-index` (900). Toasts paint above every realistic drawer stack and below tooltips.

Example: a `Drawer` (layer 0) holds a `DropdownMenu` (layer 1). The drawer positioner is at 50. The menu positioner is at 70. A `Dialog` opened from that drawer is layer 1, so its backdrop is at 60 and its positioner at 70.

## Rules

- If an overlay opens from inside another overlay, render it as a React child of the parent's content. Nesting depth comes from the React tree and the zag stack.
- If you open a `Dialog` from a `Drawer`, put the `Dialog` inside `DrawerContent`. Only a React-ancestor drawer or dialog can dismiss the nested one.
- If you nest a `Drawer` in a `Drawer`, the parent drawer scales back. If you nest a `Dialog` in a `Dialog`, the parent dialog scales back. A `Dialog` over a `Drawer` does not scale the drawer.
- If a dropdown, select, popover or calendar sits in a drawer or dialog, use the component as-is. It already paints above its host.
- If a tooltip trigger sits in any overlay, use `Tooltip` as-is. It paints above every drawer, dialog and toast.
- **Never** add a `z-*` class or a `style={{ zIndex }}` to `DrawerContent`, `DropdownMenuContent`, `SelectPositioner`, `PopoverContent`, `CalendarContent` or `TooltipContent`.
- **Never** override `--drawer-overlay-z-index`, `--drawer-positioner-z-index`, `--tooltip-z-index` or `--toast-z-index` in app CSS.
- **Never** wrap an overlay trigger in an element with `transform`, `filter` or `isolation: isolate` to fix stacking. Overlay content is portaled, so the wrapper has no effect on it.
- **Never** open `SearchModal` from inside a `Drawer` or `Dialog`. Its positioner has a fixed z-index of 41, but its own backdrop follows layer depth. Opened at layer 1, the backdrop is at 60 and the parent drawer positioner at 50, so both cover the search box.
- **Never** start a `Tour` while a `Drawer` or `Dialog` is open. The tour positioner, content and spotlight use a fixed `z-50`. A drawer or dialog positioner is at 50 or higher, so it ties with or covers the tour.
- **Never** show `TableActionBar` for a table inside a `Drawer` or `Dialog`. Its positioner has a fixed z-index of 50. A drawer positioner is at 50 or higher, so it ties with or covers the bar. Put bulk actions in `DrawerFooter` or `DialogFooter` instead.
- If your app has its own fixed element, such as a chat widget, keep its z-index below 40. A value of 40 or higher paints over the drawer backdrop.
- If your app has its own sticky element inside a scroll area, use `z-10`. `PageHeader`, sticky `DropdownMenu` group labels and pinned table body cells use `z-10`.

## Example

```tsx
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@wallarm-org/design-system';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@wallarm-org/design-system/Dialog';

export const RuleDrawer = () => (
  <Drawer>
    <DrawerTrigger asChild>
      <Button variant='outline' color='neutral'>
        Open rule
      </Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Rule</DrawerTitle>
      </DrawerHeader>
      <DrawerBody>
        {/* Layer 1: paints above the drawer with no z-index class. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' color='neutral'>
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DrawerBody>
      <DrawerFooter>
        {/* Layer 1: the dialog is a React child of DrawerContent. */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant='primary' color='brand'>
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete rule?</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='ghost' color='neutral'>
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
);
```

## Reference

### Layering variables

| Variable | Value | Defined in | Used by |
| --- | --- | --- | --- |
| `--drawer-overlay-z-index` | `40` | `theme/components/drawer.css` | Drawer and Dialog backdrop, CodeSnippet fullscreen backdrop, SearchModal |
| `--drawer-positioner-z-index` | `50` | `theme/components/drawer.css` | Drawer and Dialog positioner, menus, selects, popovers, calendars, cascades, CodeSnippet fullscreen |
| `--drawer-level-ratio` | `calc(40 / 2)` = `20` | `theme/components/drawer.css` | Step per nesting level |
| `--toast-z-index` | `900` | `theme/components/toast.css` | `Toaster` region |
| `--tooltip-z-index` | `1000` | `theme/components/tooltip.css` | `Tooltip`, Metric sparkline popover, CodeEditor diagnostics tooltip |

### Computed values by depth

| Layer index | Backdrop | Positioner, menu, select, popover |
| --- | --- | --- |
| 0 | 40 | 50 |
| 1 | 60 | 70 |
| 2 | 80 | 90 |
| 3 | 100 | 110 |

### Fixed overlay z-index values

These overlays do not follow layer depth.

| Component | Element | z-index | Portaled |
| --- | --- | --- | --- |
| `Tooltip` | content | 1000 | Yes |
| `Toaster` | region | 900 | Yes |
| `SelectionBulkBar` | bar | 200 | Yes, when `placement='floating'` |
| `TableActionBar` | positioner | 50 | Yes |
| `Tour` | dialog positioner, content, spotlight | 50 | Yes |
| `FeedbackPulse` | panel | 50 | Yes |
| `SearchModal` | positioner | 41 | Yes |

### In-flow z-index values

These values order elements inside one component. They do not compete with overlays.

| Value | Where |
| --- | --- |
| `z-50` | AppShell expand and reveal overlays, Table column resize handle |
| `z-40` | Table pinned header cell |
| `z-30` | Table header, Table settings menu, ScrollArea scrollbar, CodeSnippet actions, LineChart zoom cursor popover, FilterInput chips |
| `z-[21]`, `zIndex: 20` | Table sticky group parent row |
| `z-20` | CodeSnippet gutter, FilterInput insertion gap |
| `z-10` | PageHeader `sticky`, DropdownMenu sticky group label, Table pinned body cell, InlineEdit actions, InputOTP, Resizable, Tabs scroll button, NavPanel header |
| `z-1`, `z-[1]` | Resize handles, SegmentedTabs trigger, Chat, Table drop indicator |

### What does not exist

- There is no z-index token scale and no named `z-*` utility.
- There is no `zIndex` prop on any overlay component.
- There is no `portal={false}` or container prop on `Drawer`, `Dialog`, `DropdownMenu`, `Select`, `Popover` or `Tooltip`.
- There is no `Overlay` export for app code. The backdrop comes from `Drawer` and `Dialog` when `overlay` is `true`.
