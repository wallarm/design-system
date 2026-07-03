# InlineEdit — Commit Guard (`onBeforeValueCommit`) Design Spec

**Date:** 2026-07-03
**Ticket:** [WDS-143](https://wallarm.atlassian.net/browse/WDS-143) (continuation)
**Branch:** `feature/WDS-143`
**Predecessor:** [2026-07-03-inline-edit-extraction-design.md](./2026-07-03-inline-edit-extraction-design.md)
**References:** [MUI X `processRowUpdate`](https://mui.com/x/react-data-grid/editing/persistence/), [AntD `beforeUpload`](https://ant.design/components/upload/), [Element Plus `before-leave`](https://element-plus.org/en-US/component/tabs), [Atlassian InlineEdit](https://atlassian.design/components/inline-edit)

## Overview

InlineEdit gains one optional prop — a **commit guard** — that lets a consumer
intercept a submit before the value is committed and decide asynchronously
whether it goes through. Driving scenario: a user edits an email inline and
presses Enter; the consumer opens a confirmation dialog ("Change email to
X?"); *Confirm* commits through the normal flow, *Decline* silently keeps the
field in edit mode with the typed draft — no error state, nothing lost.

```tsx
<InlineEdit
  value={email}
  onBeforeValueCommit={async (next, prev) =>
    next === prev || confirm(`Change email to ${next}?`)
  }
  onValueCommit={v => saveEmail(v)}
>
  <InlineEditPreview />
  <InlineEditInput type='email' />
</InlineEdit>
```

The design system renders **no confirmation UI** — the guard is a seam, the
consumer brings the dialog (a Storybook story shows the recipe with `Dialog`).

### Why a guard prop and not "event + external control"

The alternative — consumer controls `value` + `edit`, treats `onValueCommit`
as a notification, and orchestrates everything outside — was verified against
the current code and **hard-breaks**, it is not merely awkward:

- With `submitMode='enter'`, the confirmation dialog's focus steal triggers
  the control's blur handler, which calls `cancel()`
  (`InlineEditControl.tsx:111`) — the draft is reset to the committed value
  and there is **no external API to restore it** (`setValue` exists only in
  context). Decline leaves the field showing the old value: the requirement
  fails outright.
- The async variant (return the dialog promise from `onValueCommit`) cannot
  express silent decline: reject → `error` status + invalid styling; resolve
  → `saved` flash + edit-mode exit. Both violate "decline is silent".
- Suppressing those visuals requires also controlling `status`/`error`, which
  disables the internal loading gate and forces every consumer to hand-roll
  re-entrancy suppression.

A guard inside `submit()` is also the only seam that uniformly covers every
commit path: Enter, blur, popover-close (Select/Date commit from
`onOpenChange` under the `'none'` submit-mode override — there is no event a
consumer could `preventDefault` on that path), and explicit confirm buttons.

Survey: no comparable library has this exact async guard (Ark/Chakra have
none; Radix-style sync `preventDefault` can't wait for a dialog; Atlassian's
`validate` surfaces errors — the opposite of silent decline). The closest
precedents are MUI X `processRowUpdate` (promise decides commit; rejection
keeps edit mode) and AntD `beforeUpload` / Element Plus `before-leave`
(explicit `false` blocks). The contract below follows them.

## Scope

**In scope:**

- New `onBeforeValueCommit` prop on `InlineEdit`, threaded through `submit()`.
- Internal commit-token mechanism (re-entrancy suppression + stale-resolution
  invalidation), spanning both the guard phase and the existing
  `onValueCommit` promise phase.
- Blur suppression in `InlineEditControl` while a guard is pending.
- Focus restoration to the editor on decline.
- Two pre-existing bug fixes the mechanism subsumes (StrictMode `mounted`
  ref; cancel-during-async-commit stale resolution).
- Storybook story (Dialog confirmation recipe), unit + integration + e2e
  tests per repo conventions.

**Out of scope (follow-ups):**

- Any built-in confirmation UI (decided: consumer-rendered).
- Refactoring `InlineEditSelect`/`InlineEditDate` to controlled `open` so a
  declined guard could re-open the popover (see Popover editors — the parked
  state is accepted and documented).
- A context `focusEditor()` escape hatch for consumers (noted as a possible
  future enhancement; not needed by this design).

## Public API

```ts
export interface InlineEditProps<T = unknown> extends TestableProps {
  // ...existing props...
  /**
   * Commit guard. Called on every submit (Enter, blur, popover close,
   * confirm button) before `onValueCommit`, with the draft to be committed
   * and the current committed value. Only an explicit `false` (or a promise
   * resolving to `false`) blocks the commit: the field silently stays in
   * edit mode with the draft. Any other result — `true`, `undefined`, no
   * return — lets the commit proceed. A rejection or a synchronous throw is
   * treated like a commit failure: status `error`, message from the error,
   * field stays in edit mode.
   *
   * While the guard's promise is pending the edit session is held: duplicate
   * submits are suppressed, blur neither submits nor cancels, and the field
   * shows no status ('idle' — the consumer's confirmation UI is the
   * feedback). Escape still cancels; a late resolution after cancel is
   * dropped. The value committed on `true` is exactly the `value` argument
   * the guard received; if the draft changed while the guard was pending,
   * the resolution is dropped and the field stays in edit mode.
   *
   * Guards must settle via non-blocking UI (a promise resolved by dialog
   * buttons). Synchronous blocking dialogs (`window.confirm`) are
   * unsupported with submitMode 'blur'/'both' (the queued blur re-prompts).
   */
  onBeforeValueCommit?: (value: T, committedValue: T) => boolean | void | Promise<boolean | void>;
}
```

**Naming.** `onBeforeValueCommit` is the before-variant of `onValueCommit`,
matching the existing family (`onValueChange` / `onValueCommit` /
`onValueRevert`) and the DOM `beforeinput → input` convention. Rejected:
`validate` (Atlassian semantics = error surface), `shouldCommit` (implies a
pure predicate; this callback's purpose is a side effect), `onCommitRequest`
(AG Grid connotation = consumer performs the commit itself).

**Signature.** New value first, committed value second — matches MUI X
`processRowUpdate(newRow, oldRow)`; `committedValue` is this component's
established term (`InlineEditContext.ts`). Bare positional args, no details
object — consistent with the family's existing divergence from Ark.

**Only explicit `false` blocks.** The runtime check is
`(await result) === false`. This matches all cited prior art and keeps the
common shape `if (next === prev) return;` working without a forced
`return true` on every path.

## Behavioral contract

### The commit token (core mechanism)

One internal ref — `pendingCommitRef: { current: symbol | null }` — owns the
whole submit lifecycle. It is the synchronous source of truth; **suppression
is never derived from `status`/`autoStatus`** (a controlled `status` prop
shadows `autoStatus`, and same-tick blur re-entry beats any state update).

`submit()`:

1. If `pendingCommitRef.current` is set, or `(status ?? autoStatus) ===
   'loading'` — return (duplicate).
2. Capture `current = draftRef.current`, create `token = Symbol()`, store it
   in the ref **before** invoking the guard (a guard that synchronously moves
   focus must not be able to re-enter past it).
3. Invoke the guard inside `try/catch`:
   - **Non-thenable result** — clear the ref; `false` → stay editing (done);
     otherwise run the commit tail **synchronously in the same tick** (the
     existing sync-commit contract must not gain a microtask window).
   - **Thenable** — keep the token until settlement. On settle, proceed only
     if `mounted.current && pendingCommitRef.current === token`; otherwise
     drop silently. Resolve `false` → clear ref, stay editing, restore focus
     to the editor. Resolve non-`false` → if `draftRef.current !== current`
     (draft diverged during pending) clear ref and stay editing; else run the
     commit tail. Reject → clear ref, `setAutoStatus('error')` +
     `setAutoError(message)`, stay editing (same mapping as `onValueCommit`
     rejection).
   - **Synchronous throw** — same as reject.
4. The commit tail is the existing body from `onValueCommit` onward,
   extracted as a local `runCommit(current, token)`. The token stays set
   through an async `onValueCommit` and is re-checked (with `mounted`) in
   both the resolve and reject handlers; cleared on settlement.

`cancel()` and `edit_()` set `pendingCommitRef.current = null` (invalidating
any in-flight resolution) in addition to their current behavior. `cancel()`
is **not** gated on pending state — Escape must always be an escape hatch; a
consumer guard that never settles must not wedge the field permanently.

### Blur while a guard is pending

`InlineEditControl`'s blur handler currently branches to `submit()` or
`cancel()` (`InlineEditControl.tsx:110-111`). Both branches are suppressed
while a guard is pending — the confirmation dialog stealing focus is
incidental, not intent. Without this, `submitMode='enter'` + modal destroys
the draft mid-confirmation (blur → `cancel()`), which is the driving scenario
itself. Because blur can fire in the same tick as the guard invocation
(before any re-render), the pending flag reaches the control synchronously: a
ref-backed `isCommitPending()` on the context, not a state field.

Escape (keydown) is deliberately **not** suppressed: it cancels, invalidates
the token, and the consumer's still-open dialog becomes inert (answering it
does nothing). The docs state that the DS never closes consumer UI and that a
guard's resolution may be ignored; the dialog's own buttons are the source of
truth for closing it.

### Status while pending

`resolvedStatus` stays `'idle'` during the guard phase. `'loading'` continues
to mean exactly "commit in flight" and is entered only when the guard has
passed and `onValueCommit` returned a thenable — unchanged from today.
Rationale: a spinner behind the consumer's modal is noise; the decline path
must be visually silent; the sync-commit tail never resets `autoStatus`, so a
borrowed `'loading'` would stick after a sync commit and render the preview
permanently inert.

### Decline UX and focus

On resolve-`false` the field silently stays in edit mode with the draft; the
DS does **not** touch focus. An early revision restored focus to the editor
on decline, but browser e2e proved it wedges the primary use case: forcing
`.focus()` on the editor races the confirmation dialog's own
focus-restore-on-close and leaves the modal stuck open. A modal `Dialog`
(Ark-based) already records the element focused when it opened — the editor —
and restores focus there on close, so the DS restore was both redundant and
harmful. It was removed (`focusEpoch` deleted from the context).

Consequence: consumers whose confirmation surface does **not** restore focus
(a non-modal banner or toast that moved focus and won't return it) own focus
management themselves. In practice the driving surface is a modal dialog,
which handles it. Blur-suppression while the guard is pending
(`isCommitPending`) is unchanged and remains the essential control-side
behavior.

### Popover editors (Select / Date / Time)

`InlineEditSelect`/`InlineEditDate` commit on popover close, so the guard
runs with the popover already closed. A declined guard leaves a **parked
state**: collapsed trigger, edit mode, draft intact; blur is inert (submit
mode `'none'`); recovery is Escape (cancel) or reopen-and-reclose (re-fires
the guard). This is accepted — it mirrors the existing async-error parked
state — and documented with a story. Reopening the popover programmatically
on decline would require controlled-`open` refactors of both editors and is
a follow-up if real usage demands it.

Two documented consumer obligations for popover editors:

- The guard fires on **every** submit, including no-op closes
  (open-then-dismiss). The story shows the equality short-circuit, with a
  date-safe comparison (`.compare()`, not `===` — fresh
  `@internationalized/date` instances every pick) and an array comparison for
  multi-select.
- Consumer dialogs should open in the next macrotask if focus races with
  zag's close-time focus restore are observed (e2e asserts focus lands in the
  modal; guidance, not DS patching).

### Custom confirm/cancel buttons (render-prop)

On Safari/macOS Firefox, buttons don't take focus on mousedown, so a click on
a render-prop cancel button first fires blur-submit (guard runs, consumer
modal opens) and then the click cancels — the user faces a dialog whose
answers do nothing. The `CustomEditor` story adds
`onMouseDown={e => e.preventDefault()}` to custom confirm/cancel buttons and
the docs recommend it — focus never leaves the input and the ordering becomes
deterministic across browsers.

## Pre-existing bugs fixed by this work

1. **StrictMode-dead `mounted` ref.** The cleanup sets `mounted.current =
   false` but the effect body never resets it to `true`; under StrictMode's
   mount→cleanup→remount the ref is permanently `false` and async commits
   never complete. Fix: `mounted.current = true` in the effect body. The
   guard continuation depends on this ref, so the fix lands first.
2. **Cancel during async commit commits anyway.** Today Escape during a
   pending `onValueCommit` promise reverts the field, yet the late resolution
   unconditionally commits and flashes `saved` (`InlineEdit.tsx:160-168`
   checks only `mounted`). The commit token spanning the commit phase fixes
   this as a side effect; a regression test pins it.

Additionally, `onBeforeValueCommit`, `onValueCommit`, and `savedDuration` are
read through latest-refs inside the continuation (the file's established
pattern — `draftRef`, `overrideRef`, `selectOnFocusRef`): a confirmation
window can stay open for minutes, and the continuation must see the
consumer's current bindings, not those captured at Enter-press time.

## Testing

Unit (`InlineEdit.test.tsx`):

- Guard absent → behavior unchanged (existing suite stays green; sync commit
  stays same-tick).
- Sync guard: `false` blocks (stay editing, draft kept, status idle);
  `true`/`undefined`/no-return proceed.
- Async guard: resolve `true` → commit tail runs (incl. async `onValueCommit`
  `loading→saved` and `loading→error` after guard-true); resolve `false` →
  silent decline; reject / sync throw → `error` status + message, stay
  editing.
- Re-entrancy: second `submit()` (Enter twice; blur during pending) → guard
  and `onValueCommit` fire exactly once — including a guard that
  synchronously steals focus.
- Invalidation: Escape during pending guard → late `true` does not commit,
  no `saved`, no `onValueCommit`; same for Escape during pending
  `onValueCommit` (pre-existing bug regression test); draft divergence during
  pending → resolution dropped.
- Controlled matrix: `edit` controlled → no `onEditChange(false)` until
  guard-true; `status` controlled + idle → still exactly one guard
  invocation despite blur re-submit.
- Unmount during pending guard → no `onValueCommit`, no state updates.

Integration (`InlineEdit.integration.test.tsx`): Dialog-driven guard —
confirm commits, decline keeps draft and returns focus to the input.

E2E (`InlineEdit.e2e.ts`, per `docs/e2e-test-rules.md`): the confirmation
story — decline keeps edit mode with draft; confirm commits; focus is inside
the modal while open and returns to the editor subtree on decline; Select +
guard decline story shows the parked state and its recovery.

## Storybook

One new story: **ConfirmCommit** — email field + DS `Dialog`, a local
`useConfirm()` helper (promise resolved by dialog buttons), the
`next === prev` short-circuit, `data-testid` on all interactive nodes (test-id
rules). The popover-editor caveats (dirty-check with date-safe compare,
parked state) land in the story docs surface alongside the existing
InlineEdit docs.
