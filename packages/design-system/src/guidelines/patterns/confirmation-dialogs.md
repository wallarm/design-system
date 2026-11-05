---
title: Confirmation dialogs
description: Use when an action deletes, disables or overwrites something, or when closing a form would lose unsaved changes, and the user must confirm first.
components: [Dialog, Drawer, Button, Input, Toast, Toaster]
keywords: [confirm, confirmation, are you sure, delete, remove, revoke, deactivate, disable, destructive, type to confirm, unsaved changes, leave without saving, discard, modal, alert dialog, ConfirmDialog]
order: 30
---

# Confirmation dialogs

A confirmation dialog asks one question about one action, then runs that action or cancels it.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| Confirm a delete, revoke or remove | Variant B, `Dialog width={400}`, destructive confirm | A toast with an Undo action |
| Confirm a state change (activate, deactivate, enable, disable) | Variant A, `Dialog width={400}` | A `Switch` that flips with no question when access is lost |
| Confirm a delete that breaks other objects | Variant C, type-to-confirm, `Dialog` with no `width` (560) | Variant B with a longer description |
| Stop a drawer or dialog closing with unsaved edits | Variant D, unsaved changes, `Dialog` with no `width` (560) | `window.confirm`, or `closeOnEscape={false}` alone |
| Continue despite a warning (duplicate name, missing dependency) | Variant E, `Dialog width={400}`, brand confirm "Create anyway" | An `Alert` the user has to dismiss first |
| Collect several fields before acting | A create or edit form, see [Create and edit forms](create-edit-forms.md) | A confirmation dialog with a form in `DialogBody` |
| Report the result of an action | A toast, see [Action-result toasts](feedback-toasts.md) | A second dialog that says "Done" |

- If the action is reversible in one click and loses no data, do not confirm it. Run it and show a toast.
- If the action loses data or access, confirm it.
- If the action also removes linked objects, use type-to-confirm.

There is no `ConfirmDialog`, `AlertDialog` or `useConfirm` in the design system. Compose `Dialog` parts as shown in the Example section.

## Anatomy

| Part | Component | Content |
| --- | --- | --- |
| Root | `Dialog` | `open`, `onOpenChange`, `width` |
| Surface | `DialogContent` | Portal, overlay, positioner and panel |
| Header | `DialogHeader` | `DialogTitle` + `DialogDescription`. Adds the close X by itself |
| Title | `DialogTitle` | The question: `<Verb> <object>?` |
| Description | `DialogDescription` | The consequence and whether it can be undone |
| Body (variant C only) | `DialogBody` | One full-width `Input` |
| Footer | `DialogFooter` | Cancel, then the confirm button, right-aligned |
| Cancel | `DialogClose asChild` wrapping `Button variant='ghost' color='neutral'` | "Cancel" ("Keep editing" in variant D) |
| Confirm | `Button` | The same verb and noun as the title |

Import every `Dialog*` part from `@wallarm-org/design-system/Dialog`. `Dialog` is not exported from the package root `@wallarm-org/design-system`.

### Variants

| Variant | `width` | Body | Footer, left to right | Confirm `color` |
| --- | --- | --- | --- | --- |
| A. State change | `400` | none | Cancel, confirm | `'brand'` to grant (Activate, Enable); `'destructive'` to take away (Deactivate, Disable) |
| B. Delete | `400` | none | Cancel, confirm | `'destructive'` |
| C. Type-to-confirm | omit (560) | `Input` with the entity name | Cancel, confirm, disabled until the input matches | `'destructive'` |
| D. Unsaved changes | omit (560) | none | "Keep editing", "Leave without saving", "Save changes" | `'brand'` on "Save changes" |
| E. Proceed anyway | `400` | none | Cancel, confirm | `'brand'` |

Every confirm button uses `variant='primary'`, the default. Every other footer button uses `variant='ghost' color='neutral'`.

## Layout and spacing

All spacing is built into the parts. Numbers are pixels: `pt-20` is 20px.

| Part | Built-in classes | Figma |
| --- | --- | --- |
| `DialogPositioner` (inside `DialogContent`) | `p-32` inset from the viewport, centered | Centered |
| `DialogContent` panel | `rounded-12 border border-border-primary-light bg-bg-surface-2 shadow-xl` | Same |
| `DialogHeader` | `pt-20 pb-16 px-24`, `gap-12` between the text block and the close X | 84px tall with a one-line description |
| `DialogTitle` | `text-lg font-medium leading-28 text-text-primary` | 18px medium |
| `DialogDescription` | `text-sm text-text-secondary` | 14px secondary |
| `DialogBody` | `px-24`, `pt-8`, `pb-8` when a footer exists | Input at x 24, full width |
| `DialogFooter` | `px-24 py-16`, `gap-8`, `justify-end` | 69px tall, buttons 36px |
| `Input` | `w-full h-36` at the default `size` | 36px input |
| `Button` | `size='large'` (36px) by default | 36px buttons |

| `width` | Use for | Figma frames |
| --- | --- | --- |
| `400` | Variants A, B and E | 400 × 153–213 |
| omit (560, the default) | Variants C and D | 560 × 153–229 |
| `960` | Never for a confirmation | Picker dialogs only |

- `width` accepts a number of pixels or a percentage string. `minWidth` defaults to 400 and `maxWidth` to 1130.
- If the description wraps to two or more lines in a 400 dialog, keep 400. The header grows in height; the width does not change.
- **Never** add `p-*`, `px-*`, `gap-*` or `space-y-*` around `DialogTitle`, `DialogDescription`, the `Input` or the footer buttons.
- **Never** wrap the footer buttons in a `div` or `HStack`. `DialogFooter` already lays them out with `gap-8`.
- **Never** pass `size` to the footer buttons. The default `large` is 36px and matches Figma.
- **Never** pass `className` to `DialogHeader`, `DialogBody` or `DialogFooter`. They accept only `children` and `ref`.

`DIALOG_SIZES` is not exported. Write the number: `width={400}`. There is no `size` prop on `Dialog`.

## States

| State | What the user sees | How to build it |
| --- | --- | --- |
| Idle | Question, consequence, Cancel and confirm enabled | Default |
| Variant C, input empty or wrong | Confirm disabled | `disabled={value !== entityName}` |
| Variant C, input matches | Confirm enabled | Exact, case-sensitive comparison |
| Pending | Confirm shows a spinner and is disabled; the dialog stays open | `loading={pending}` on the confirm `Button`; ignore close requests while pending |
| Success | The dialog closes; a toast confirms the change | `onOpenChange(false)`, then `toast.create({ title, type: 'default' })`. See [Feedback toasts](./feedback-toasts.md) |
| Failure | The dialog stays open; an error toast appears; confirm is enabled again | `toast.create({ title, type: 'error' })`, then `setPending(false)` |

- If the request is running, keep the dialog open. Close it only after the request resolves.
- If you pass `loading` to `Button`, it is also disabled. Do not pass `disabled` as well.
- If the request fails, do not close the dialog. The user can retry or cancel.
- If the dialog closes, reset the variant C input to an empty string.

## Rules

### Copy

| Part | Write | Not |
| --- | --- | --- |
| Title | "Delete user?" | "Are you sure?", "Warning", "Delete" |
| Title, unsaved changes | "Unsaved changes" | "Discard changes?" |
| Description | "This permanently deletes {user name} and all their access. You can't undo this." | "This action cannot be undone." with no object named |
| Description, reversible | "{user name} loses access until you reactivate them. Their roles and data are kept." | A description that hides what is kept |
| Confirm | "Delete user" | "OK", "Yes", "Confirm", "Delete" |
| Cancel | "Cancel" | "No", "Close", "Back" |
| Type-to-confirm placeholder | `Enter "{provider name}" to confirm` | "Type here" |
| Title, bulk | "Delete 3 users?" | "Delete user?" for several rows, "Delete selected?" |
| Description, bulk | "This permanently deletes 3 users and all their access. You can't undo this." | Naming only the first user |
| Confirm, bulk | "Delete 3 users" | "Delete", "Delete all" |
| Toast | "User deleted"; bulk: "3 users deleted" | "Success!", "User was deleted successfully." |

- Write the title as `<Verb> <object>?` in sentence case.
- Name the specific object in the description: the user, provider or rule name.
- End the description with what can be undone or what is kept. Write "You can't undo this." if nothing can be undone.
- Make the confirm label the title's verb and noun without the question mark.
- If Figma shows a confirm label that differs from the title ("Delete rule?" / "Delete permission"), use the title's noun.

### Behavior

- **Never** use `DialogClose` for the confirm button. `DialogClose` closes the dialog before the request runs.
- **Never** add a `DialogClose` to `DialogHeader`. The header adds the close X by itself.
- **Never** open a confirmation dialog from a toast or from another confirmation dialog.
- **Never** put the confirm button on the left. It is always the rightmost button.
- **Never** use `color='destructive'` for an action that grants access or creates something.
- If the dialog is opened from a `Drawer`, render the `Dialog` inside `DrawerContent`. See [Layering](../foundations/layering.md).
- If you guard unsaved changes, intercept `onOpenChange(false)` on the `Drawer`. That one handler covers the close X, `Escape` and an outside click.
- Use one controlled `open` state per dialog. Open it from the row menu, bulk bar or button that starts the action.

There is no `onConfirm`, `onCancel`, `confirmLabel`, `destructive` or `loading` prop on `Dialog`. There is no `DialogAction` or `DialogCancel` part. There is no prop that sets which element receives focus first.

## Example

### Delete (variant B)

```tsx
import { useState } from 'react';
import { Button } from '@wallarm-org/design-system';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@wallarm-org/design-system/Dialog';
import { useToast } from '@wallarm-org/design-system/Toast';

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  onDelete: () => Promise<void>;
}

export const DeleteUserDialog = ({
  open,
  onOpenChange,
  userName,
  onDelete,
}: DeleteUserDialogProps) => {
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!pending) onOpenChange(next);
  };

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

  return (
    <Dialog width={400} open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete user?</DialogTitle>
          <DialogDescription>
            This permanently deletes {userName} and all their access. You can't undo this.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='ghost' color='neutral'>
              Cancel
            </Button>
          </DialogClose>
          <Button color='destructive' loading={pending} onClick={handleDelete}>
            Delete user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

For variant A, change the copy. For Activate or Enable, omit `color`; `'brand'` is the default.

### Type-to-confirm (variant C)

```tsx
import { type ChangeEvent, useState } from 'react';
import { Button, Input } from '@wallarm-org/design-system';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@wallarm-org/design-system/Dialog';

interface DeleteProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerName: string;
  pending: boolean;
  onDelete: () => void;
}

export const DeleteProviderDialog = ({
  open,
  onOpenChange,
  providerName,
  pending,
  onDelete,
}: DeleteProviderDialogProps) => {
  const [value, setValue] = useState('');

  const handleOpenChange = (next: boolean) => {
    if (pending) return;
    if (!next) setValue('');
    onOpenChange(next);
  };

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            <Button variant='ghost' color='neutral'>
              Cancel
            </Button>
          </DialogClose>
          <Button
            color='destructive'
            disabled={value !== providerName}
            loading={pending}
            onClick={onDelete}
          >
            Delete identity provider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

### Unsaved changes guard on a drawer (variant D)

```tsx
import { type ReactNode, useState } from 'react';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@wallarm-org/design-system';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@wallarm-org/design-system/Dialog';

interface EditProviderDrawerProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDirty: boolean;
  saving: boolean;
  onSave: () => Promise<void>;
  onDiscard: () => void;
}

export const EditProviderDrawer = ({
  open,
  onOpenChange,
  isDirty,
  saving,
  onSave,
  onDiscard,
  children,
}: EditProviderDrawerProps) => {
  const [guardOpen, setGuardOpen] = useState(false);

  const handleDrawerOpenChange = (next: boolean) => {
    if (!next && isDirty) {
      setGuardOpen(true);
      return;
    }
    onOpenChange(next);
  };

  const handleLeave = () => {
    onDiscard();
    setGuardOpen(false);
    onOpenChange(false);
  };

  const handleSave = async () => {
    await onSave();
    setGuardOpen(false);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={handleDrawerOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit identity provider</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>{children}</DrawerBody>

        <Dialog open={guardOpen} onOpenChange={setGuardOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unsaved changes</DialogTitle>
              <DialogDescription>
                You have unsaved changes. Leaving will lose them unless you save.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='ghost' color='neutral'>
                  Keep editing
                </Button>
              </DialogClose>
              <Button variant='ghost' color='neutral' onClick={handleLeave}>
                Leave without saving
              </Button>
              <Button loading={saving} onClick={handleSave}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DrawerContent>
    </Drawer>
  );
};
```

Render one `Toaster` at the app root for `useToast` to work. `useToast` imports from `@wallarm-org/design-system/Toast`, not from the package root.

## What your app owns

| Concern | Owned by | Recipe with the current API |
| --- | --- | --- |
| The confirm request, `pending` state and error handling | App | `useState` + `loading` on the confirm `Button` |
| Blocking close while pending | App | Ignore `onOpenChange` calls while `pending` is true |
| Type-to-confirm matching | App | `disabled={value !== entityName}`; reset `value` on close |
| Dirty-form tracking for variant D | App | Your form library's dirty flag, passed as `isDirty` |
| Intercepting drawer close for variant D | App | Controlled `Drawer` `open` + `onOpenChange`; open the guard dialog instead of closing |
| Browser navigation away from a dirty form (route change, tab close) | App | Your router's blocker and `beforeunload`. The design system does not handle it |
| The result and error toasts | App | `useToast().create` with one `Toaster` at the root |
| All copy, including entity names in the description | App | The copy rules in the Rules section |

Gaps in the design system today:

- There is no `ConfirmDialog` block. Every app composes the eight `Dialog` parts by hand. Copy the Example section exactly.
- There is no `UnsavedChangesDialog` and no `Drawer` prop that guards dirty state. Use the variant D recipe.
- `DIALOG_SIZES` is internal. Write `width={400}` or omit `width`.
- `DialogBody` adds `pt-8` and `pb-8` around the variant C input. Figma draws the input flush with the header and footer. Keep the 8px; do not override it.
- Figma's delete-rule dialog uses the label "Delete permission" under the title "Delete rule?". The design is inconsistent; follow the copy rule.

## Related

- [Action-result toasts](feedback-toasts.md): the toast shown after a confirmed action.
- [Entity detail drawer](detail-drawer.md): the drawer that opens delete and state-change dialogs from its Actions menu.
- [Create and edit forms](create-edit-forms.md): the forms that need the unsaved changes guard.
- [Layering](../foundations/layering.md): how a `Dialog` nests inside a `Drawer`.
- [Spacing](../foundations/spacing.md): the built-in padding of `DialogHeader`, `DialogBody` and `DialogFooter`.
- [Typography](../foundations/typography.md): the title and description text styles.
