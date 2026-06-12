# Table — usage

<!-- TODO(designer): this file currently covers ONLY the bulk action bar (TableActionBar).
     The rest of Table — columns, sorting, density, row selection, infinite scroll — still
     needs a full pass. -->

> Data table. This sheet covers the **bulk action bar** that appears when rows are selected; the same pattern outside a table is `Selection`.

## Bulk actions on selected rows → use `TableActionBar`
When rows are selectable and the user needs to act on the selection (delete, export, move…), render `TableActionBar`. It's wired to the table's row-selection state and shows the same floating "N selected · Select all · Clear" bar as `Selection` — don't hand-roll a selected-rows toolbar.

## Don't use it for
- Per-row actions → put inline buttons or a row menu in the row; the bar is for actions on the *selection*.
- Filters, column controls, or view toggles → those belong in the table toolbar/header, not the action bar.

## Locked — don't override
- The bar surface, the summary row, and the show/hide animation are automatic — you only pass action buttons.
- Never use the red `destructive` Button color in the bar — even Delete uses `brand` with a `Trash2` icon, not red.
- Actions stay on one line.

## Sizing / judgment calls
- Action buttons are `large` and always carry a text label. Secondary actions: `variant="ghost"` `color="neutral-alt"`. Emphasize at most one as `color="brand"` with a leading icon (usually Delete); never red. No hard cap on count — one centered line, no wrap.

## Pairs with
- `Button` — the actions inside `TableActionBar`.
- `Selection` — the same bulk-bar pattern for card/list layouts outside a table.

  ```tsx
  <TableActionBar>
    <Button variant="ghost" color="neutral-alt"><Download /> Export</Button>
    <Button color="brand"><Trash2 /> Delete</Button>
  </TableActionBar>
  ```
