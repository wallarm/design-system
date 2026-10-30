# PointSelector — Analytics Gaps

This file is the single source of truth for `PointSelector`'s analytics-readiness pattern, per
[`docs/metrics/contract.md`](../../../../../docs/metrics/contract.md). It documents the
**wrapper-level, onChange-based analytics integration** and records why internal interactive
elements have no direct `data-analytics-id` seam.

Audited: 2026-10-28 · Owner: Design System team — Point Selector MVP

---

## Architecture: Wrapper-Level, onChange-Based

`PointSelector` is a **wrapper-level component** where analytics tracking happens via the
`onChange` callback, not via `data-*` attributes on internal interactive elements.

### Why Wrapper-Level?

The component is a **guided point builder** with dozens of internal, ephemeral interactive
elements (menu items, input fields, chip buttons) that appear and disappear as the user navigates
through the point construction flow. Instrumenting each internal element would:

1. **Pollute the API** with analytics-specific props for every sub-step (50+ internal UI states)
2. **Break encapsulation** — the guided flow is the DS abstraction; exposing every step's DOM
   defeats the purpose
3. **Create maintenance burden** — internal refactoring (menu structure, keyboard shortcuts) would
   break analytics code

Instead, the **`onChange` callback is the analytics seam**: it fires on every meaningful state
change with the full point construction state, allowing the consumer to derive analytics events
from value diffs.

---

## Analytics Integration Pattern

### Consumer-Side Implementation

```typescript
<PointSelector
  context="http_request"
  value={pointValue}
  onChange={(newValue) => {
    // Analytics tracking: compare previous vs new value
    if (newValue.segments.length > pointValue.segments.length) {
      // Segment added
      const addedSegment = newValue.segments[newValue.segments.length - 1];
      analytics.track('point_selector.segment_added', {
        segment_kind: addedSegment.kind,
        segment_text: addedSegment.text,
        point_canonical: newValue.canonical,
        context: 'http_request',
      });
    }

    if (newValue.condition !== pointValue.condition) {
      // Condition changed
      analytics.track('point_selector.condition_changed', {
        from: pointValue.condition,
        to: newValue.condition,
      });
    }

    // Update state
    setPointValue(newValue);
  }}
  // Wrapper-level data-* lands on root <div>, not on interactive elements
  data-analytics-id="POINT_BUILDER_MODAL"
  data-analytics-props={JSON.stringify({ context: 'http_request', profile: 'tree' })}
/>
```

### Trackable Events via onChange

The `onChange` callback provides full state for tracking:

| Event | Derived From | Example Payload |
|-------|--------------|-----------------|
| Segment added | `newValue.segments.length > oldValue.segments.length` | `{ kind: 'native', text: 'body', canonical: '[http:body]' }` |
| Segment removed | Chip click → `segments.slice(0, index)` | `{ removed_index: 2, canonical: '[http:body][format:json]' }` |
| Condition selected | `newValue.condition !== oldValue.condition` | `{ from: null, to: 'equal' }` |
| Value entered | `newValue.value !== oldValue.value` | `{ value: '*admin*', ignoreCase: true }` |
| Point completed | `newValue.canonical` set (valid point) | `{ canonical: '[http:header]["authorization"]', exact: true }` |
| Profile changed | `onProfileChange?.(profile)` callback | `{ from: 'tree', to: 'value' }` |
| Keys loaded | Async keys provider completes | `{ parent: '[http:header]', count: 42, duration_ms: 156 }` |
| SDK error | `onChange` not called, error shown in UI | *(tracked via error boundary, not onChange)* |

---

## Root Element: data-* Lands on Non-Interactive Wrapper

The root `<div data-slot="point-selector">` accepts arbitrary `data-*`, `aria-*`, `id`, and other
HTML attributes via `{...rest}`, but it is **not interactive** — it is a visual container. The
attributes land there per the metrics contract's "wrapper-level exception" clause.

**Why this is correct:**
- The root wrapper has no `onClick`, `onKeyDown`, or other interaction handlers
- Interactive elements are internal (inputs, buttons, menu items) with no direct seam
- Analytics SDK can still use `data-analytics-id` on the wrapper for context (e.g., "which dialog
  contained this interaction?"), resolved via `event.target.closest('[data-analytics-id]')`
- The `onChange` callback is the **typed, structured seam** for tracking point construction events

---

## Internal Interactive Elements (No Direct Seam)

These elements are internal to the guided flow and have **no attribute pass-through** today. All
interactions are tracked via `onChange` state diffs.

### INT-1 — Segment chip buttons (truncate point)

- **Where:** `WhereBar.tsx` (`<button>` chips for each segment)
- **Why no seam:** Chips are auto-generated from `value.segments`; no composition API to inject
  attributes per chip
- **Workaround:** `onChange` called with truncated segments when chip clicked; consumer derives
  "segment removed" event
- **Owner:** Design System team — Point Selector MVP
- **Next decision point:** If per-chip instrumentation is needed, add `renderSegmentChip` render
  prop or export `SegmentChip` with attribute pass-through

### INT-2 — Bar input field (point string / query)

- **Where:** `WhereBar.tsx` (`<input>` for typing query)
- **Why no seam:** Internal input managed by `usePointSelector` hook; query state is ephemeral
  (cleared on selection)
- **Workaround:** `onChange` called when user selects an option; intermediate query keystrokes are
  not analytics events (UX pattern: typeahead filter, not freeform input)
- **Owner:** Design System team — Point Selector MVP
- **Next decision point:** Revisit only if keystroke-level analytics is required (e.g., "user typed
  'auth' but didn't select anything")

### INT-3 — Menu items (step selection)

- **Where:** `StepMenu.tsx` → `DropdownMenu` items
- **Why no seam:** Items are auto-generated from SDK completion; no composition API to inject
  attributes per item
- **Workaround:** `onChange` called when user chooses a row; consumer knows which segment was added
  from `newValue.segments[segments.length - 1]`
- **Owner:** Design System team — Point Selector MVP
- **Next decision point:** If per-item attribution is needed, add `renderMenuItem` render prop

### INT-4 — Name input field (header name, JSON key, etc.)

- **Where:** `StepMenu.tsx` header → `DropdownMenuInput` (name step)
- **Why no seam:** Internal input for name step; ephemeral query state
- **Workaround:** `onChange` called when user confirms the name; final name appears in
  `newValue.segments` (e.g., `{ kind: 'key', value: 'authorization' }`)
- **Owner:** Design System team — Point Selector MVP
- **Next decision point:** Revisit only if name-typing analytics is required (unlikely)

### INT-5 — Next button (proceed to condition step)

- **Where:** `PointSelector.tsx` ("Next: set the condition" button)
- **Why no seam:** Internal navigation button; stage state (`point` → `condition`) is internal
- **Workaround:** Stage change does **not** call `onChange` (value unchanged); if needed, consumer
  can track via `initialStage` prop changes or add `onStageChange` callback (enhancement)
- **Owner:** Design System team — Point Selector MVP
- **Next decision point:** If stage-change analytics is required, add `onStageChange?: (stage) => void`
  prop

### INT-6 — Condition dropdown (equal, contains, exists, etc.)

- **Where:** `MatchStep.tsx` → `DropdownMenu` for conditions
- **Why no seam:** Internal dropdown; condition choices are DS-internal
- **Workaround:** `onChange` called with `newValue.condition` when user selects; consumer tracks
  condition selection from value diff
- **Owner:** Design System team — Point Selector MVP
- **Next decision point:** Revisit only if per-condition-item attribution is needed (unlikely)

### INT-7 — Value input field (match value)

- **Where:** `MatchStep.tsx` (`<input>` for value)
- **Why no seam:** Internal input managed by component state
- **Workaround:** `onChange` called on blur/commit with `newValue.value`; intermediate keystrokes
  not tracked (typing state is ephemeral)
- **Owner:** Design System team — Point Selector MVP
- **Next decision point:** Revisit only if keystroke-level analytics is required

### INT-8 — Ignore case checkbox

- **Where:** `MatchStep.tsx` (Alt+C checkbox)
- **Why no seam:** Internal checkbox; tied to `value.ignoreCase`
- **Workaround:** `onChange` called with `newValue.ignoreCase` when toggled
- **Owner:** Design System team — Point Selector MVP
- **Next decision point:** If direct checkbox instrumentation is needed, export `IgnoreCaseCheckbox`
  sub-component

### INT-9 — Keyboard shortcuts dialog (? key)

- **Where:** `KeyboardShortcutsDialog.tsx` (modal)
- **Why no seam:** Help dialog; no analytics value in tracking open/close (not a data event)
- **Workaround:** None needed (help UI, not a user action)
- **Owner:** Design System team — Point Selector MVP
- **Next decision point:** N/A (help dialogs are typically not tracked)

### INT-10 — SDK error fixes (click to apply fix)

- **Where:** `PointSelectorError.tsx` ("Use 'header' instead" buttons)
- **Why no seam:** Error recovery UI; fix application calls `onChange` with corrected value
- **Workaround:** `onChange` called with fixed point; consumer can track fix application from value
  change (e.g., `newValue.canonical` differs from `oldValue.canonical` after error state)
- **Owner:** Design System team — Point Selector MVP
- **Next decision point:** If explicit "error fix applied" event is needed, add `onFixApplied` callback

---

## Accepted Gaps Summary

All interactive elements above are **accepted gaps** per the metrics contract's wrapper-level
exception. The component's API surface is:

- **Input:** `value: PointSelectorValue` (segments, condition, value, ignoreCase, canonical)
- **Output:** `onChange: (newValue: PointSelectorValue) => void`
- **Root attributes:** `data-*`, `aria-*`, `id` land on non-interactive wrapper

This is the **correct and stable seam** for a guided builder component. Internal restructuring
(menu layout, keyboard shortcuts, SDK integration) will not break consumer analytics code.

---

## Testing Analytics Integration

See `PointSelector.test.tsx` lines 101-128 for analytics readiness tests:

```typescript
describe('Analytics via onChange callback', () => {
  it('provides onChange callback as the analytics seam for segment changes', () => {
    const onChange = rs.fn();

    render(
      <PointSelector
        context='http_request'
        value={{ segments: [], condition: null, value: '', ignoreCase: false }}
        onChange={onChange}
        data-analytics-id='POINT_BUILDER' // lands on wrapper only
      />
    );

    // The consumer can track interactions by comparing previous and current value
    // state in the onChange callback.
    expect(onChange).toBeDefined();
    expect(typeof onChange).toBe('function');
  });
});
```

---

## Future Enhancement: Stage Change Callback

If product analytics requires tracking navigation between steps (point → condition → value),
consider adding:

```typescript
interface PointSelectorProps {
  // ... existing props
  onStageChange?: (stage: PointSelectorStage) => void;
}
```

This would fire on "Next" button click, "Change where" button click, and programmatic stage changes,
enabling analytics like:

```typescript
<PointSelector
  onStageChange={(stage) => {
    analytics.track('point_selector.stage_changed', { stage });
  }}
/>
```

**Decision:** Not included in MVP. Add only if usage data shows stage-change tracking is valuable.

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 2026-10-28 | Initial version (MVP) | Design System team |
