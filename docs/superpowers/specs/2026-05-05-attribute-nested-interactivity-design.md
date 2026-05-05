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

A descendant is considered **internal-interactive** when `event.target.closest(SELECTOR)` returns an element that is a strict descendant of the target root (i.e. not the root itself).

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
[data-attribute-actions-skip]
```

`[data-attribute-actions-skip]` is an opt-in escape hatch for consumers who need to mark a non-standard interactive zone (we do not document it as public API yet — it exists so we can extend without a breaking change).

### Handlers

Implemented on the `AttributeActionsTarget` root element using the **capture phase** so they run before Radix's own handlers (Radix attaches handlers via `asChild` on the same node, so capture-phase listeners on the same node still fire first):

- `onPointerDownCapture` → if internal-interactive → `event.preventDefault()` (Radix's `DropdownMenuTrigger` opens on pointerdown by default; preventDefault stops it).
- `onClickCapture` → same check, same `preventDefault()` (defense in depth and keeps non-pointer activation paths consistent).
- `onKeyDownCapture` → if `event.key` is `Enter` or `Space` and internal-interactive → `event.preventDefault()`.

We **do not** call `stopPropagation`. The internal interactive element handles its own event normally; we only block Radix from opening the dropdown.

### Pointer-events change

Remove `[&_*]:pointer-events-none` from the className. Descendants regain their native event handling.

### Hover / focus / cursor

Stays as-is. The whole target is still the dropdown's hit zone visually. Internal-interactive descendants render their own focus ring (e.g. `+N` Tag, Link) on top — same as everywhere else in the app. No additional `:has()` rules in this iteration; if double-hover proves visually noisy in real use, we add it as a follow-up.

### Keyboard navigation

- Tab order: target → each internal-interactive descendant → next attribute. Native, no extra wiring.
- `Enter` / `Space` on the target itself: opens the dropdown (Radix default).
- `Enter` / `Space` on an internal descendant: triggers that descendant; the capture handler suppresses the dropdown.

### Backward compatibility

Existing stories (`WithActions`, `HorizontalWithActions`) wrap `Text` or `Badge` — neither matches the SELECTOR — so behavior is unchanged. The newly added IPs example in `HorizontalWithActions` becomes the regression case for the new behavior.

## Affected files

- `packages/design-system/src/components/Attribute/AttributeActionsTarget.tsx`
  - Drop `[&_*]:pointer-events-none`.
  - Add a small helper (in the same file) that computes "is this event from an internal interactive descendant of `currentTarget`?".
  - Add `onPointerDownCapture`, `onClickCapture`, `onKeyDownCapture` handlers that compose with any handlers passed via `...props`.

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

### Unit / component tests

Not strictly required — behavior is event-routing, easier to validate in e2e where Radix portals render. Skip Vitest additions.

## Risks

- **Radix-internal trigger nodes inside value.** If a consumer puts another Radix `Trigger` inside the target (other than the one we add), it will match the SELECTOR (it's a `button`/`role="button"`) and short-circuit our dropdown — which is correct behavior under the goal.
- **Custom `div` with `onClick` but no role.** Will NOT match the SELECTOR, so click opens the attribute dropdown. Documented escape hatch: add `data-attribute-actions-skip` attribute or give it a proper role. We do not solve this automatically — guessing intent of a bare `<div onClick>` is worse than asking for an explicit marker.
- **Nested button HTML.** Already an existing concern (Radix uses `asChild` div with `role="button"`, and inner Tag/Popover triggers are also `role="button"`). Not introduced by this change; not fixing here.

## Open questions

None. All resolved during brainstorming.
