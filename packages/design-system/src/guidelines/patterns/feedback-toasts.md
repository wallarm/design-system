---
title: Feedback toasts
description: Use when a mutation finishes (row menu, bulk bar, dialog confirm, autosave, test run) and the app must report the result with a transient toast.
components: [Toaster, ToastActions, Button, Alert, Banner, Dialog, FieldError]
keywords: [toast, toaster, useToast, notification, snackbar, feedback, success message, error message, loading toast, action result, confirmation message, flash message, saved, deleted]
order: 40
---

# Feedback toasts

A toast reports the result of the user's last action, then leaves on its own.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| Confirm a finished mutation ("User deleted") | Toast, `type: 'default'` | `Alert` in the page |
| Show progress of a request that takes seconds | Toast, `type: 'loading'`, then `update` | A spinner in a blocking `Dialog` |
| Report an async result (test sent, sync done) | Toast, `type: 'success'` or `'error'` | `type: 'default'` |
| Offer one next step after create | Toast with `actions` | A second dialog |
| Ask the user to decide | `Dialog` | Toast with two action buttons |
| Show a result inside a form (connection test) | `Alert` in the form | Toast |
| Show standing account or system state | `Banner` | Toast with a long `duration` |
| Show a field validation error | `FieldError` under the field | Toast |

If the message is the only place the user learns something important, do not use a toast. It disappears.

## Rules

### Type and layout

- If the user's own mutation finished, use `type: 'default'` (no icon). A delete confirmed in a `Dialog` is a finished mutation.
- Otherwise use `'success'`, `'error'`, `'warning'` (finished with a caveat) or `'info'` (neutral notice).
- Exception: save toasts on a settings page use `type: 'success'`. See [Settings page](./settings-page.md).
- **Always** set `type`. Without it the toast renders as `'info'` with a blue icon.
- A `description` always switches to the `extended` layout (title over description, 10000 ms), even with `variant: 'simple'`. Without it the toast is one 48px row, 5000 ms.
- `icon` replaces the type icon and takes the type color unless it sets its own `text-*` class.

### Placement and spacing

- `Toaster` owns position (bottom center), 24px padding, 12px gaps and layering above every drawer and dialog. **Never** wrap it in a positioned element.
- `Toast` owns its padding and width (256–560px). **Never** add spacing or width to toast content.
- Three toasts show at once; hover expands the stack and pauses every timer.
- **Never** mount a second `Toaster`.

### Loading and updates

- If you create a `loading` toast, **always** resolve it with `update` or `dismiss`. It has no timer and never leaves on its own.
- If an `update` adds a `description`, also pass `duration: 10000`. The timer is fixed at `create`.
- Pass `closable: false` only to a `loading` toast the user must not lose.
- If the user can repeat an action (copy, save), pass a stable `id` so the toast updates instead of stacking.

### Copy

| Case | Pattern | Example |
| --- | --- | --- |
| Mutation done | `<Object> <past-tense verb>` | "User deleted", "Changes saved" |
| Toggle | `<Object> enabled` / `disabled` | "Policy enabled" |
| In flight | `<Verb>ing <object>…` | "Testing channel…" |
| Async success | `<Result> via <provider>` | "Test delivered via Slack" |
| Failure | `<Action> failed — <cause>` | "Test failed — Slack rejected the request: missing API key" |
| Create with next step | Title, one-sentence description, one action | "Channel created" + "Go to destination" |

- Use sentence case and name the object, not "Success" or "Done". **Never** end a title with a period or "!".
- If the error text is long, put the action in `title` and the cause in `description`.
- **Never** pre-truncate copy; it clamps with a tooltip.

### Behavior

- Fire one toast per user action. A bulk action fires one toast for the batch ("3 users deleted").
- If a `Dialog` confirmed the action, close the dialog first, then fire the toast.
- Use `actions` only for a next step after create, one action (two max), each a `<Button variant='secondary' size='small' color='neutral-alt'>` inside `ToastActions`.
- **Never** make Undo, Confirm or Retry available only in a toast.

### Imports

- Import `useToast` from `@wallarm-org/design-system/Toast`. It is not exported from the package root.
- Outside React, use `toaster.create(options)` and `toaster.update(id, options)`.

## Examples

Mount the region once, at the app root.

```tsx
import type { ReactNode } from 'react';
import { Toaster } from '@wallarm-org/design-system';

export const App = ({ children }: { children: ReactNode }) => (
  <>
    {children}
    <Toaster />
  </>
);
```

Confirm a finished mutation with a plain toast.

```tsx
import { useToast } from '@wallarm-org/design-system/Toast';

export const useDeleteChannel = (deleteChannel: () => Promise<void>) => {
  const toast = useToast();

  return async () => {
    await deleteChannel();
    toast.create({ title: 'Channel deleted', type: 'default' });
  };
};
```

Turn a loading toast into the result in place, and extend the timer when the error adds a description.

```tsx
import { useToast } from '@wallarm-org/design-system/Toast';

export const useTestChannel = (testChannel: () => Promise<void>, provider: string) => {
  const toast = useToast();

  return async () => {
    const id = toast.create({ title: 'Testing channel…', type: 'loading' });
    try {
      await testChannel();
      toast.update({ id, title: `Test delivered via ${provider}`, type: 'success' });
    } catch (error) {
      toast.update({
        id,
        title: 'Test failed',
        description: error instanceof Error ? error.message : undefined,
        type: 'error',
        duration: 10000,
      });
    }
  };
};
```

Offer one next step after create.

```tsx
import { Button } from '@wallarm-org/design-system';
import { ToastActions, useToast } from '@wallarm-org/design-system/Toast';

export const useChannelCreated = (openDestination: () => void) => {
  const toast = useToast();

  return () =>
    toast.create({
      title: 'Channel created',
      description: 'Route notifications through this channel in a destination.',
      type: 'default',
      actions: (
        <ToastActions>
          <Button variant='secondary' size='small' color='neutral-alt' onClick={openDestination}>
            Go to destination
          </Button>
        </ToastActions>
      ),
    });
};
```

Reuse an `id` so repeated clicks update one toast instead of stacking.

```tsx
import { useToast } from '@wallarm-org/design-system/Toast';

export const useCopyLink = (link: string) => {
  const toast = useToast();

  return async () => {
    await navigator.clipboard.writeText(link);
    toast.create({ id: 'copy-link', title: 'Link copied', type: 'default' });
  };
};
```

## States

| State | Show | Example component |
| --- | --- | --- |
| Done | Plain toast, leaves after 5000 ms | `toast.create({ title, type: 'default' })` |
| In flight | Spinner, no timer, no progress bar | `toast.create({ title, type: 'loading' })` |
| Resolved | Same toast changes in place, timer starts | `toast.update({ id, title, type: 'success' })` |
| Failed | Same toast turns into an error | `toast.update({ id, title, type: 'error' })` |
| Repeated action | Visible toast updates, no copy | `toast.create({ id: 'copy-link', … })` |
| Dismissed by code | One toast removed, or all | `toast.dismiss({ id })`, `toast.dismiss()` |

## What your app owns

- Toast copy, firing after the request resolves, resolving every `loading` toast, and stable ids.

These do not exist:

- Placement or visible-count props. `Toaster` takes no props.
- An Undo helper or a promise helper on `useToast`.
- Rich text. `title` and `description` are strings.
- `className` or `testId` options. The toast root gets `data-testid` equal to its `id`, so pass `id` to locate it in tests.
- An exported duration constant. Use the literals 5000 and 10000.

## Related

- [Confirmation dialogs](./confirmation-dialogs.md): the dialog before most toasts.
- [Settings page](./settings-page.md): autosave fires a "<Field> updated" toast.
- [Create and edit forms](./create-edit-forms.md): the create toast with a next-step action.
- [Layering](../foundations/layering.md): why toasts paint above drawers and dialogs.
