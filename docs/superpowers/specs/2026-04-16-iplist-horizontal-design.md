# IpList Horizontal Variant — Design Spec

**Date:** 2026-04-16
**Component:** `IpList` (`packages/design-system/src/components/Ip/IpList.tsx`)

## Goal

Add a `type: 'vertical' | 'horizontal'` prop to `IpList`. Default is `vertical` (current behaviour, no regression). `horizontal` lays `Ip` items in a single row separated by a middle-dot `·`, dynamically truncates to fit the container width, and shows the remainder behind a `+N` Badge that opens a Popover.

## Current Behaviour (vertical, unchanged)

- Shows the first `Ip` only.
- Remaining `Ip` items are hidden behind a `Link` `+N address(es)` trigger that opens a `Popover` with a `VStack` of the hidden items.

## New Behaviour (horizontal)

- All visible `Ip` items are rendered in one row.
- A middle-dot separator `·` is rendered between adjacent visible `Ip` items as its own `<span>` with `text-text-muted` colour.
- The number of visible items is computed dynamically by measuring each `Ip`'s width and packing as many as fit within the container width (reserving space for the overflow indicator).
- Overflowing items are hidden behind a `Badge` (`type='outline'`, `color='slate'`) with the label `+N` at the end of the row. The `Badge` acts as the `PopoverTrigger`; clicking opens a `Popover` with a `VStack` of the hidden items (same as vertical).
- The container recalculates on resize (via the hook's `ResizeObserver`).
- At least one `Ip` is always visible even if it does not fit.

## API

```tsx
type IpListType = 'vertical' | 'horizontal';

interface IpListProps {
  type?: IpListType; // default 'vertical'
  // existing: ref, asChild, className, children, ...div props
}
```

Usage:

```tsx
<IpList type='horizontal'>
  <Ip><IpCountry code='US' /><IpAddress>142.198.167.52</IpAddress><IpProvider>Azure</IpProvider></Ip>
  <Ip><IpCountry code='US' /><IpAddress>34.74.73.20</IpAddress><IpProvider>AWS</IpProvider></Ip>
  {/* ... */}
</IpList>
```

## Architecture

Single-file change in `IpList.tsx`. Two render branches:

- **vertical** — existing code unchanged.
- **horizontal** — uses the existing `useOverflowItems` hook from `src/hooks/useOverflowItems.tsx`.
  - `items = Children.toArray(children)`
  - `renderItem(item) = <Ip wrapper>{item}</Ip>` (just returns the child)
  - `overflowRenderer(hidden) = <Badge>+N</Badge>` used for width reservation only
  - `reserveSpace` ≈ 56 (rough width of `+N` Badge with gap; the hook also measures dynamically)
  - Hook returns `containerRef`, `visibleItems`, `hiddenItems`, `MeasurementContainer`
- The horizontal row is a `div ref={containerRef}` with `flex flex-row items-center gap-6 min-w-0`.
- Between adjacent visible items, render a separator `<span aria-hidden='true' className='text-text-muted'>·</span>`.
- If `hiddenItems.length > 0`, render the overflow `Popover` with `Badge` trigger after the last visible item.

## Component Tree (horizontal)

```
<div ref={containerRef} data-slot="ip-list" data-type="horizontal" className="flex items-center gap-6 min-w-0">
  {visibleItems.map((ip, i) => (
    <Fragment key={i}>
      {i > 0 && <span aria-hidden="true" className="text-text-muted">·</span>}
      {ip}
    </Fragment>
  ))}
  {hiddenItems.length > 0 && (
    <>
      <span aria-hidden="true" className="text-text-muted">·</span>
      <Popover>
        <PopoverTrigger asChild>
          <Badge type="outline" color="slate" size="medium" className="cursor-pointer">
            +{hiddenItems.length}
          </Badge>
        </PopoverTrigger>
        <PopoverContent minHeight="auto" maxHeight="320px" minWidth="auto">
          <VStack gap={8}>{hiddenItems}</VStack>
        </PopoverContent>
      </Popover>
    </>
  )}
</div>
<MeasurementContainer />
```

(Vertical branch uses the separator only in horizontal; the `+N` indicator in vertical remains a `Link` as today.)

## Edge Cases

- **Empty children** — return `null` (same as today, handled before branching).
- **Single child** — no separator, no overflow. Both branches render just the one `Ip`.
- **All fit** — no `+N` Badge and no trailing separator.
- **None fit** — hook guarantees `visibleCount >= 1`, so one `Ip` is always shown; rest go into overflow.
- **Resize** — hook's `ResizeObserver` recalculates `visibleCount`.
- **`asChild`** — horizontal branch does NOT support `asChild` (the wrapper owns `ref` and layout); if `asChild` is passed with `type='horizontal'`, log a dev warning and fall back to normal rendering. Rationale: measurement and overflow rely on a stable wrapper.
- **`className`** — merged into the outer `div` in both branches (same as today).
- **`data-testid`** — propagated via `useTestId('list')` (same as today). Overflow `Badge` gets `data-testid={listTestId ? ${listTestId}-overflow-trigger : undefined}` via the slot, and the Popover content gets `-overflow-content`.

## Styling Details

- Root (horizontal): `flex items-center gap-6 min-w-0` (the hook's measurer needs `min-w-0` to report the real available width inside flex parents).
- Separator: `<span className="text-text-muted select-none" aria-hidden="true">·</span>` (no margin; uses parent's `gap`).
- Badge: `type='outline'` `color='slate'` `size='medium'` with `cursor-pointer`; label = `+${hiddenItems.length}` (no word "addresses" — tight horizontal context).

## Testing

### Stories (`Ip.stories.tsx`)

- `HorizontalBasic` — 3 `Ip` items (with countries + providers) in a wide container (e.g. 900px). All visible, separators rendered, no `+N`.
- `HorizontalOverflow` — 10 `Ip` items in a 600px container. Some visible, `+N` present. Clicking `+N` reveals remaining in Popover (manual interaction in docs).
- `HorizontalNarrow` — 5 `Ip` items in a 200px container. Only first is visible, `+4` shown.
- `HorizontalMixed` — several Ip with and without country flags/providers to confirm measurement adapts.

### E2E (`Ip.e2e.ts`)

- Screenshot: each of the four stories above (default state).
- Screenshot: `HorizontalOverflow` after clicking `+N` (Popover open).
- Interaction: click `+N` → Popover has `data-slot="popover-content"` visible → contains expected hidden `IpAddress` texts.
- Accessibility: Badge overflow trigger is focusable and operable via keyboard (Enter/Space opens Popover).

### Unit / Component

No new unit tests (the hook `useOverflowItems` already has its own coverage; `IpList` logic is rendering + delegation).

## Out of Scope

- Custom separator characters or colors (keep `·` muted).
- Animation of item reveal/hide.
- Scrollable variant (user chose dynamic truncation).
- Changing vertical behaviour or `Link` overflow trigger.
- Responsive behaviour that switches between `vertical` and `horizontal` automatically — caller decides via prop.

## Risks / Open Questions

- **Measurement re-layout flicker** — `useOverflowItems` renders a hidden measurement container and a visible one; already used by `OverflowList` without user-visible flicker. Reuse mitigates risk.
- **`reserveSpace` constant** — initial rough value (56px). The hook also measures dynamically. If Badge size changes, adjust constant; no algorithmic issue.
- **`asChild` + horizontal** — deliberately not supported; spec codifies dev warning + fallback.
