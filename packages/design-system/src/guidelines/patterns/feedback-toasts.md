---
title: Feedback toasts
description: Use when a mutation finishes (row menu, bulk bar, dialog confirm, autosave, test run) and the app must report the result with a transient toast.
components: [Toast, Toaster, ToastActions, Button, Alert, Banner, Dialog, FieldError]
keywords: [toast, toaster, useToast, notification, snackbar, feedback, success message, error message, loading toast, action result, confirmation message, flash message, saved, deleted]
order: 40
---

# Feedback toasts

A toast reports the result of an action the user just took, then leaves on its own.
Fire it with `useToast()`. One `Toaster` at the app root renders, stacks and times every toast.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| Confirm a finished mutation ("User deleted") | Toast, `type: 'default'` | `Alert` in the page |
| Show progress of a request that takes seconds | Toast, `type: 'loading'`, then `update` | A spinner in a `Dialog` that blocks the page |
| Report an async result (test sent, sync done) | Toast, `type: 'success'` or `type: 'error'` | `type: 'default'` |
| Offer one next step after create ("Go to destination") | Toast with `actions` | A second dialog |
| Ask the user to decide | `Dialog` | Toast with two action buttons |
| Show a result inside a form (connection test) | `Alert` in the form | Toast |
| Show standing account or system state | `Banner` | Toast with a long `duration` |
| Show a field validation error | `FieldError` under the field | Toast |

- If the message is the only place the user learns something important, do not use a toast. It disappears.
- If a `Dialog` confirmed the action, close the dialog first, then fire the toast. A confirmed delete is a finished mutation: `type: 'default'`.
- Exception: save toasts on a settings page use `type: 'success'`. See [Settings page](./settings-page.md).

## Anatomy

A toast is a dark surface with an optional icon, a title, an optional description, optional actions and a close button.

| Part | Source | Notes |
| --- | --- | --- |
| Surface | `bg-component-toast-bg`, `rounded-16`, `shadow-lg` | Dark in light theme, light in dark theme |
| Icon | Set by `type` | `default` has no icon. `loading` shows a spinner |
| Title | `title` | One line in `simple`, two lines in `extended`. Overflow shows a tooltip |
| Description | `description` | Up to four lines. Passing it forces `extended` |
| Actions | `actions`, wrapped in `ToastActions` | Small secondary buttons, `gap-4` between them |
| Close button | Added unless `closable: false` | Ghost X with a "Close" tooltip |
| Progress | Drawn behind the content | Fills over `duration`. Hidden for `loading` |

Icon by `type`:

| `type` | Icon | Use for |
| --- | --- | --- |
| `'default'` | None | Confirmation of the user's own mutation |
| `'success'` | `CircleCheck`, green | Async result that succeeded ("Test delivered via Slack") |
| `'error'` | `OctagonAlert`, red | Failed request |
| `'warning'` | `TriangleAlert`, amber | Finished with a caveat |
| `'info'` | `Info`, blue | Neutral system notice |
| `'loading'` | Spinner | Request in flight |

- If you omit `type`, the toast renders as `'info'` with the blue `Info` icon. Set `type: 'default'` for no icon.
- `icon` replaces the type icon. It inherits the type color unless it sets its own `text-*` class.

Layout by `variant`:

| `variant` | Shape | Default duration |
| --- | --- | --- |
| `'simple'` | One row: icon, title, actions, close | 5000 ms |
| `'extended'` | Column: title and description, actions under them | 10000 ms |

A `description` always selects `extended`, even with `variant: 'simple'`.

## Layout and spacing

All numbers are px. The spacing scale is 1px, so `p-24` is 24px.

| Measure | Value | Set by |
| --- | --- | --- |
| Region position | Bottom center of the viewport | `Toaster` |
| Region padding | `p-24` | `Toaster` |
| Region max width | 560 | `Toaster` |
| Gap between expanded toasts | 12 | `Toaster` (`gap: 12`) |
| Toast width | 256 min, 560 max, grows with the title | `Toast` |
| Toast padding | `p-12 pl-16` | `Toast` |
| Gap icon to text | 8 | `Toast` |
| Simple toast height | 48 | `Toast` |
| Visible toasts | 3. The 4th and later are hidden until earlier ones leave | `Toaster` |
| Layer | `--toast-z-index` (900), above every drawer and dialog | `theme/components/toast.css` |

- Toasts overlap as a stack. Hovering the region expands the stack and pauses every timer.
- **Never** wrap `Toaster` in a positioned element. It portals itself and owns its position.
- **Never** add padding, margin or width classes to toast content. `Toast` takes no `className`.

## States

| State | Call | Result |
| --- | --- | --- |
| Done | `toast.create({ title, type: 'default' })` | Plain toast, leaves after 5000 ms |
| In flight | `const id = toast.create({ title: 'Testing channel…', type: 'loading' })` | Spinner, no timer, no progress |
| Resolved | `toast.update({ id, title, type: 'success' })` | Same toast changes in place, timer starts |
| Failed | `toast.update({ id, title, type: 'error' })` | Same toast turns into an error |
| Repeated action | `toast.create({ id: 'copy-link', … })` | Updates the visible toast instead of stacking a copy |
| Dismissed by code | `toast.dismiss({ id })` | Removes one toast. `toast.dismiss()` removes all |

- If you create a `loading` toast, always resolve it with `update` or `dismiss`. It never leaves on its own.
- If the `update` adds a `description`, also pass `duration: 10000`. The timer is fixed at `create`, so it stays 5000 otherwise.
- If the user must not lose a `loading` toast, pass `closable: false`. Use it for no other type.

## Rules

### Copy

| Case | Pattern | Example |
| --- | --- | --- |
| Mutation done | `<Object> <past-tense verb>` | "User deleted", "Role assigned", "Changes saved" |
| Toggle | `<Object> enabled` / `<Object> disabled` | "Policy enabled" |
| In flight | `<Verb>ing <object>…` | "Testing channel…" |
| Async success | `<Result> via <provider>` | "Test delivered via Slack" |
| Failure | `<Action> failed — <cause>` | "Test failed — Slack rejected the request: missing API key" |
| Create with next step | Title plus a one-sentence description plus one action | "Channel created", action "Go to destination" |

- Use sentence case. **Never** end a title with a period or "!".
- Name the object type, not "Success" or "Done".
- If the cause is known, join it to the failure with an em dash.
- If the error text is long, put the action in `title` and the cause in `description`.
- **Never** pre-truncate copy. The title and description clamp and show a tooltip.

### Behavior

- Fire one toast per user action. A bulk action fires one toast for the batch ("3 users deleted").
- Use `actions` only for a next step after create. One action is the norm, two is the maximum.
- Build actions as `<Button variant='secondary' size='small' color='neutral-alt'>` inside `ToastActions`.
- **Never** put Undo, Confirm or Retry as the only path in a toast. The toast leaves before the user reads it.
- **Never** fire a toast for a field validation error or a form test result.
- **Never** mount a second `Toaster`. Every `useToast()` call shares one store.

### Imports

| Name | Import from |
| --- | --- |
| `useToast` | `@wallarm-org/design-system/Toast` |
| `Toaster`, `toaster`, `ToastActions` | `@wallarm-org/design-system` or `@wallarm-org/design-system/Toast` |

- `useToast` is not exported from the package root. Root imports of `useToast` fail.
- In components, use `useToast()`. Outside React (a query client callback), use `toaster.create(options)` and `toaster.update(id, options)`.

## Example

Mount the region once, at the app root.

```tsx
// app/App.tsx
import type { ReactNode } from 'react';
import { Toaster } from '@wallarm-org/design-system';

export const App = ({ children }: { children: ReactNode }) => (
  <>
    {children}
    <Toaster />
  </>
);
```

Report a mutation, a long request and a create with a next step.

```tsx
// features/channels/useChannelToasts.tsx
import { Button } from '@wallarm-org/design-system';
import { ToastActions, useToast } from '@wallarm-org/design-system/Toast';

interface ChannelToastsArgs {
  deleteChannel: () => Promise<void>;
  testChannel: () => Promise<void>;
  openDestination: () => void;
  provider: string;
}

export const useChannelToasts = ({
  deleteChannel,
  testChannel,
  openDestination,
  provider,
}: ChannelToastsArgs) => {
  const toast = useToast();

  const handleDelete = async () => {
    await deleteChannel();
    toast.create({ title: 'Channel deleted', type: 'default' });
  };

  const handleTest = async () => {
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

  const handleCreated = () => {
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

  return { handleDelete, handleTest, handleCreated };
};
```

## What your app owns

- The copy of every toast. The DS does not generate titles from the action.
- Calling the toast after the request resolves. `useToast` does not wrap promises.
- Resolving every `loading` toast. There is no built-in timeout for it.
- Choosing a stable `id` for actions a user can repeat (copy, save).

The DS does not provide these. Do not look for them:

- There is no placement prop. `Toaster` takes no props and always sits at the bottom center.
- There is no setting for the visible count. Three is fixed.
- There is no Undo helper and no promise helper on `useToast`.
- There is no rich `title`. `title` and `description` are strings, so no links or bold text.
- There is no `className` or `testId` option. The toast root gets `data-testid` equal to its `id`, so pass `id` to locate it in tests.
- There is no exported duration constant. Use the literals 5000 and 10000.

## Related

- [Confirmation dialogs](./confirmation-dialogs.md): the dialog that comes before most toasts.
- [Settings page](./settings-page.md): autosave fires a "<Field> updated" toast.
- [Create and edit forms](./create-edit-forms.md): the create toast with a next-step action.
- [Layering](../foundations/layering.md): why toasts paint above drawers and dialogs.
