# Pagination — Design Spec

**Ticket:** WDS-140
**Date:** 2026-06-19
**Figma:** https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11045-4121

## Goal

Add a `Pagination` component to the design system that lets consumers split large
content into pages. The component must reproduce the Figma design (three types,
two sizes, three alignments, optional "Rows per page" control) and ship with
Storybook stories.

## Design decisions (locked)

- **API style: pure composition.** The root `Pagination` provides context + a
  `<nav>` landmark; the consumer assembles the bar from exported sub-components.
  The Figma "Type" (Full / Simple / Links only) is **not a prop** — it is
  expressed by *which* sub-components are included.
- **Range logic lives in a `usePagination` hook** (controlled + uncontrolled),
  so pure composition stays ergonomic for large page counts. The hook is
  optional; components render fine without it.
- **Rows-per-page is a ready-made sub-component** `PaginationPageSize`, configured
  by props (`value` / `options` / `onChange`) — the consumer drops it in rather
  than hand-assembling `Select` + `Separator` + label.
- **Ellipsis is non-interactive** — matches Figma (disabled look, `opacity-50`),
  rendered as `aria-hidden` decoration.
- **Semantics:** `nav > ul > li > button`. Active page gets `aria-current="page"`.

## Reused building blocks

| Need | Reuse |
|---|---|
| Previous / Next buttons | `Button` (`variant="ghost"`, `color="neutral"`) + `ArrowLeft`/`ArrowRight` icons |
| Page number buttons | `ToggleButton` (`variant="ghost"`, `color="neutral"`, `active`) |
| Rows-per-page select | `Select` (+ `Separator` divider) |
| Ellipsis glyph | `Ellipsis` icon from `../../icons` |

Size mapping: Pagination `medium` → `ButtonBase` `medium` (32px); Pagination
`small` → `ButtonBase` `small` (24px).

## Exported API

```
Pagination            // <nav aria-label>, size/align context, TestIdProvider
PaginationPageSize    // "Rows per page" label + Select + vertical Separator
PaginationPrevious    // ← Previous button
PaginationList        // <ul> wrapper, gap-2
PaginationItem        // page-number <li><button>, active -> aria-current
PaginationEllipsis    // non-interactive "···"
PaginationNext        // Next → button
usePagination         // range/ellipsis hook
```

All component Props types are exported alongside their component. Everything is
re-exported from `packages/design-system/src/index.ts`.

### `Pagination` props

- `size?: 'medium' | 'small'` (default `'medium'`) — provided via context to children.
- `align?: 'left' | 'center' | 'right'` (default `'left'`) — `justify-*` on the nav row.
- `'aria-label'?: string` (default `'Pagination'`).
- `+ TestableProps`, `ref?: Ref<HTMLElement>`, `...HTMLAttributes<HTMLElement>`.

### Context

`PaginationContext` carries `{ size }`. Sub-components read it via a
`usePaginationContext()` hook to pick the matching `ButtonBase` size. Pattern
mirrors `TabsSharedContext`.

### Sub-component props (all forward `...rest` to the real interactive node)

- `PaginationItem`: `{ active?: boolean; disabled?: boolean; onClick?; children }`
  → `<li><ToggleButton .../></li>`; fixed square (32px medium / 24px small);
  `active` → `aria-current="page"` + ToggleButton `active`.
- `PaginationPrevious` / `PaginationNext`: `{ disabled?; onClick?; children? }`
  → `Button` ghost/neutral with leading/trailing arrow. Default label
  "Previous"/"Next" (overridable via children).
- `PaginationEllipsis`: decorative `<li aria-hidden>` square with `Ellipsis`
  icon, `opacity-50`, non-interactive.
- `PaginationList`: `<ul>` flex row, `gap-2`.
- `PaginationPageSize`: `{ value; options: number[]; onChange?; label?: string }`
  → label + `Select` (small) + vertical `Separator`. Placed first inside
  `Pagination`.

### `usePagination`

```ts
usePagination(options: {
  count: number;            // total pages (pageCount)
  page?: number;            // controlled current page (1-based)
  defaultPage?: number;     // uncontrolled initial page (default 1)
  onChange?: (page: number) => void;
  siblingCount?: number;    // pages around current (default 1)
  boundaryCount?: number;   // pages pinned at each end (default 1)
}): {
  page: number;
  setPage: (page: number) => void;
  items: Array<
    | { type: 'page'; value: number; selected: boolean }
    | { type: 'ellipsis'; key: string }
  >;
  isFirst: boolean;         // page === 1
  isLast: boolean;          // page === count
}
```

Range algorithm: always show `boundaryCount` pages at each end, `siblingCount`
pages on each side of the current page, and collapse the gaps into a single
`ellipsis` item. When there is no real gap (≤1 hidden page) render the page
instead of an ellipsis (avoids "1 … 2" type artifacts).

## Usage (the three Figma types)

```tsx
const { items, page, setPage, isFirst, isLast } = usePagination({ count: 12, page, onChange: setPage });

// FULL
<Pagination size="medium" align="center" aria-label="Search results">
  <PaginationPrevious disabled={isFirst} onClick={() => setPage(page - 1)} />
  <PaginationList>
    {items.map((it) =>
      it.type === 'ellipsis' ? (
        <PaginationEllipsis key={it.key} />
      ) : (
        <PaginationItem key={it.value} active={it.selected} onClick={() => setPage(it.value)}>
          {it.value}
        </PaginationItem>
      ),
    )}
  </PaginationList>
  <PaginationNext disabled={isLast} onClick={() => setPage(page + 1)} />
</Pagination>

// SIMPLE  -> only <PaginationPrevious /> + <PaginationNext />
// LINKS ONLY -> only <PaginationList>...</PaginationList>
```

## Files

```
packages/design-system/src/components/Pagination/
  Pagination.tsx
  PaginationContext.tsx
  PaginationList.tsx
  PaginationItem.tsx
  PaginationEllipsis.tsx
  PaginationPrevious.tsx
  PaginationNext.tsx
  PaginationPageSize.tsx
  usePagination.ts
  classes.ts            // CVA variants (item, list, ellipsis, nav align)
  types.ts              // PaginationSize, PaginationAlign, item data types
  index.ts
  Pagination.stories.tsx
  Pagination.test.tsx
  Pagination.e2e.ts
```
Plus barrel export block added to `packages/design-system/src/index.ts`.

## Storybook stories

`satisfies Meta<typeof Pagination>`, imports from `storybook-react-rsbuild`.

- `Full` — prev + numbers + next (medium)
- `Simple` — prev + next only
- `LinksOnly` — numbers only
- `WithPageSize` — full bar incl. Rows-per-page
- `Sizes` — medium vs small side by side
- `Alignment` — left / center / right
- `ManyPages` — count=50 to show ellipsis collapsing
- `Playground` — controlled via `useState` + `usePagination`

## Component rules compliance

- CVA in `classes.ts`; `cn()` for class merge.
- `data-slot` on every root: `pagination`, `pagination-list`, `pagination-item`,
  `pagination-ellipsis`, `pagination-previous`, `pagination-next`,
  `pagination-page-size`.
- `displayName` on every component.
- `ref` prop (React 19), no `forwardRef`.
- TestId cascade: root `TestIdProvider`; sub-components `useTestId('<slot>')`
  with slots `page-size`, `previous`, `list`, `item`, `ellipsis`, `next`.
- No `any`, no inline styles, design tokens only.

## Metrics / analytics-readiness

Pure composition satisfies the contract natively: each interactive sub-component
spreads `{...rest}` onto its real interactive DOM node (the `<button>` inside
`Button` / `ToggleButton`), so consumer `data-analytics-id` /
`data-analytics-props` land on the correct target with no analytics-specific DS
props. `PaginationList` / `Pagination` / `PaginationEllipsis` are wrappers and
forward their attrs to their own (non-interactive) nodes.

## Testing

- **Unit (`Pagination.test.tsx`)**: `usePagination` range math (boundaries,
  ellipsis collapse, controlled/uncontrolled, clamping); `aria-current` on active
  item; size context propagation; testid cascade; props forwarding to DOM.
- **E2E (`Pagination.e2e.ts`)**: per `docs/e2e-test-rules.md` — Screenshot
  (Full/Simple/LinksOnly/WithPageSize × medium/small × alignments), Interaction
  (click page, prev/next, disabled bounds, page-size change), Accessibility.

## Out of scope

- No remote/data-fetching integration.
- No URL/query-string syncing.
