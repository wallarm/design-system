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

- **Built on `@ark-ui/react/pagination`** (already a dependency, `5.31.0`, on
  `@zag-js/pagination`). We wrap Ark's primitives exactly like `Tabs` wraps Ark
  Tabs and `Select` wraps Ark Select. Ark owns all state, range math, the
  ellipsis collapsing, disabled-at-bounds logic, and a11y (`<nav>` landmark +
  `aria-current="page"`). **We do not write our own range algorithm.**
- **Data model: Ark-native `count` + `pageSize`.** `count` = total number of data
  *items*; `pageSize` = items per page; Ark derives `totalPages`. This makes the
  "Rows per page" control native (the Select drives Ark's `pageSize`). We do
  **not** invent a `pageCount` wrapper.
- **API style: composition.** The Figma "Type" (Full / Simple / Links only) is
  **not a prop** — it is expressed by *which* sub-components are included.
- **Rows-per-page is a ready-made sub-component** `PaginationPageSize`; it reads
  `pageSize` / `setPageSize` from Ark context, so the consumer only passes
  `options`.
- **Ellipsis is non-interactive** — Ark's `Ellipsis` is a `<div>`, matching Figma
  (disabled look, `opacity-50`), rendered `aria-hidden`.
- **Semantics:** `nav > ul > li > button`. `PaginationList` renders `<ul>`,
  wrapping each Ark item/ellipsis in an `<li>`. Active page → Ark sets
  `aria-current="page"` / `data-selected`.
- **No custom hook export.** Ark already exports `usePagination` /
  `usePaginationContext` for headless use; consumers can import those from the DS
  if needed (re-exported from the barrel).

## Reused building blocks

| Need | Reuse |
|---|---|
| Root state machine, range, ellipsis, a11y | `@ark-ui/react/pagination` (`Pagination.Root`, `PrevTrigger`, `NextTrigger`, `Item`, `Ellipsis`, `Context`) |
| Previous / Next buttons | Ark trigger `asChild` → `Button` (`variant="ghost"`, `color="neutral"`) + `ArrowLeft`/`ArrowRight` |
| Page number buttons | styled Ark `Item` (`<button>`), toggle-button visual via CVA, active via `data-[selected]` |
| Rows-per-page select | `Select` (small) + `Separator` divider, wired to Ark `pageSize` |
| Ellipsis glyph | styled Ark `Ellipsis` (`<div>`) + `Ellipsis` icon from `../../icons` |

Size mapping: Pagination `medium` → `ButtonBase` `medium` (32px); Pagination
`small` → `ButtonBase` `small` (24px). Page-number squares: 32px medium / 24px small.

## Exported API

```
Pagination            // wraps Ark Pagination.Root (<nav>), size/align context, TestIdProvider
PaginationPageSize    // "Rows per page" label + Select + Separator, wired to Ark pageSize
PaginationPrevious    // Ark PrevTrigger asChild -> Button + ArrowLeft
PaginationList        // <ul>; maps Ark api.pages -> li > PaginationItem / PaginationEllipsis
PaginationItem        // styled Ark Item (<button>); active via data-selected
PaginationEllipsis    // styled Ark Ellipsis (<div>), non-interactive
PaginationNext        // Ark NextTrigger asChild -> Button + ArrowRight
```

Re-export Ark's `usePagination` / `usePaginationContext` (+ detail types
`PaginationPageChangeDetails`, `PaginationPageSizeChangeDetails`) from the DS
barrel for headless use. All component Props types are exported alongside their
component. Everything re-exported from `packages/design-system/src/index.ts`.

### `Pagination` props

Ark-native (forwarded to `Pagination.Root`):
- `count?: number` — total data items.
- `pageSize?` / `defaultPageSize?` (Ark default `10`).
- `page?` / `defaultPage?` (Ark default `1`).
- `siblingCount?` (default `1`), `boundaryCount?` (default `1`).
- `onPageChange?: (details: { page: number; pageSize: number }) => void`.
- `onPageSizeChange?: (details: { pageSize: number }) => void`.
- `type?: 'button' | 'link'` (default `'button'`) + `getPageUrl?` — link pagination.

DS-specific:
- `size?: 'medium' | 'small'` (default `'medium'`) — provided via context to children.
- `align?: 'left' | 'center' | 'right'` (default `'left'`) — `justify-*` on the nav row.
- `'aria-label'?: string` (default `'Pagination'`) → Ark `translations.rootLabel`.
- `+ TestableProps`, `ref?: Ref<HTMLElement>`.

### Context

`PaginationContext` (ours) carries `{ size }`. Sub-components read it via
`usePaginationSizeContext()` to pick the matching `ButtonBase` size. Pattern
mirrors `TabsSharedContext`. (Distinct from Ark's `usePaginationContext`, which
carries the pagination state/`pages`.)

### Sub-component behaviour (all forward `...rest` to the real interactive node)

- `PaginationPrevious` / `PaginationNext`: `{ children?; ...buttonProps }`. Wrap
  Ark `PrevTrigger` / `NextTrigger` with `asChild`, child is `Button`
  ghost/neutral with leading/trailing arrow. Default label "Previous"/"Next"
  (overridable via children). Ark applies `disabled` at the bounds automatically.
- `PaginationList`: `{ children?: (page, api) => ReactNode }`. Renders `<ul>` flex
  row, `gap-2`. Default: uses Ark `Pagination.Context` to map `api.pages` — for
  each entry render `<li>` containing `PaginationItem` (`type:'page'`) or
  `PaginationEllipsis` (`type:'ellipsis'`). Optional render-prop overrides the
  mapping.
- `PaginationItem`: `{ value: number; ...buttonProps }` → styled Ark `Item`
  (fixed square 32px medium / 24px small). Active state via `data-[selected]`
  (Ark also sets `aria-current="page"`). Visual matches ToggleButton ghost/neutral.
- `PaginationEllipsis`: `{ index: number }` → styled Ark `Ellipsis` (`<div>`),
  square, `opacity-50`, `aria-hidden`, contains `Ellipsis` icon. Non-interactive.
- `PaginationPageSize`: `{ options: number[]; label?: string; ...rest }`. Reads
  `pageSize` + `setPageSize` from Ark `usePaginationContext`. Renders `label`
  (default "Rows per page") + `Select` (small) bound to `pageSize` + vertical
  `Separator`. Placed first inside `Pagination`.

## Usage (the three Figma types)

```tsx
const [page, setPage] = useState(1);

// FULL
<Pagination
  count={120}
  pageSize={10}
  page={page}
  siblingCount={1}
  align="center"
  aria-label="Search results"
  onPageChange={({ page }) => setPage(page)}
>
  <PaginationPrevious />
  <PaginationList />
  <PaginationNext />
</Pagination>

// SIMPLE  -> <PaginationList /> (page numbers only)
// LINKS ONLY -> <PaginationPrevious /> + <PaginationNext /> (prev/next links only)

// WITH ROWS-PER-PAGE
<Pagination count={120} defaultPageSize={25} onPageChange={...}>
  <PaginationPageSize options={[10, 25, 50]} />
  <PaginationPrevious />
  <PaginationList />
  <PaginationNext />
</Pagination>
```

## Files

```
packages/design-system/src/components/Pagination/
  Pagination.tsx
  PaginationContext.tsx        // DS size context + usePaginationSizeContext
  PaginationList.tsx
  PaginationItem.tsx
  PaginationEllipsis.tsx
  PaginationPrevious.tsx
  PaginationNext.tsx
  PaginationPageSize.tsx
  classes.ts                   // CVA: item (square + active), ellipsis, root align
  types.ts                     // PaginationSize, PaginationAlign
  index.ts
  Pagination.stories.tsx
  Pagination.test.tsx
  Pagination.e2e.ts
```
Plus barrel export block added to `packages/design-system/src/index.ts`.

## Storybook stories

`satisfies Meta<typeof Pagination>`, imports from `storybook-react-rsbuild`.

- `Full` — prev + numbers + next (medium)
- `Simple` — page numbers only
- `LinksOnly` — prev + next links only
- `WithPageSize` — full bar incl. Rows-per-page
- `Sizes` — medium vs small side by side
- `Alignment` — left / center / right
- `ManyPages` — large `count` to show ellipsis collapsing
- `Playground` — controlled via `useState` (`page` + `onPageChange`)

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

Composition satisfies the contract natively: each interactive sub-component
spreads `{...rest}` onto its real interactive DOM node (the `<button>` rendered by
Ark `Item` / `PrevTrigger` / `NextTrigger`, reused via `Button`), so consumer
`data-analytics-id` / `data-analytics-props` land on the correct target with no
analytics-specific DS props. `PaginationList` / `Pagination` / `PaginationEllipsis`
are wrappers and forward their attrs to their own (non-interactive) nodes.

## Testing

- **Unit (`Pagination.test.tsx`)**: renders correct page items + ellipsis for a
  given `count`/`pageSize`/`siblingCount`; `aria-current` on active item;
  prev/next disabled at bounds; `onPageChange` fires with the right page;
  `PaginationPageSize` changes `pageSize` and fires `onPageSizeChange`; size
  context propagation; testid cascade; props forwarding to DOM (analytics attrs).
- **E2E (`Pagination.e2e.ts`)**: per `docs/e2e-test-rules.md` — Screenshot
  (Full/Simple/LinksOnly/WithPageSize × medium/small × alignments), Interaction
  (click page, prev/next, disabled bounds, page-size change), Accessibility.

## Out of scope

- No remote/data-fetching integration.
- No URL/query-string syncing (beyond Ark's `type="link"` + `getPageUrl` passthrough).
