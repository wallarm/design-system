# Pagination — usage

> Page-through navigation for a **bounded** dataset — prev/next + numbered pages
> (with automatic ellipsis) and an optional rows-per-page selector. Ark UI
> compound; controlled or uncontrolled. Interactive. **Note: infinite scroll is
> the house default for long data — Pagination is the deliberate alternative.**

## Reach for it when
**Infinite scroll is the default for long datasets** (`Table` ships it) — reach
for **Pagination** as the considered alternative when paged navigation genuinely
helps: a *bounded* set where the user benefits from **knowing and controlling
their position** — "page 3 of 20", jumping to a page, returning to page 2,
choosing rows-per-page (audit logs, endpoint lists scanned page by page). It
pages a collection shown as a `Table` **or** as a grid of cards — composed below
either view, standalone or in a Table footer.

## Don't use it for
- **Long, exploratory, or continuously-growing data — the default case** → use
  `Table`'s infinite scroll + virtualization, not Pagination. "Lots of rows"
  alone is **not** the cue (infinite scroll handles that); reach for Pagination
  only when paged *navigation* — jumping around, a stable position, page-size
  control — genuinely helps.
- **A short set that already fits on one screen** → no pagination at all.
- **Switching views / steps / tabs** → that's `Tabs` or a stepper. Pagination
  moves through *pages of one dataset*, not between different screens.

## Composition
Compound — render only the parts you want, in the order you want, inside
`Pagination` (which owns page + page-size state):
- **`PaginationPageSize`** — rows-per-page picker (a `Select`; pass `options`
  like `[10, 25, 50]`).
- **`PaginationPrevious`** / **`PaginationNext`** — the arrows.
- **`PaginationList`** — numbered page buttons + automatic ellipsis (don't
  hand-build page numbers).

Common shapes: full (page-size + prev + list + next), numbers-only
(`PaginationList`), or prev/next-only.

## Data wiring — client vs server
- **Client-side** (the whole array is already in memory): `const { pageData,
  ...pagination } = useClientPagination(rows, 10)` → spread `{...pagination}` onto
  `<Pagination>` and render `pageData`. It slices + clamps the page for you.
- **Server-side** (fetch each page): drive it controlled — `count` (total) +
  `page`/`onPageChange` + `pageSize`/`onPageSizeChange`; fetch on change, no
  slicing.
- **URL-driven** pages: `type="link"` + `getPageUrl`.

## Locked — don't override
- **The page range + ellipsis are computed** from `siblingCount` /
  `boundaryCount` (both default 1) — tune those, never render your own page
  buttons.
- **No "1–10 of 200" range/total is built in** — if you want a count label, add
  your own `Text` beside the control.
- `size` = `medium` (32) / `small` (24); `align` = left (default) / center /
  right; button + ellipsis styling fixed.
- The page-size control is already a `Select` (`PaginationPageSize`) — don't bolt
  on a second selector.

## Sizing / judgment calls
- **`size`** — `small` (24) in a dense table / dense UI; `medium` (32) otherwise.
- **`align`** — `right` reads well in a table footer; `center` for a standalone
  list.
- **page-size `options`** — offer a sensible few (`[10, 25, 50]`); default page
  size is 10.
- **`siblingCount` / `boundaryCount`** — widen when the page count is very large.

## Pairs with
- `Table` **or a card/grid view of the same collection** — compose `<Pagination>`
  *below* the view (Table does **not** render it); one `useClientPagination` feeds
  both the rows and the control. The pager is identical whether the collection
  renders as a table or as cards.
- `Select` — used internally for the page size; don't add your own.

```tsx
const { pageData, ...pagination } = useClientPagination(rows, 10)
<Table data={pageData} columns={columns} getRowId={r => r.id} />
<Pagination {...pagination} align="right" aria-label="Endpoints">
  <PaginationPageSize options={[10, 25, 50]} />
  <PaginationPrevious /><PaginationList /><PaginationNext />
</Pagination>
```
