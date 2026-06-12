# Selection — usage

> Compound family that turns a list or grid of items into a multi-select surface: each item gets a checkbox, and an animated bulk-action bar rises from the bottom when one or more items are selected. Interactive.

## Reach for it when
The user needs to act on **many items at once** — select cards/rows and apply a batch action (delete, move, duplicate, export). Whenever you're about to hand-roll checkboxes plus a floating "3 selected" toolbar over a list, grid, or card collection, reach for this instead. Wrap each item in `SelectionItem`, add `SelectionAll` for a header select-all, and `SelectionBulkBar` for the actions.

## Don't use it for
- Single-item or row-hover actions → put inline buttons or a row menu on the item; Selection is for *bulk*.
- A general floating toolbar → the bar only appears with a live "N selected" count; put persistent actions in the `Page` header / `TopHeader`.
- A page's primary create/add actions → those belong in the page header, not the bar.
- Filters, sort, or view toggles → use `FilterInput` or a toolbar; the bar acts *on the selection*, it doesn't change the view.
- Rows inside a `Table` → prefer `TableActionBar` (purpose-built, wired to row selection); `SelectionBulkBar` also works but is mainly for non-table lists, grids, and cards.

## Locked — don't override
- The bar's dark surface, the "N selected · Select all · Clear" summary row, and the slide-in/out animation are automatic — you only supply the action buttons.
- Never use the red `destructive` Button color in the bar — even for Delete. Destructive intent is carried by an icon (e.g. `Trash2`), not by color.
- Actions stay on one line (they don't wrap); the bar is centered at the bottom.
- Selection is controlled — always drive it with `value` + `onChange`.

## Sizing / judgment calls
- `placement` — `floating` (default) for full-page lists; `absolute` only inside a bounded container such as a `Drawer`, so the bar pins to the container instead of the viewport.
- Action buttons are `large` and always carry a text label. Secondary actions: `variant="ghost"` `color="neutral-alt"`. Emphasize **at most one** action as `color="brand"` with a leading icon — pick the single most likely primary action (usually the destructive one, e.g. Delete); if every action is equal or secondary, make them all `ghost`. (Figma `4715:3890`: two ghost + one brand-with-icon.)
- No hard cap on action count — they sit on one centered line and don't wrap.

## Pairs with
- `SelectionItem` — required: wrap every item. `SelectionAll` — optional header select-all checkbox.
- `Button` — the actions you drop into `SelectionBulkBar`.
- `Drawer` — pair with `placement="absolute"` so the bar stays inside the drawer.

  ```tsx
  <Selection items={rows} getItemId={r => r.id} value={sel} onChange={setSel}>
    {rows.map(r => <SelectionItem key={r.id} itemId={r.id}>{/* card */}</SelectionItem>)}
    <SelectionBulkBar>
      <Button variant="ghost" color="neutral-alt"><Copy /> Duplicate</Button>
      <Button color="brand"><Trash2 /> Delete</Button>
    </SelectionBulkBar>
  </Selection>
  ```
