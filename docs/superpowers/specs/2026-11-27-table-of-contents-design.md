# TableOfContents + useScrollSpy — design (WDS-210)

## Intent

A list of the sections on a long page: shows which section the reader is in, jumps to a
section on click. First consumer: reports and artifacts in the agentic prototype. Figma calls
it **ToC progress** (`toc-item`, `toc-progress` on the WADS-Components "ToC progress" page,
plus its Documentation frame) — the design is final; this doc covers what Figma does not.

A reusable `useScrollSpy` hook ships alongside, so the same page logic can later drive
`Tabs` / `SegmentedTabs` (they already take `value: string` / `onChange(value)`).

## Goals

- `TableOfContents` compound component, two views: **Full** and **Minimized**.
- `useScrollSpy` hook, independent of the component.
- Storybook (Overview + stories), unit, a11y, analytics, testid and E2E tests, Code Connect.

## Non-goals

- Level 3+ headings.
- Reading headings from the DOM / auto-building the list. The consumer passes the items.
- Counting numbers. The consumer passes `number`.
- An `items` array API (one-line `items.map(...)` covers it; see Approaches).

## Anti-goals

- The component must not own scroll state. `TableOfContents` never calls `useScrollSpy`.
- No analytics-specific props, no slot-props pockets (metrics contract).
- No new dependencies.

## Approaches

1. **Compound component** — `TableOfContents` + `TableOfContentsItem` children. Each item
   is a real `<a>`, so consumer `data-*` / `aria-*` / `ref` / handlers land on the
   interactive node (metrics contract: exported sub-components are the default seam).
   **Picked.**
2. Data-driven `items={[...]}` — least code, but per-item analytics attributes would need a
   pocket field in the item object, which the metrics contract forbids.
3. Both — extra public API with no second consumer yet.

Minimized-view input on touch / keyboard (ticket's "to define during build") — **option A
picked**: tap on the dashes opens the same popover (tap outside closes it); the dashes are
not focusable, keyboard users reach the expand button and switch to Full. Rejected: B
(hover only — useless on phones), C (also focus-opens the popover — focus management cost
with no current need).

## Public API

### `TableOfContents`

```tsx
<TableOfContents
  value={activeId}              // string | undefined — the active item's value
  onValueChange={scrollTo}      // (value: string) => void — fired on item click
  view="full"                   // 'full' | 'minimized' — controlled view (optional)
  defaultView="full"            // uncontrolled initial view; default 'full'
  onViewChange={setView}        // (view) => void
  title="On this page"          // header label in Full; default 'On this page'
  data-testid="report-toc"
>
  <TableOfContentsItem value="tldr">TL;DR</TableOfContentsItem>
  <TableOfContentsItem value="findings" number="1">Findings</TableOfContentsItem>
  <TableOfContentsItem value="critical" number="1.1" level={2}>Critical</TableOfContentsItem>
</TableOfContents>
```

- The collapse/expand button is always rendered (per the ticket: "the button in the corner
  switches Full and Minimized"). No built-in breakpoint: the page decides the view
  (`view` + `onViewChange`, or `defaultView`). A "no toggle" option is out of scope until a
  consumer asks. *(Builder-check call)*
- Root renders `<nav aria-label={title}>` with `data-slot="table-of-contents"`, `ref`,
  rest props spread on the `nav`. View uses `useControlled` (`src/hooks/useControlled.ts`).
- `value` is controlled only — the page owns the active section. No `defaultValue`.
- The list is a `<ul>`; each item an `<li>` holding the link.

### `TableOfContentsItem`

| Prop | Type | Notes |
|---|---|---|
| `value` | `string` | Required. Section id. `href` defaults to `#${value}`. |
| `level` | `1 \| 2` | Default `1`. Level 2 indents 16px. |
| `number` | `ReactNode` | Optional, mono, first line only. |
| `children` | `ReactNode` | Label. |
| `href` | `string` | Optional override. |
| rest | `ComponentProps<'a'>` | Spread on the `<a>`; `onClick` composed, never replaced. |

- Click: call consumer `onClick` first. Then intercept — `preventDefault()` and call root
  `onValueChange(value)` — only when all hold: not `event.defaultPrevented`, root has
  `onValueChange`, the resolved `href` starts with `#`, and the click is unmodified
  (no ctrl/meta/shift/alt, primary button). Otherwise the browser navigates normally, so a
  ToC without `onValueChange` still works as plain anchor links, and an `href` to another
  route is never silently dead. *(Builder-check call)*
- Active item: `aria-current="location"` on the `<a>`, `data-active` for styling.

### Exports

`TableOfContents`, `TableOfContentsItem` + their Props types from
`components/TableOfContents/index.ts`, re-exported from `src/index.ts`.

`useScrollSpy` lives in `src/hooks/useScrollSpy.ts` (added to `src/hooks/index.ts`), but
`src/hooks` is internal — `src/index.ts` does not re-export it and `package.json` has no
`./hooks` subpath. *(Builder-check call)*: re-export **only** `useScrollSpy` + its types
from `components/TableOfContents/index.ts`, so it reaches both the root and the
`@wallarm-org/design-system/TableOfContents` subpath (core-frontend imports by subpath).
Do not re-export the whole hooks barrel — that would publish `useControlled` & co. When
Tabs integration lands, it imports the same hook from `src/hooks`.

## Views

Take sizes, tokens and colors from Figma `get_design_context` on the component set
(`toc-item`, `toc-progress`); numbers below are for orientation.

### Full (200px wide in Figma)

- Header row 32px: icon button (collapse) on the left + title.
- Items on one shared vertical rail (left border of the list). Row min-height 32px, 1px gap.
- Active: the rail segment beside the row turns dark, label switches to ink color.
- States Default / Hover (light fill) / Pressed (darker fill); focus is
  `focus-visible:ring-3 ring-focus-primary` drawn over the hover fill — copy the NavPanel
  row recipe (`NavPanel/classes.ts`).
- Label: max two lines (`line-clamp-2`), then ellipsis. Number stays on line one; the rail
  grows with the row.
- The list scrolls when taller than its space (`overflow-y-auto` on the list; the root takes
  the height its parent gives it). Header does not scroll.

### Minimized

- Icon button (expand) at the top, then one dash per item (14px rows).
- Dash length by level (level 1 long, level 2 short); active dash is the longest and dark.
  Dashes have no hover/pressed look, are `aria-hidden`, not focusable.
- Popover over the dashes, opened by:
  - mouse: pointer enters the dashes area → open; pointer leaves both dashes and popover
    → close (use HoverCard's delays as reference: open 600ms is too slow here — builder
    picks a short open delay, ~100ms, close ~300ms);
  - touch / pen: tap on the dashes toggles; tap outside or Escape closes.
- Popover content: the same items as Full, no header, `dropdown-menu` surface (220px wide in
  Figma). It starts right under the expand button, is pinned to the top-right and grows to
  the left, covering the dashes (`placement: 'bottom-end'` against the button area; verify
  against Figma frame "Minimized").
- Clicking an item in the popover calls `onValueChange` and closes the popover.
- Build on Ark `Popover` controlled (HoverCard / zag hover-card ignores touch pointers, so it
  can't do the tap path). Render content through the existing `Popover` / `PopoverContent`
  if their surface fits; otherwise Ark directly with the same classes.
- Switching views keeps `value` (it's the consumer's state anyway).

## Rendering children in three places

Children render in Full (rows), Minimized (dashes) and the popover (rows). Root provides a
context `{ value, onValueChange, mode: 'row' | 'dash', closePopover? }`;
`TableOfContentsItem` reads it and renders a row link or a dash `<span>`. In Minimized the
dashes list and the popover list each wrap the same `children` in their own provider.
Only one row-mode copy is mounted at a time (popover uses `lazyMount`/`unmountOnExit`), so
consumer `id`s and `ref`s on items are not duplicated while the popover is closed; while it
is open the dash copy is a `span` and does not receive the consumer's `ref` / rest props.

## Test IDs

Follow `docs/test-id-pattern.md`. Root `data-testid` cascades via `TestIdProvider`:

- `{base}--toggle` — collapse / expand button
- `{base}--list` — Full list
- `{base}--dashes` — Minimized dashes area (popover trigger)
- `{base}--popover` — popover content
- `{base}--item` — row link (consumer may override per item with their own `data-testid`)

## `useScrollSpy`

```ts
const { activeId, scrollTo } = useScrollSpy({
  ids: string[],                 // section element ids, in document order
  root?: HTMLElement | null,     // scroll container: undefined → window; null → not mounted
                                 // yet, the hook stays idle (callback-ref state is null on
                                 // first render; attaching to window then would mis-measure)
  offset?: number,               // px from the container top that counts as "reading line"; default 0
  behavior?: ScrollBehavior,     // for scrollTo; default 'smooth'
});
```

- **Active section** = the last id whose element top is at or above the reading line. Before
  the first section passes the line: the first id. Missing elements are skipped.
- **Bottom of the page**: when the container is scrolled to its end, the last id is active
  (short last sections never reach the line).
- **Measuring**: `scroll` listener (passive) on `root ?? window` + `resize`, throttled by
  `requestAnimationFrame`, reading `getBoundingClientRect()` relative to the container.
  Not IntersectionObserver (threshold behaviour on short sections is unpredictable).
- **`scrollTo(id)`**: scrolls so the element's top sits at the reading line; sets `activeId`
  to `id` immediately and ignores measurements until the scroll settles (`scrollend` where
  supported, else no scroll event for ~100ms), so intermediate sections don't flash.
  A user wheel/touch/key scroll during that window cancels the lock.
- Updates `history`? **No** — the hook does not touch the URL. Consumers can.
- SSR-safe: no `window` access during render.
- Rules of React / React Compiler: state via `useState`, listeners in `useEffect`, no ref
  reads in render.

## Tests

- **Unit (Rstest)**: item click → `onValueChange`; consumer `onClick` composed and
  `preventDefault` respected; modified click keeps default; `aria-current` on the active
  item only; view toggle controlled + uncontrolled; label `line-clamp` class present;
  popover opens on tap (pointerType touch) and on hover, closes on item click / Escape.
- **useScrollSpy**: active by position (mock `getBoundingClientRect`), bottom-of-page rule,
  `scrollTo` lock, cancel on user scroll, custom `root`.
- **a11y**: `nav` landmark with name, list semantics, `aria-current`, dashes `aria-hidden`.
- **Analytics** (`docs/metrics/testing-examples.md`): `data-analytics-*` on an item lands on
  the `<a>`; on the root lands on the `nav`.
- **Testid**: cascade per the slots above; no derived ids without a root id.
- **E2E** (CI only, `[update-screenshots]`): screenshots of Full, Minimized, popover open,
  hover/active/focus states, two-line truncation, long list scrolling; interaction: click
  scrolls and highlights, toggle keeps active, popover hover/tap.

## Storybook

Category per `adding-components.md`. Stories (no wrappers, named handlers — see repo story
rules): Basic, Numbered, Minimized, Levels, Long labels, Long list, With ScrollSpy (a
scrollable story page wiring `useScrollSpy` → `TableOfContents`), With SegmentedTabs (same
hook driving tabs). Overview page via `/storybook-docs`.

## Code Connect

`TableOfContents.figma.ts` → `toc-progress`, `TableOfContentsItem.figma.ts` → `toc-item`.

## Left to the builder

- Exact tokens, icon for collapse/expand (from `src/icons`, never inline SVG), dash widths.
- Popover open/close delays within the ranges above.
- Whether `Popover`/`PopoverContent` can be reused as-is or Ark is used directly.
