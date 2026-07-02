# BulkBar — usage

> The **bulk-action bar** — the dark "N selected · Select all · Clear" strip that rises when items are selected, holding the batch actions. **There is no `BulkBar` component to import.** It's a shared pattern you reach for through one of two wrappers.

## Reach for it through the right wrapper
- **Rows in a `Table`** → **`TableActionBar`** (purpose-built, wired to the table's row selection). See `Table`.
- **Anything else — a card grid, a list, or any custom selection flow, including inside a `Drawer`** → **`SelectionBulkBar`** (part of the `Selection` family). This is the away-from-table bulk bar. See `Selection`.

`BulkBar/` itself is just the shared summary-row plumbing (`BulkBarSummary` + its `Count` / `SelectAll` / `Clear` / `Separator` parts); it's subpath-only and you don't compose it directly — the two wrappers do.

## The shared rules (both wrappers)
- The **dark surface, the "N selected · Select all · Clear" summary row, and the slide-in/out** are automatic — you only supply the action `Button`s.
- **Never the red `destructive` colour — even for Delete.** Destructive intent is carried by a leading **icon** (e.g. `Trash2`), not colour.
- Actions sit on **one centered line** (they don't wrap); emphasize **at most one** — the single most-likely action, usually the destructive one — as `color='brand'` with a leading icon, the rest `ghost` / `neutral-alt`.
- The bar only appears with a live **"N selected"** count — it's not a general floating toolbar (persistent page actions belong in the page header / `TopHeader`).

## Which wrapper — the tell
- It's inside a `Table` you built with the DS table → `TableActionBar`.
- It's a card / list / grid you select over (page-level or in a `Drawer` / panel) → `SelectionBulkBar` (`placement='floating'`, the default, for a full page; `placement='absolute'` to pin inside a `Drawer`).

## Pairs with
- `Selection` (+ `SelectionItem` / `SelectionAll`) — the home of `SelectionBulkBar`; the detailed guide for the non-table case.
- `Table` (+ `TableActionBar`) — the table case.
- `Button` — the actions you drop in; `Drawer` — the bounded container for `placement='absolute'`.
