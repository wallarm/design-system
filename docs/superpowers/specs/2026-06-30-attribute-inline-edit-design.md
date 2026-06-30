# Attribute — Inline Edit Design Spec

**Date:** 2026-06-30
**Ticket:** [WDS-143](https://wallarm.atlassian.net/browse/WDS-143)
**Branch:** `feature/WDS-143`
**Owner:** Oksana Klimova
**Figma:** https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11165-2933
**References:** [Chakra Editable](https://chakra-ui.com/docs/components/editable), [Ark UI Editable](https://ark-ui.com/docs/components/editable)

## Overview

Add **inline editing** to the existing `Attribute` component. An attribute value is
shown read-only by default; on hover it reveals an affordance (background highlight +
trailing trigger icon + "Edit" tooltip); clicking it swaps the value into an editor.
On commit the value is saved (optionally async, with loading → saved feedback); on
cancel the original value is restored.

This is a **second interactive model for the value**, parallel to the existing
`AttributeActions` (which opens a dropdown on click). An attribute uses one or the
other, not both.

The editor itself is **supplied by the consumer** from existing DS inputs — the inline
edit core only owns the read↔edit lifecycle, keyboard handling, and save feedback. This
keeps the feature DRY across all value types from the Figma handoff: `text`, `textarea`,
`numeric`, `select`, `multi-select`, `tags`, `date`, `time`, `datetime`.

## Non-Goals

- No new input primitives — `Input`, `NumberInput`, `Select`, `DateInput`, `TimeInput`,
  `Tag` already exist and are reused.
- No changes to `AttributeActions` behavior. Edit and Actions are mutually exclusive per
  attribute; combining them is out of scope.
- No `orientation` prop on the edit parts — orientation is read from the existing
  `AttributeOrientationContext`.
- No analytics-specific props (per metrics contract). Consumer `data-*` / handlers
  forward to the real interactive node (the editor / preview target).

## Architecture

Compound component family, living **inside the existing `Attribute` folder** and
reusing its contexts (orientation, testId, empty). Mirrors the `AttributeActions`
pattern. Rendered **inside `AttributeValue`** (same placement as `AttributeActionsTarget`).

### File structure

```
packages/design-system/src/components/Attribute/
├── AttributeEditContext.ts        # context + useAttributeEdit() hook (state, value, edit/submit/cancel, status)
├── AttributeEdit.tsx              # Root — owns controlled value + edit state, async commit lifecycle
├── AttributeEditPreview.tsx       # Read mode: hover-target + value + trailing trigger/loading/saved indicator
├── AttributeEditControl.tsx       # Edit mode: renders children only while editing; container keyboard wiring
├── AttributeEditInput.tsx         # Convenience text editor wired to context
├── AttributeEditTextarea.tsx      # Convenience multiline editor wired to context
├── AttributeEditNumber.tsx        # Convenience numeric editor wired to context
├── AttributeEditError.tsx         # Error message below the value
├── classes.ts                     # (extend if shared CVA needed; preview target styles may inline)
├── index.ts                       # (extend) barrel exports for all the above
├── Attribute.stories.tsx          # (extend) add inline-edit stories — one per value type + states
└── Attribute.e2e.ts               # (extend) add inline-edit Visual / Interactions / Accessibility tests
```

> The editor parts (`AttributeEditInput/Textarea/Number`) are thin wrappers over the
> existing DS inputs, pre-wired to the edit context. `select`/`multi-select`/`tags`/
> date/time/datetime have no convenience wrapper — they compose the existing
> `Select`/`DateInput`/`TimeInput` inside `AttributeEditControl` and read the context via
> `useAttributeEdit()`. Stories demonstrate each.

## Components & Props

### `AttributeEdit` (root)

Generic over the value type `T` (`string` by default for the text wrappers).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `T` | — | Controlled committed value |
| `defaultValue` | `T` | — | Uncontrolled initial value |
| `onValueChange` | `(value: T) => void` | — | Fires on every draft change while editing |
| `onValueCommit` | `(value: T) => void \| Promise<unknown>` | — | Fires on submit. If it returns a Promise, the async lifecycle runs (loading → saved/error) |
| `onValueRevert` | `(value: T) => void` | — | Fires on cancel (Escape / blur revert), with the restored value |
| `edit` | `boolean` | — | Controlled edit state |
| `defaultEdit` | `boolean` | `false` | Uncontrolled initial edit state |
| `onEditChange` | `(editing: boolean) => void` | — | Fires on edit-mode transitions |
| `activationMode` | `'click' \| 'focus' \| 'none'` | `'click'` | How the preview enters edit mode (`none` = programmatic) |
| `submitMode` | `'enter' \| 'blur' \| 'both' \| 'none'` | `'both'` | What commits the draft |
| `selectOnFocus` | `boolean` | `true` | Select editor text/content on entering edit (text editors) |
| `status` | `'idle' \| 'loading' \| 'saved' \| 'error'` | — | Override the auto async status |
| `error` | `string` | — | Error message; presence marks the field invalid (overrides auto) |
| `savedDuration` | `number` | `2000` | ms the "saved" check stays before returning to idle |
| `disabled` | `boolean` | `false` | Disables entering edit mode |
| `readOnly` | `boolean` | `false` | Renders value read-only (no affordance) |
| `data-testid` | `string` | — | Cascades via the inherited Attribute TestIdProvider |
| `children` | `ReactNode` | — | Preview + Control + Error parts |
| `ref` / `className` | — | — | Forwarded / merged via `cn()` |

**State management:** uses the existing `useControlled` hook for both `value` and `edit`
(controlled when the prop is supplied, internal state otherwise). Reads
`useAttributeOrientation()` for layout — no own orientation prop. Provides
`AttributeEditContext`.

### `AttributeEditPreview`

Read mode. Mirrors `AttributeActionsTarget` visuals: full-width hover hit-zone
(`-my-4 flex w-full min-w-0 cursor-pointer items-center rounded-8 px-6 py-4
transition-colors hover:bg-states-primary-hover active:bg-states-primary-pressed
focus-visible:ring-3 focus-visible:ring-focus-primary`). Hidden while `editing` is true.

- Renders `children` (consumer-formatted value); empty → en-dash via the empty rules.
- Trailing indicator slot (right side):
  - `idle`/hover → trigger icon (default `Pencil`; consumer can override via prop/child).
  - `loading` → `Loader` (circle, sm).
  - `saved` → `Check` (success color), for `savedDuration`.
- `role="button"`, `tabIndex=0` when activatable; click / `Enter` / `Space` (or focus
  when `activationMode='focus'`) calls `edit()` from context.
- `disabled`/`readOnly` → no affordance, plain value, no trailing icon.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `triggerIcon` | `ReactNode` | `<Pencil />` | Trailing affordance icon in read mode |
| `children` | `ReactNode` | — | Formatted value display |
| `ref` / `className` | — | — | Forwarded / merged |

### `AttributeEditControl`

Edit mode container. Renders `children` **only while `editing`** (returns `null`
otherwise). Provides container-level keyboard wiring delegated to the active editor:

- `Escape` → `cancel()` (revert).
- `Enter` (when `submitMode` includes enter, and not a textarea newline) → `submit()`.
- Blur leaving the control (when `submitMode` includes blur) → `submit()`.

Manages autofocus + `selectOnFocus` on mount of the editor.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | The editor (wrapper part or any DS input) |
| `ref` / `className` | — | — | Forwarded / merged |

### `AttributeEditInput` / `AttributeEditTextarea` / `AttributeEditNumber`

Convenience editors pre-wired to context. Render the corresponding DS input
(`Input` / multiline `Input`-as-textarea or `Textarea` if present / `NumberInput`) with:

- `value` ← context draft, `onChange` → `setValue`.
- `error` ← context invalid (`status === 'error' || !!error`).
- autofocus + select-on-focus honored.
- custom sizing per Figma note ("use custom size for text + select inputs to match the
  read-row height").

Each accepts the underlying input's props (minus the wired ones), forwards `ref` and
arbitrary `data-*` to the real DOM input (metrics contract).

### `AttributeEditError`

Renders the current error message (from `error` prop or rejected async commit) below the
value, styled like the Figma error text (danger color, small). Returns `null` when there
is no error.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | context error | Override message |
| `ref` / `className` | — | — | Forwarded / merged |

### Context & hook — `useAttributeEdit()`

Public hook for composing arbitrary editors (select/date/tags/…). Returns:

```ts
interface AttributeEditContextValue<T = unknown> {
  editing: boolean;
  value: T;            // current draft
  committedValue: T;   // last committed value
  status: 'idle' | 'loading' | 'saved' | 'error';
  invalid: boolean;
  error?: string;
  disabled: boolean;
  readOnly: boolean;
  setValue: (value: T) => void;  // update draft (fires onValueChange)
  edit: () => void;              // enter edit mode
  submit: () => void;            // commit draft (runs async lifecycle)
  cancel: () => void;            // revert draft + exit edit
}
```

## Async commit lifecycle

`submit()` reads the draft and calls `onValueCommit(draft)`:

1. If the return value is a thenable → internal `status = 'loading'`; editor stays
   mounted but may be disabled; preview shows loader.
2. On resolve → commit the value, exit edit, `status = 'saved'` for `savedDuration`, then
   `'idle'`.
3. On reject → `status = 'error'`, stay in edit mode, surface the rejection message via
   `AttributeEditError` (rejection reason `.message` if string-like, else generic).
4. If the return is not a thenable (sync/void) → commit immediately, exit edit,
   `status` stays `'idle'` (no saved flash unless explicitly set).

The explicit `status` and `error` props **override** this internal machine entirely
(fully-controlled feedback). Auto-managed timers are cleared on unmount and on new
submits.

## Behavior summary

- **Enter edit:** click / Enter / Space on preview (`activationMode='click'`), or focus
  (`'focus'`), or programmatic (`'none'`). No-op when `disabled`/`readOnly`.
- **Commit:** Enter and/or blur per `submitMode` (default both). Select/date/time editors
  commit on value selection or blur.
- **Cancel:** Escape, or blur when `submitMode` excludes blur → revert + `onValueRevert`.
- **Focus:** editor autofocuses on entering edit; text content selected when
  `selectOnFocus`.
- **Orientation:** inherited; preview/error layout matches vertical (label above) and
  horizontal (label beside) rows already produced by `Attribute`.

## TestId cascade

Base testId comes from the `Attribute` root `TestIdProvider`. New slots:

| Component | TestId |
|-----------|--------|
| `AttributeEditPreview` | `{base}--edit-preview` |
| `AttributeEditControl` | `{base}--edit-control` |
| `AttributeEditInput` / `Textarea` / `Number` | `{base}--edit-input` |
| `AttributeEditError` | `{base}--edit-error` |

(`AttributeEdit` root is transparent — it does not add a DOM node beyond the context
provider, or if it does, slot `--edit`.)

## Storybook (extend `Attribute.stories.tsx`)

Category stays `Data Display/Attribute`. Add inline-edit stories:

- `InlineEditText` — text input editor (controlled value).
- `InlineEditTextarea` — multiline.
- `InlineEditNumber` — numeric (port example).
- `InlineEditSelect` — single `Select` composed via `useAttributeEdit()`.
- `InlineEditMultiSelect` — multi `Select`.
- `InlineEditTags` — tags multi-select with search.
- `InlineEditDate` / `InlineEditTime` / `InlineEditDateTime` — `DateInput`/`TimeInput`.
- `InlineEditStates` — read / hover / edit / error / loading / saved side by side.
- `InlineEditHorizontal` — horizontal orientation row.
- `InlineEditAsync` — `onValueCommit` returns a Promise → loading → saved/error.

Stories use `fn()` for handlers and a small `useState` wrapper where controlled.

## E2E (extend `Attribute.e2e.ts`)

Add a section following the `Component: Attribute` / `Visual | Interactions |
Accessibility` structure (per `docs/e2e-test-rules.md`). Use a story helper for the new
stories and `getByTestId` selectors (`attribute--edit-preview`, `--edit-input`, etc.).

**Visual** (screenshots, `animations: 'disabled'`):
- read, hover (affordance), edit (input focused), error, loading, saved — vertical;
- horizontal edit row.

**Interactions:**
- Click preview → editor appears & focused.
- Type + Enter → committed value rendered, edit closed, `onValueCommit` called.
- Type + Escape → reverts, `onValueRevert` called.
- Blur → commit (submitMode both).
- Async story: submit → loader visible → saved check → idle; rejected → error message +
  stays in edit.
- `readOnly`/`disabled` → click does not enter edit.

**Accessibility:**
- Preview is keyboard-activatable (`Enter`/`Space` enters edit).
- `Escape` cancels from the editor.
- Tab order: preview → editor → next; focus returns sensibly after commit/cancel.
- Editor has the field's accessible name (label association).

## Design decisions

1. **Lives in the `Attribute` family, not a standalone component** — the Figma node is the
   "attribute" instance, and the value already has a parallel interactive model
   (`AttributeActions`). Reusing orientation/testId/empty contexts avoids duplication.
2. **Editor is consumer-supplied** — the core owns lifecycle only, so all nine Figma value
   types compose existing DS inputs instead of being reimplemented. Convenience wrappers
   exist only for the three text-like cases.
3. **Async by Promise + override** — ergonomic default (await in `onValueCommit`) with a
   fully-controlled escape hatch (`status`/`error`) when the consumer drives feedback.
4. **Preview mirrors `AttributeActionsTarget`** — identical hover/focus visuals and
   `min-w-0` width behavior, for visual and code consistency.
5. **Metrics-ready** — no analytics-named props; editor wrappers forward arbitrary
   attributes/handlers to the real input node; preview forwards to its `role="button"`
   target.

## Affected files

- **New:** `AttributeEditContext.ts`, `AttributeEdit.tsx`, `AttributeEditPreview.tsx`,
  `AttributeEditControl.tsx`, `AttributeEditInput.tsx`, `AttributeEditTextarea.tsx`,
  `AttributeEditNumber.tsx`, `AttributeEditError.tsx` (all under `Attribute/`).
- **Edit:** `Attribute/index.ts` (exports), `Attribute.stories.tsx` (stories),
  `Attribute.e2e.ts` (+ snapshots).
- **Reuse (no change):** `Input`, `NumberInput`, `Select`, `DateInput`, `TimeInput`,
  `Tag`, `Tooltip`, `Loader`, icons (`Pencil`, `Check`, `X`), `useControlled`,
  `cn`, `testId`, `AttributeOrientationContext`, `AttributeEmptyContext`.

## Open questions

None — Slack handoff doc was inaccessible; API derived from Figma + Chakra/Ark and
confirmed during brainstorming. Prop names may be reconciled with the handoff doc later
if it surfaces, without changing the architecture.
