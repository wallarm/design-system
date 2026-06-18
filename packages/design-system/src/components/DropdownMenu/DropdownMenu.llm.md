# DropdownMenu — usage

> A floating menu of **commands/actions** opened from a trigger. Compound, built on Ark UI — portaled, auto-positioned, and self-scrolling. Interactive.

## Reach for it when
You need a menu of **actions, commands, or settings** hung off a control: a button's menu, a row's "⋯" overflow, a right-click context menu, or view/option toggles that apply immediately (column visibility, view mode, text style). Reach for it instead of hand-rolling a positioned list — it owns the portal, placement, open/close, keyboard nav, and scrolling. It's **trigger-agnostic**: the default trigger is an `outline`/`neutral` `Button` (or an icon button for "⋯"), but it equally takes right-click (`DropdownMenuContextTrigger`), any element (`DropdownMenuTrigger asChild`), or a virtual point with no trigger element (`anchorPoint`).

## Don't use it for
- Picking a **value for a form field** → `Select`. The menu *runs* things; a `Select` *holds* a value and shows it in its trigger. (A menu may still nest a value-pick — a radio-group or a submenu with the current option checked, like a Language picker inside an account menu — that's a setting applied in place, not a form field.)
- A panel of **arbitrary custom UI** (a form, filters, a mini-dashboard) → `Popover`, escalating to `Dialog` / `Drawer` by weight. DropdownMenu is for *lists of menu items*, not freeform content.
- The **single primary action** of a view → a `Button`; don't bury what should stay visible.
- One main action **+ its variants** → `SplitButton`.

## Locked — don't override
- **Item intent is the `variant`, never hand-styling** — `destructive` for Delete / Log out, `brand` to emphasize one key item; everything else `default`. Items fire **`onSelect`, not `onClick`**.
- **Portal, positioning, and scrolling are automatic** — opens `bottom-start` (submenus `right-start`), portals out, scrolls when long. Don't cap its height or wrap it in your own scroller.
- **No size system yet** — one width (min 128); don't set menu sizes/widths. *(design-TBD — don't invent one)*
- **`closeOnSelect` differs by item** — an action closes the menu; a `DropdownMenuCheckboxItem` stays open so you can toggle several. Don't override it.

## Composition
Assemble from the shipped parts — don't hand-roll equivalents:
- **Items** — `DropdownMenuItem`; add a leading `DropdownMenuItemIcon`, a two-line `DropdownMenuItemContent` (`…Text` + `…Description`), or a trailing `DropdownMenuShortcut` (a slot — put a `Kbd` / `KbdGroup` inside it).
- **Selection** — `DropdownMenuCheckboxItem` (independent toggles) or `DropdownMenuRadioGroup` + `DropdownMenuRadioItem` (one-of-set).
- **Submenu** — a nested `DropdownMenu` triggered by a `DropdownMenuTriggerItem`.
- **Structure** — `DropdownMenuLabel` (section heading), `DropdownMenuGroup`, `DropdownMenuSeparator`.
- **Search / footer** — `DropdownMenuInput` pins a search box to the top to filter the **menu's own items** (a long list); `DropdownMenuFooter` pins custom per-product content to the bottom (e.g. `Kbd` key hints). A panel of *filter inputs* producing a result set isn't this — that's `Popover`.

## Pairs with
- `Button` — the default trigger (`outline`/`neutral`) via `DropdownMenuTrigger asChild`; an icon button for "⋯" overflow.
- `SplitButton` — its chevron half *is* a DropdownMenu trigger.
- `Kbd` — inside `DropdownMenuShortcut` for shortcut hints.

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" color="neutral">Actions</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onSelect={edit}>Edit</DropdownMenuItem>
    <DropdownMenuItem onSelect={duplicate}>Duplicate</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive" onSelect={remove}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```
