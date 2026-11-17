# Overlay manager

Describe a `Dialog` or `Drawer` once, open it from anywhere with one `await`, and load its code the first time it is needed. Import from `@wallarm-org/design-system/OverlayManager`; it is not exported from the package root.

## When to use

Use it for an overlay that several places open (a delete confirm reached from a row menu, a detail drawer and a bulk bar) or one heavy enough to load lazily. For a dialog that only one control opens, keep a plain controlled `Dialog` with its own `open` state: it is simpler.

## Set up

Mount one `OverlayProvider` per app and one per remote, in the root route component, wrapping everything that route renders, not only `<Outlet />`. Code outside it cannot call `useOverlay`.

```tsx
// routes/__root.tsx
import { Outlet, useMatches } from '@tanstack/react-router';
import { OverlayProvider } from '@wallarm-org/design-system/OverlayManager';
import { useToast } from '@wallarm-org/design-system/Toast';

const RootRoute = () => {
  const toast = useToast();
  const matches = useMatches();
  const orgId = useOrgId();

  const handleOverlayError = (error: unknown) => {
    captureException(error);
    toast.create({ type: 'error', title: "Couldn't open this dialog" });
  };

  return (
    <OverlayProvider closeOnChange={`${orgId}:${matches.at(-1)?.id}`} onError={handleOverlayError}>
      <AppShell>
        <Outlet />
      </AppShell>
    </OverlayProvider>
  );
};
```

- `closeOnChange` closes every overlay opened before its value changed, so a page change leaves no dialog of the old page on screen. Pass a string or number key that changes when the new page commits. On TanStack Router derive it from the matches, not from `location`: `location` changes when navigation starts, while the old page is still on screen and clickable. Add the org id to close on a tenant switch too, and check the key in a browser.
- A change closes the overlays that were open and cancels the ones still loading. Overlays opened after it are left alone. Without the prop, overlays stay open across navigation.
- A key that goes from `undefined` to its first value counts as a change and closes everything open, so pass the key from the first render.
- An `open()` called from a descendant's layout effect in the same commit as a `closeOnChange` change is closed with the rest. An `open()` from a mount `useEffect` survives, so open on arrival from an effect. Under StrictMode, React runs that effect twice in development: one overlay opens, and the first run's `open()` resolves `undefined`. Ignore that result with a flag that the effect's cleanup sets, as when fetching data in an effect.
- `onError` receives loader and render errors, and that overlay's `open()` resolves `undefined`. Report the error and show a toast; the default is `reportError`.

## Define an overlay

An overlay is a component that takes `OverlayProps<Result>` plus its payload props and renders one `Dialog` or `Drawer`.

```tsx
// features/users/DeleteUserDialog.tsx
import type { OverlayProps } from '@wallarm-org/design-system/OverlayManager';

interface DeleteUserDialogProps extends OverlayProps<boolean> {
  userId: string;
  userName: string;
}

export const DeleteUserDialog: FC<DeleteUserDialogProps> = ({ userId, userName, controller }) => {
  const deleteUser = useDeleteUser();
  const toast = useToast();

  const handleOpenChange = (open: boolean) => {
    if (!deleteUser.isPending) controller.rootProps.onOpenChange(open);
  };

  const handleConfirm = async () => {
    try {
      await deleteUser.mutateAsync(userId);
      controller.close(true);
    } catch {
      toast.create({ type: 'error', title: "Couldn't delete the user" });
    }
  };

  return (
    <Dialog {...controller.rootProps} onOpenChange={handleOpenChange} width={400}>
      <DialogContent>{/* title, description, Cancel in DialogClose, confirm with handleConfirm */}</DialogContent>
    </Dialog>
  );
};
```

- `controller` carries `rootProps` (`open`, `onOpenChange`, `onExitComplete`) and `close(result)`. Spread `controller.rootProps` onto the root.
- Render exactly one root, on every render, from the first to the last. No early return, no conditional root, nothing that suspends above it. Loading, error and not-found states go inside `DialogBody` or `DrawerBody`. An overlay that decides not to show calls `controller.close()` from an effect or a handler.
- Render the title from the first frame, with placeholder text while data loads.
- Guard dismissal by wrapping `onOpenChange`, and call `controller.rootProps.onOpenChange(false)` only when closing is allowed: not while a request is pending or the form is dirty. Escape, an outside click and the close X all go through it.
- `controller.close(result)` settles the `open()` promise with `result`. Dismissal settles it with `undefined`.
- An overlay reads the React context above `OverlayProvider`, not the context of the component that opened it. Put the providers it needs above `OverlayProvider`, and pass page data in the payload or fetch it by id inside the overlay. A hook that needs a page-level provider (filters, selection, a form) either throws, which reaches `onError`, or reads that context's default value.
- Pass ids in the payload and use no route-scoped router hooks: a closing overlay keeps rendering after the page has changed. `useNavigate`, `useRouter` and `strict: false` hooks are fine.
- An overlay that navigates calls `controller.close(result)` first, so that a `closeOnChange` change does not settle it with `undefined` before it.
- A dialog the overlay itself needs, such as a nested confirm, renders inside the root's content as React children or opens as a managed overlay from inside. Never render it as a sibling of the root: its exit is cut when the instance is removed.

Collect the definitions in a small module:

```ts
// features/users/overlays.ts
import { defineOverlay } from '@wallarm-org/design-system/OverlayManager';

export const DeleteUserOverlay = defineOverlay(() =>
  import('./DeleteUserDialog').then(m => m.DeleteUserDialog),
);
```

- The loader returns the component itself, never `React.lazy`: `React.lazy` keeps a failed chunk forever, and a failed load here clears so the next `open()` retries. An eager definition is `defineOverlay(async () => Component)`.
- Create definitions at module scope, never during render: the code cache and the double-click rule belong to the definition object.
- Importing the module loads no overlay code.

## Open it

`useOverlay(definition)` returns `{ open }`. Await it:

```tsx
const deleteUser = useOverlay(DeleteUserOverlay);

const handleDelete = async () => {
  const deleted = await deleteUser.open({ userId, userName });
  if (deleted) toast.create({ type: 'default', title: 'User deleted' });
};
```

- `open()` never rejects. It resolves with the value passed to `controller.close`, or with `undefined` when the user dismisses the overlay, a `closeOnChange` change closes it, the provider unmounts, or its code fails to load or render. The caller cannot tell a failed load from a dismissal; `onError` gets the failure.
- It resolves when closing starts, not after the exit animation, so chained flows feel instant: `if (await confirm.open()) await next.open()`.
- The overlay keeps the payload it was opened with. If the opener unmounts first, such as a menu item, the overlay stays open and the original `await` still resolves.
- A second `open()` of the same definition in the same provider while the first is still loading, including in the same tick, replaces it, and the first resolves `undefined`. Once the code is loaded every call opens another instance and they stack, so guard a double Escape or click with a pending flag.
- `definition.preload()` loads the code ahead of time and never rejects. Call it when the opener is hovered or focused:

```tsx
const handlePreload = () => DeleteUserOverlay.preload();

return (
  <Button onPointerEnter={handlePreload} onFocus={handlePreload} onClick={handleDelete}>
    Delete user
  </Button>
);
```

## Nesting

- Overlays of one provider are siblings, stacked in open order. `useOverlay` inside an overlay opens another sibling in the same provider, above it: the edit drawer in the stories opens its delete confirm and its unsaved-changes guard that way.
- Compared with overlays nested as React children, app-level overlays lose same-kind push-back and cascade-dismiss. When a lower overlay closes from outside (its root unmounts, or its controlled `open` flips, like a router-owned drawer on Back), a managed overlay above it stays open.
- A drawer that can close from outside, such as a router-owned detail drawer, and that opens managed overlays mounts its own `OverlayProvider` inside `DrawerContent`:

```tsx
<Drawer open={Boolean(userId)} onOpenChange={handleDrawerOpenChange}>
  <DrawerContent>
    <OverlayProvider closeOnChange={userId}>
      <UserDrawerHeader userId={userId} />
    </OverlayProvider>
  </DrawerContent>
</Drawer>
```

Overlays opened through it are React descendants of the drawer's content, so they close with it, cascade-dismiss and push-back work as usual, and switching entities closes them. Call `useOverlay` in a component rendered inside that provider, such as the actions menu in `UserDrawerHeader`. A call in the drawer's top-level hook, above `<Drawer>`, resolves to the app's provider and brings the problem back.

## Limits

- A remote without its own provider falls through to the host's. When the host and the remote share the design-system module, a remote's `useOverlay` finds any provider of the same design-system version above it, and the overlay renders with the host's contexts (query client, router), not the remote's. It throws `useOverlay must be used inside an <OverlayProvider>` only when none is above, so mount one provider per remote.
- Focus return is unchanged from a controlled `Dialog`. With no trigger, focus returns to the element that had it when the overlay opened: the clicked button in Chrome, `body` in Safari. When a menu item opened it, focus currently lands on `body` (seen in Chromium, the same as a controlled `Dialog`). That is an open design-system finding, tracked in `docs/storybook-docs-findings.md`.
- Test ids repeat during an exit. A closing instance stays mounted while it animates out, so a reopen inside that window, or two stacked instances of one definition, share ids such as `{id}--content`. Wait for the closing content to detach before reopening, or target the open instance.
- A `closeOnChange` change and a provider unmount force the close, and a guard cannot veto them. For a route change from a dirty form, use your router's blocker.
