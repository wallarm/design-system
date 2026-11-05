---
title: Confirmation dialogs
description: Use when an action deletes, disables or overwrites something, or when closing a form would lose unsaved changes, and the user must confirm first.
components: [Dialog, Drawer, Button, Input, Toast, Toaster]
keywords: [confirm, confirmation, are you sure, delete, remove, revoke, deactivate, disable, destructive, type to confirm, unsaved changes, leave without saving, discard, modal, alert dialog, ConfirmDialog]
order: 30
---

# Confirmation dialogs

A confirmation dialog asks one question about one action, then runs that action or cancels it. Compose it from `Dialog` parts. There is no `ConfirmDialog`, `AlertDialog`, `useConfirm` or `UnsavedChangesDialog`.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| Delete, revoke, deactivate, disable | `Dialog width={400}`, confirm `color='destructive'` | A toast with Undo, or a `Switch` that silently removes access |
| Activate or enable | `Dialog width={400}`, default brand confirm | `color='destructive'` |
| Delete that also breaks linked objects | Type-to-confirm: no `width` (560) + `Input` | A longer description |
| Closing a drawer with unsaved edits | Unsaved-changes guard, no `width` (560) | `window.confirm` or `closeOnEscape={false}` |
| Continue despite a warning | `Dialog width={400}`, brand "Create anyway" | An `Alert` to dismiss first |
| Reversible action that loses no data | No dialog; run it and show a toast | A confirmation |
| Several fields before acting | [Create and edit forms](create-edit-forms.md) | A form inside `DialogBody` |
| Report the result | A toast | A second dialog that says "Done" |

## Rules

### Structure

- Import every `Dialog*` part from `@wallarm-org/design-system/Dialog`. `Dialog` is not exported from the package root.
- Use `width={400}` for delete, state change and proceed-anyway. Omit `width` (560) for type-to-confirm and unsaved changes. **Never** use `960` for a confirmation.
- Write the width as a number; `DIALOG_SIZES` and a `size` prop do not exist. If the description wraps, keep 400.
- Footer order, left to right: Cancel, then confirm. The confirm button is always rightmost.
- Confirm buttons use the default `variant='primary'`. Every other footer button is `variant='ghost' color='neutral'`.
- **Never** use `color='destructive'` for an action that grants access or creates something.
- Wrap Cancel in `DialogClose asChild`. **Never** wrap the confirm button in `DialogClose`: it closes the dialog before the request runs.
- **Never** add a close button to `DialogHeader`. It renders the close X itself.
- There is no `onConfirm`, `onCancel`, `confirmLabel`, `destructive` or `loading` prop on `Dialog`, no `DialogAction`/`DialogCancel`, and no initial-focus prop.

### Spacing

- The parts own all padding (header `pt-20 pb-16 px-24`, body `px-24 py-8`, footer `px-24 py-16 gap-8`). Keep the body's 8px though Figma draws the input flush.
- **Never** add `p-*`, `gap-*` or `space-y-*` around dialog content, wrap footer buttons in a `div`/`HStack`, or pass `size` to them (default 36px).
- **Never** pass `className` to `DialogHeader`, `DialogBody` or `DialogFooter`. They take only `children` and `ref`.

### Behavior

- While the request runs, pass `loading={pending}` to confirm (it also disables it; do not add `disabled={pending}`) and ignore close requests. Close only on success; on failure keep it open with an error toast.
- If the dialog closes, reset the type-to-confirm input to `''`. Match the entity name exactly, case-sensitive.
- If the dialog opens from a `Drawer`, render it inside `DrawerContent`. See [Layering](../foundations/layering.md).
- To guard unsaved changes, intercept `onOpenChange(false)` on the `Drawer`. One handler covers the close X, `Escape` and outside click.
- **Never** open a confirmation from a toast or from another confirmation.
- Use one controlled `open` state per dialog, set by the control that starts the action.

### Copy

| Part | Write | Not |
| --- | --- | --- |
| Title | "Delete user?" / bulk "Delete 3 users?" | "Are you sure?", "Warning", "Delete", "Delete selected?" |
| Title, unsaved changes | "Unsaved changes" | "Discard changes?" |
| Description | "This permanently deletes {name} and all their access. You can't undo this." | "This action cannot be undone." with no object named |
| Description, bulk | "This permanently deletes 3 users and all their access. You can't undo this." | Naming only the first user |
| Description, reversible | "{name} loses access until you reactivate them. Their roles and data are kept." | Hiding what is kept |
| Confirm | "Delete user" / bulk "Delete 3 users" | "OK", "Yes", "Confirm", "Delete", "Delete all" |
| Cancel | "Cancel" | "No", "Close", "Back" |
| Footer, unsaved changes | "Keep editing", "Leave without saving" (both ghost neutral), "Save changes" (brand) | "Cancel" |
| Type-to-confirm placeholder | `Enter "{name}" to confirm` | "Type here" |
| Toast | "User deleted" / "3 users deleted" | "Success!", "User was deleted successfully." |

- Title is `<Verb> <object>?` in sentence case. Confirm repeats that verb and noun without `?`.
- Name the specific object in the description, and end with what can be undone or what is kept. If nothing can be undone, write "You can't undo this."
- If Figma's confirm label differs from the title ("Delete rule?" / "Delete permission"), use the title's noun.

## Examples

A delete confirmation with pending, success and failure handling.

```tsx
const handleDelete = async () => {
  setPending(true);
  try {
    await onDelete();
    onOpenChange(false);
    toast.create({ title: 'User deleted', type: 'default' });
  } catch {
    toast.create({ title: "Couldn't delete user", type: 'error' });
  } finally {
    setPending(false);
  }
};

<Dialog width={400} open={open} onOpenChange={next => !pending && onOpenChange(next)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete user?</DialogTitle>
      <DialogDescription>
        This permanently deletes {userName} and all their access. You can't undo this.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant='ghost' color='neutral'>Cancel</Button>
      </DialogClose>
      <Button color='destructive' loading={pending} onClick={handleDelete}>Delete user</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

A state change that grants access uses the default brand confirm.

```tsx
<DialogFooter>
  <DialogClose asChild>
    <Button variant='ghost' color='neutral'>Cancel</Button>
  </DialogClose>
  <Button loading={pending} onClick={handleActivate}>Activate user</Button>
</DialogFooter>
```

Type-to-confirm omits `width` and keeps confirm disabled until the name matches.

```tsx
<Dialog open={open} onOpenChange={handleOpenChange /* resets value to '' on close */}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete identity provider?</DialogTitle>
      <DialogDescription>
        "{providerName}" is unlinked and deleted, along with its rules. You can't undo this.
      </DialogDescription>
    </DialogHeader>
    <DialogBody>
      <Input
        aria-label='Provider name'
        placeholder={`Enter "${providerName}" to confirm`}
        value={value}
        onChange={handleValueChange}
      />
    </DialogBody>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant='ghost' color='neutral'>Cancel</Button>
      </DialogClose>
      <Button color='destructive' disabled={value !== providerName} loading={pending} onClick={onDelete}>
        Delete identity provider
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

An unsaved-changes guard intercepts the drawer's close and renders the dialog inside `DrawerContent`.

```tsx
const handleDrawerOpenChange = (next: boolean) => {
  if (!next && isDirty) return setGuardOpen(true);
  onOpenChange(next);
};

<Drawer open={open} onOpenChange={handleDrawerOpenChange}>
  <DrawerContent>
    <DrawerHeader><DrawerTitle>Edit identity provider</DrawerTitle></DrawerHeader>
    <DrawerBody>{children}</DrawerBody>
    <Dialog open={guardOpen} onOpenChange={setGuardOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unsaved changes</DialogTitle>
          <DialogDescription>You have unsaved changes. Leaving will lose them unless you save.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='ghost' color='neutral'>Keep editing</Button>
          </DialogClose>
          <Button variant='ghost' color='neutral' onClick={handleLeave}>Leave without saving</Button>
          <Button loading={saving} onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </DrawerContent>
</Drawer>
```

## States

| State | Show | Example component |
| --- | --- | --- |
| Idle | Question, consequence, Cancel and confirm enabled | `Dialog` |
| Type-to-confirm, empty or wrong | Confirm disabled | `Button disabled={value !== name}` |
| Type-to-confirm, matches | Confirm enabled | `Button` |
| Pending | Spinner on confirm, dialog stays open, close ignored | `Button loading={pending}` |
| Success | Dialog closes, then a toast | `toast.create({ type: 'default' })` |
| Failure | Dialog stays open, error toast, confirm enabled again | `toast.create({ type: 'error' })` |

## What your app owns

- The request, `pending` state, error handling and blocking close while pending.
- Type-to-confirm matching and resetting the input on close.
- Dirty tracking (your form library's flag) and intercepting the drawer close.
- Route changes and tab close from a dirty form: use your router's blocker and `beforeunload`. The design system does not handle them.
- Result toasts: `useToast` from `@wallarm-org/design-system/Toast`, with one `Toaster` at the app root.
- All copy, including entity names.

## Related

- [Action-result toasts](feedback-toasts.md): the toast after a confirmed action.
- [Entity detail drawer](detail-drawer.md): opens delete and state-change dialogs from its Actions menu.
- [Create and edit forms](create-edit-forms.md): forms that need the unsaved-changes guard.
- [Layering](../foundations/layering.md): nesting a `Dialog` inside a `Drawer`.
- [Spacing](../foundations/spacing.md) and [Typography](../foundations/typography.md): the dialog's built-in padding and text styles.
