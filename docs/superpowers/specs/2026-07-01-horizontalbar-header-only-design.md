# HorizontalBar — Header-only (no-data) mode

**Date:** 2026-07-01
**Component:** `packages/design-system/src/components/SimpleCharts/HorizontalBar`
**Story:** `/story/data-display-simplecharts-horizontalbar--default`

## Problem

When `HorizontalBar` receives no label data, it still renders an empty rounded bar
track under the header. Product wants a "header-only" presentation instead: just the
`ChartTitle` (composed outside the component), the headline `value`, and the delta
`Badge` — no bar, no legend.

## Trigger

Header-only mode is automatic and driven solely by the data array:

- `data.length === 0` → **no bar wrapper, no legend** (legend is already suppressed
  when there are no segments).
- This holds even when `total` is provided. "No labels" means no bar; a `total`/remainder
  is not drawn on its own.
- If `data.length === 0` **and** neither `value` nor `delta` is provided, nothing renders
  (degenerate empty `div`). Consumers wanting an explicit empty body use `<ChartEmpty />`.

No new prop is added — the mode is inferred from `data`.

## Changes

### Component — `HorizontalBar.tsx`
- Compute `const hasBar = data.length > 0;`.
- Gate the `horizontal-bar-bar-wrapper` block on `hasBar`.
- No other logic changes: the legend and `barAriaLabel` are already driven by resolved
  segments, so they no-op naturally when data is empty.

### Stories — `HorizontalBar.stories.tsx`
- Repurpose the existing `Empty` story into the meaningful header-only state that matches
  the target design: `{ data: [], value: 91, delta: { value: 10, trend: 'up' } }`.

### E2E — `HorizontalBar.e2e.ts` (+ snapshots)
- Regenerate the `Empty` screenshot (now header-only, no track).
- Update any interaction/a11y assertions that assumed an empty bar track exists.

### Unit tests — `HorizontalBar.test.tsx`
- Update the empty-data test: assert `[data-slot="horizontal-bar-bar"]` is **absent** and
  the header (value + delta) still renders.

### Docs — `docs/HorizontalBar.md`
- Update the `Empty` state row and the edge-cases section to describe header-only rendering
  (replacing the "empty rounded track" behaviour).

## Out of scope (YAGNI)
- No new `barless` / `hideBar` prop.
- No `total`-only remainder rendering when data is empty.
- No animation.

## Success criteria
- `data: []` with `value`/`delta` renders header only, matching the target screenshot.
- `data: []` with neither renders nothing.
- Non-empty `data` behaviour is unchanged.
- Lint, typecheck, unit tests, and E2E (with regenerated snapshot) pass.
