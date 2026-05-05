# Attribute: Nested Interactivity Inside Actions Target

Date: 2026-05-05
Branch: `feature/WDS-74`
Owner: Oksana Klimova

## Problem

`AttributeActionsTarget` currently wraps the entire `AttributeValue` content in a `DropdownMenuTrigger` and forcibly disables all descendant pointer events:

```tsx
'[&_*]:pointer-events-none'
```

This makes the value's "default" interactivity unusable when actions are attached:

- `InlineCodeSnippet` copy button — dead.
- `Link` — not navigable.
- `IpList` overflow `+N` popover — clicking it opens the attribute dropdown instead of the IP popover.

Two interaction models conflict; only one wins.

## Goal

When the user clicks **a built-in interactive descendant** of the value (e.g. `+N`, `Link`, copy button), only that descendant fires.
When the user clicks **anywhere else** on the value, the attribute actions dropdown opens.

For all standard interactive elements (anchors, buttons, form controls, ARIA-button-like roles), this must work transparently — consumers of `Attribute` should not need to mark them. The component itself is responsible for routing the event. A non-standard custom interactive zone (a bare `<div onClick>` with no role) is not auto-detected; an opt-in marker exists for that case but is not part of the public API yet.

## Non-Goals

- No new public props on `Attribute`, `AttributeValue`, `AttributeActions`, or `AttributeActionsTarget`.
- No changes to which children `AttributeActionsTarget` accepts.
- No new sub-component for "wrap me to escape the trigger" — relying on standard interactive element semantics is enough.
- No theming/visual redesign of the hover/focus state.

## Design

### Detection rule

`AttributeActionsTarget` decides per-event whether the click belongs to it or to an internal interactive descendant.

A descendant is considered **internal-interactive** when `event.target.closest(SELECTOR)` returns an element that is a strict descendant of the target root (i.e. not the root itself — important because Zag's `Menu.Trigger` puts `aria-haspopup` on the target div, which would otherwise self-match).

`SELECTOR`:

```
a[href],
button,
[role="button"],
[role="link"],
[role="menuitem"],
[role="menuitemradio"],
[role="menuitemcheckbox"],
[role="checkbox"],
[role="switch"],
[role="tab"],
input,
select,
textarea,
[contenteditable="true"],
[aria-haspopup],
[data-attribute-actions-skip]
```

- `[aria-haspopup]` covers any popover / menu / dialog trigger composed via Ark UI Slot (`asChild`) — those triggers don't always carry `role="button"` but always set `aria-haspopup`. Required because once `Tag`/`Badge` stopped swallowing clicks unconditionally, Zag's popover trigger can no longer rely on `stopPropagation` to suppress the dropdown — we have to detect it instead.
- `[data-attribute-actions-skip]` is an internal escape hatch for non-standard interactive zones. Marked `@internal` in the component JSDoc; not part of the public API.

### Handlers

The dropdown is **Park UI / Ark UI / Zag** — not Radix. `<DropdownMenuTrigger asChild>` runs Ark UI's `withAsChild`, which clones the rendered child via `cloneElement(child, mergeProps(restProps, child.props))`. Ark UI's `mergeProps` composes event props with `callAll(...handlers)` — the user-supplied handler runs first; the Zag-supplied handler runs after. Zag's `Menu.Trigger` opens on `click` and `keydown` (Enter / Space) — **not** pointerdown — and explicitly checks `if (event.defaultPrevented) return` before sending the open event.

So we attach plain (bubble-phase) handlers on the target div:

- `onClick` → if internal-interactive → `event.preventDefault()`. Zag's `onClick` then skips opening.
- `onKeyDown` → if `event.key` is `Enter` or `' '` and internal-interactive → `event.preventDefault()`. Zag's `onKeyDown` then skips opening.

We do **not** add an `onPointerDown` handler — Zag does not open on pointerdown, so it would be dead code.

Crucially, the inner interactive element's own handler (e.g. `+N` badge's `Popover` trigger on `click`) has already fired in the bubble phase **before** the event reaches our target div, so it is unaffected by our `preventDefault`. Only Zag's own handler on the target div — which composes after ours via `callAll` and respects `defaultPrevented` — is suppressed.

We do **not** call `stopPropagation`. The internal interactive element handles its own event normally; we only block Zag from opening the dropdown.

#### `Tag` and `Badge` `stopPropagation`

`Tag` and `Badge` previously called `event.stopPropagation()` unconditionally inside their click handler, which made decorative tags/badges swallow clicks meant for any clickable wrapper (the very pattern this spec relies on). Both components now only attach a click handler when they receive a consumer `onClick` prop. When wrapped in `<PopoverTrigger asChild>` / similar Ark UI triggers, the wrapper's `onClick` is injected via Ark's `withAsChild` → `cloneElement`, so Tag/Badge's handler does fire (and rightly stops propagation for trigger semantics). Decorative usage no longer attaches any handler at all and clicks bubble naturally up to `AttributeActionsTarget`.

### Pointer-events change

Remove `[&_*]:pointer-events-none` from the className. Descendants regain their native event handling.

### Hover / focus / cursor

Stays as-is. The whole target is still the dropdown's hit zone visually. Internal-interactive descendants render their own focus ring (e.g. `+N` Tag, Link) on top — same as everywhere else in the app. No additional `:has()` rules in this iteration; if double-hover proves visually noisy in real use, we add it as a follow-up.

### Keyboard navigation

- Tab order: target → each internal-interactive descendant → next attribute. Native, no extra wiring.
- `Enter` / `Space` on the target itself: opens the dropdown (Zag default).
- `Enter` / `Space` on an internal descendant: triggers that descendant; the capture handler suppresses the dropdown.

### Hover-background rounded corners

The current `AttributeActionsTarget` uses `-mx-4 -my-6 ... px-6 py-4 rounded-8`. The vertical bleed (`-my-6` = −24px) exceeds `AttributeValue`'s vertical padding in both orientations:

- Horizontal: `AttributeValue` is `py-4 truncate` (16px padding + `overflow:hidden`) → top/bottom of the target are clipped → rounded corners appear square.
- Vertical: `AttributeValue` is `pt-4 min-h-[28px]` (no `overflow:hidden`, but the target's negative top margin paints over the label region) → visually uneven.

Fix: align target vertical bleed to `AttributeValue`'s padding in each orientation so all four corners of the hover background render fully.

- Horizontal: change target `-my-6` → `-my-4` (matches AttributeValue `py-4`). Horizontal bleed `-mx-4` and `px-6` stay (AttributeValue has no horizontal padding, so target legitimately extends a bit past its edges; this is not clipped because the row-level container does not `overflow:hidden`).
- Vertical: AttributeValue is `pt-4 min-h-[28px]`. Target's `-my-6` should not paint above the label gap. Reduce to `-my-4` here as well for symmetry; the hover area still spans the full value row.

End state: target uses `-mx-4 -my-4 ... px-6 py-4 rounded-8` in both orientations; rounded corners are visible on all four sides.

### Backward compatibility

Existing stories (`WithActions`, `HorizontalWithActions`) wrap `Text` or `Badge` — neither matches the SELECTOR — so behavior is unchanged. The newly added IPs example in `HorizontalWithActions` becomes the regression case for the new behavior.

## Affected files

- `packages/design-system/src/components/Attribute/AttributeActionsTarget.tsx`
  - Drop `[&_*]:pointer-events-none`.
  - Replace `-my-6` with `-my-4` in the className so hover background corners are not clipped.
  - Add a small helper (in the same file) that computes "is this event from an internal interactive descendant of `currentTarget`?".
  - Add `onPointerDown`, `onClick`, `onKeyDown` handlers that compose with any handlers passed via `...props`.

No other component files change.

## Tests

### E2E (`Attribute.e2e.ts`)

Add a section under "Interaction":

1. **`+N` overflow opens IPs popover, not the dropdown.**
   - Render `HorizontalWithActions` story.
   - Locate the `+N` badge inside the IPs attribute.
   - Click it.
   - Assert the IpList popover content is visible.
   - Assert the AttributeActions dropdown menu is **not** visible.

2. **Click on a non-interactive part of value opens the dropdown.**
   - Same story.
   - Click on an empty area of the IPs target (e.g. between the country flag and address, or on the wrapping target padding).
   - Assert the dropdown menu items (`Investigate by this value`, `Copy value`) are visible.

3. **Existing simple-text case still opens the dropdown.**
   - `Source IP` row from the same story (wraps a plain `Text`).
   - Click anywhere on it → dropdown opens. (Regression guard.)

### Screenshot tests

Update the `HorizontalWithActions` screenshot baseline to cover the hover state showing fully rounded corners on all four sides for at least one row (the existing `--hover` snapshot pattern, if present, or a new snapshot named accordingly).

### Unit / component tests

Not strictly required — behavior is event-routing, easier to validate in e2e where Radix portals render. Skip Vitest additions.

## Risks

- **Radix-internal trigger nodes inside value.** If a consumer puts another Radix `Trigger` inside the target (other than the one we add), it will match the SELECTOR (it's a `button`/`role="button"`) and short-circuit our dropdown — which is correct behavior under the goal.
- **Custom `div` with `onClick` but no role.** Will NOT match the SELECTOR, so click opens the attribute dropdown. Documented escape hatch: add `data-attribute-actions-skip` attribute or give it a proper role. We do not solve this automatically — guessing intent of a bare `<div onClick>` is worse than asking for an explicit marker.
- **Nested button HTML.** Already an existing concern (Radix uses `asChild` div with `role="button"`, and inner Tag/Popover triggers are also `role="button"`). Not introduced by this change; not fixing here.

## Open questions

None. All resolved during brainstorming.
