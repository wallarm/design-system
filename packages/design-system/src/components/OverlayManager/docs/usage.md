# Overlay manager

Describe a `Dialog` or `Drawer` once, open it from anywhere with one `await`, and load its code the first time it is needed. Import from `@wallarm-org/design-system/OverlayManager`; it is not exported from the package root.

## When to use

Use it for an overlay that several places open (a delete confirm reached from a row menu, a detail drawer and a bulk bar) or one heavy enough to load lazily. For a dialog that only one control opens, keep a plain controlled `Dialog` with its own `open` state: it is simpler.

## Set up

Mount one `OverlayProvider` per app and one per remote, in the root route component: inside every provider its overlays need (query client, router, SDK context), including the ones that component renders itself, and around everything it renders, not only `<Outlet />`. Outside every provider `useOverlay` throws, but a remote without its own provider silently uses the host's (see Limits).

```tsx
// routes/__root.tsx
import { Outlet, useMatches } from '@tanstack/react-router';
import { OverlayProvider } from '@wallarm-org/design-system/OverlayManager';
import { useToast } from '@wallarm-org/design-system/Toast';

const RootRoute = () => {
  const toast = useToast();
  const pathname = useMatches({ select: matches => matches.at(-1)?.pathname });
  const orgId = useOrgId();

  const handleOverlayError = (error: unknown) => {
    captureException(error);
    toast.create({ type: 'error', title: "Couldn't open this dialog" });
  };

  return (
    <OverlayProvider closeOnChange={`${orgId}:${pathname}`} onError={handleOverlayError}>
      <AppShell>
        <Outlet />
      </AppShell>
    </OverlayProvider>
  );
};
```

- `closeOnChange` closes every overlay opened before its value changed, so a page change leaves no dialog of the old page on screen. Pass a string or number key that changes when the new page commits. On TanStack Router derive it from the matches, not from `location`: `location` changes when navigation starts, while the old page is still on screen and clickable. Use the leaf match's `pathname`, not its `id`: a match id also carries the route's `loaderDeps`, so a change to a search param they read (`?page=2`) would close every overlay on the same page. Add the org id to close on a tenant switch too.
- A change closes the overlays that were open and cancels the ones still loading. Overlays opened after it are left alone. Without the prop, overlays stay open across navigation.
- A key that goes from `undefined` to its first value counts as a change and closes everything open, so pass the key from the first render.
- An `open()` that runs in the commit of a `closeOnChange` change before the provider's layout effect is closed with the rest: from a descendant's layout effect, a ref callback or `componentDidMount`. An `open()` from a mount `useEffect` survives, so open on arrival from a `useEffect`.
- React can run that effect again without a remount: twice under StrictMode in development, after a Suspense boundary above hides and reveals it (layout effects, in production too), and when an `<Activity>` shows it again. Each run opens another copy, so open on arrival once per mount, with a ref (`welcome` is a `useOverlay` result): `const opened = useRef(false); useEffect(() => { if (opened.current) return; opened.current = true; welcome.open(); }, [welcome]);`
- `onError` receives loader and render errors, and that overlay's `open()` resolves `undefined`. Report the error and show a toast; the default is `reportError`. A nested provider without `onError` reports through the enclosing one's. React also passes a render error to the root's `onCaughtError`, so if the app reports there too, report render errors in one place only.
- An error thrown while an overlay unmounts (an effect cleanup, a ref callback) and an `onError` that throws are not kept local: they reach the nearest error boundary above `OverlayProvider`. Keep an error boundary (the root route's `errorComponent`) above it.

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
      toast.create({ type: 'default', title: 'User deleted' });
      controller.close(true);
    } catch {
      toast.create({ type: 'error', title: "Couldn't delete the user" });
    }
  };

  return (
    <Dialog {...controller.rootProps} onOpenChange={handleOpenChange} width={400}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete user?</DialogTitle>
        </DialogHeader>
        {/* DialogBody with the description; DialogFooter with Cancel in DialogClose and the
            confirm button with loading={deleteUser.isPending} calling handleConfirm */}
      </DialogContent>
    </Dialog>
  );
};
```

- `controller` carries `rootProps` (`open`, `onOpenChange`, `onExitComplete`) and `close(result)`. Spread `controller.rootProps` onto the root. Override only `onOpenChange`, to guard; your own `onExitComplete` must call `controller.rootProps.onExitComplete()` too, or the closed overlay stays mounted until the 1 s fallback.
- Render exactly one root at the component's top level, the same one from the first render to the last: no early return, no conditional root, no wrapper whose key or type changes, nothing that suspends above it. Loading, error and not-found states go inside `DialogBody` or `DrawerBody`. An overlay that decides not to show calls `controller.close()` from an effect or a handler.
- Code that suspends inside the overlay (`useSuspenseQuery`, `use()`, a `React.lazy` tab) needs its own `<Suspense>` inside the content, below the header, such as inside `DialogBody` or `DrawerBody` (`lazyOverlayBody` brings one for the part it loads), and no Suspense boundary may sit between the root and its content. Without one, the overlay's own boundary catches the suspension and hides the whole overlay until it resolves.
- Render the title from the first frame, with placeholder text while data loads.
- Guard dismissal by wrapping `onOpenChange`: ignore it while a request is pending, ask first while the form is dirty, and end every path by closing, with `controller.rootProps.onOpenChange(false)` or, after the guard's Leave, `controller.close()`. A wrapper that never closes leaves the overlay on screen and its `open()` pending. Escape, an outside click and the close X all go through it.
- `controller.close(result)` settles the `open()` promise with `result`. Dismissal settles it with `undefined`. Close with a plain value, never a promise: `open()` would follow it, and its rejection would reject `open()`.
- Do the work that must follow a success inside the overlay, such as the success toast: a `closeOnChange` change or a provider unmount resolves `open()` with `undefined` even when the request then succeeds.
- An overlay reads the React context above `OverlayProvider`, not the context of the component that opened it. Put the providers it needs above `OverlayProvider`. Pass page-level data it cannot read itself (filters, selection) in the payload, and fetch live data by id inside the overlay: the payload is a snapshot taken at `open()`, so a query result passed in it goes stale. Through the root-route provider, a hook that needs a page-level provider (filters, selection, a form) either throws, which reaches `onError`, or reads that context's default value.
- The payload is spread as props: pass a plain object. A class instance loses its prototype getters and methods.
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
- Importing the module loads no overlay code. A split overlay's definition sits next to its light shell and loads that shell (see Show a skeleton while it loads).

## Open it

`useOverlay(definition)` returns `{ open }`. Await it:

```tsx
const deleteUser = useOverlay(DeleteUserOverlay);

const handleDelete = async () => {
  const deleted = await deleteUser.open({ userId, userName });
  if (deleted) clearSelection();
};
```

- `open()` never rejects. It resolves with the value passed to `controller.close`, or with `undefined` when the user dismisses the overlay, a `closeOnChange` change closes it, the provider unmounts, or its code fails to load or render. The caller cannot tell a failed load from a dismissal; `onError` gets the failure.
- It resolves when closing starts, not after the exit animation, so chained flows feel instant: `if (await confirm.open()) await next.open()`.
- Await it in an event handler, not inside `startTransition`, a form action or `useActionState`: React would hold that transition, and every other one in the app, until the overlay closes. Start the transition after it resolves: `if (await confirm.open()) startTransition(async () => { await deleteUser(id); })`.
- The overlay keeps the payload it was opened with. If the opener unmounts first, such as a menu item, the overlay stays open and the original `await` still resolves.
- A second `open()` of the same definition in the same provider replaces the first until the store has inserted it, and the first resolves `undefined`: while its code loads, and even with the code cached for a call in the same synchronous code (such as StrictMode's doubled effect) or a microtask or two later. Later calls each open another instance and they stack, so guard a double Escape or click with a pending flag.
- `definition.preload()` loads the code ahead of time and never rejects. Call it when the opener is hovered or focused, and for an overlay with no opener to hover (the next step of a chained flow, an overlay opened from inside another) when the overlay that opens it mounts, or once the browser is idle. Its promise resolves when the code is in, so it can also drive a progress hint; the `Lazy Loading` story shows both with a loader that waits 1.5 s:

```tsx
const handlePreload = () => DeleteUserOverlay.preload();

return (
  <Button onPointerEnter={handlePreload} onFocus={handlePreload} onClick={handleDelete}>
    Delete user
  </Button>
);
```

## Show a skeleton while it loads

Nothing is on screen while an overlay's code loads. A heavy overlay, such as a form drawer, can split below its header with `lazyOverlayBody`: its light shell (the root, the content and the header) opens at once, and the heavy part below the header loads behind a skeleton. Keep confirms and other small overlays whole; `preload()` covers them.

```tsx
// features/users/EditUserDrawer.tsx: the light shell, loaded with the opener
import { defineOverlay, lazyOverlayBody } from '@wallarm-org/design-system/OverlayManager';

// The heavy part: DrawerBody and DrawerFooter, with all the form state.
const EditUserForm = lazyOverlayBody(() => import('./EditUserForm').then(m => m.EditUserForm));

const EditUserFormSkeleton = () => (
  <>
    <DrawerBody>{/* Skeleton bars where the fields go */}</DrawerBody>
    <DrawerFooter>{/* Skeleton bars the size of the buttons */}</DrawerFooter>
  </>
);

export const EditUserDrawer: FC<EditUserDrawerProps> = ({ userId, userName, controller }) => {
  const [isDirty, setIsDirty] = useState(false);
  // handleOpenChange guards with isDirty, as in "Define an overlay".

  return (
    <Drawer {...controller.rootProps} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit user</DrawerTitle>
          <DrawerDescription>{userName}</DrawerDescription>
        </DrawerHeader>
        <EditUserForm
          fallback={<EditUserFormSkeleton />}
          userId={userId}
          controller={controller}
          onDirtyChange={setIsDirty}
        />
      </DrawerContent>
    </Drawer>
  );
};

// Next to its shell, which it imports eagerly: open() and a hover preload() also load the form.
export const EditUserOverlay = defineOverlay(async () => {
  EditUserForm.preload();
  return EditUserDrawer;
});
```

- Cut inside `DialogContent` or `DrawerContent`, after the header. The shell keeps the root with its props (width, the `onOpenChange` guard), the content, and the header with the title and description: zag links the title and description once, a frame after open, so ones that arrive with the heavy part are never announced.
- `lazyOverlayBody(load)` takes a loader that returns the component itself, as `defineOverlay` does. Call it at module scope, never during render. Its result takes the heavy part's props plus `fallback`, so a heavy part with its own `fallback` prop does not compile. `preload()` loads the code ahead of time and never rejects.
- Shape the fallback like what it replaces: a body placeholder, plus a footer placeholder of the same height when the footer is in the heavy part, so nothing moves when it arrives. A centred `Dialog` re-centres when the heights differ, so match the body's height or keep the dialog whole. `lazyOverlayBody` announces the load itself with a hidden `Loading` status (test id `{id}--loading`); the skeleton bars stay `aria-hidden`.
- Keep the shell light (design-system components, `Skeleton`, the helper): it ships in the opener's chunk, because its definition imports it.
- Guard state, such as the dirty flag, lives in the shell next to `onOpenChange`. The heavy part reports it from its change handlers or its form library's change callback, never from an effect.
- Focus goes to the header's close button when the overlay opens and stays there when the heavy part arrives. `data-autofocus` in the heavy part is ignored, and React's `autoFocus` would move focus at least 300 ms after open, under a user who may already be typing.
- Without a preload the skeleton shows for at least 300 ms: React holds a fallback it has shown that long. Once the code is in, an open renders the heavy part at once, with no skeleton.
- Escape, an outside click and the close button work while the heavy part loads, through the shell's `onOpenChange`. The shell opens within a microtask or two, so the second click of a double click lands on its backdrop and dismisses it, as with any overlay whose code is cached.
- A heavy part that fails to load or render closes the overlay with its exit animation over the skeleton and reports to `onError`, also after the user dismissed it; `open()` resolves `undefined`, and the next open loads it again.
- Split only a managed overlay's own root. A plain `Dialog` split this way inside a managed overlay closes that managed overlay when its heavy part fails.

## Nesting

- Overlays of one provider are siblings, stacked in the order they appear: open order, unless an earlier one's code is still loading when a later one's is ready. To open two at once in a fixed order, `await Promise.all([a.preload(), b.preload()])` first. `useOverlay` inside an overlay opens another sibling in the same provider, above it: the edit drawer in the stories opens its delete confirm and its unsaved-changes guard that way, and preloads both when it mounts.
- While an inner overlay's code loads, nothing is on screen, so the user can still dismiss the outer one, and the inner one then appears alone over the page. Preload the inner definitions when the outer overlay mounts, split them so their shell shows at once, or open them through a nested provider.
- Compared with overlays nested as React children, app-level overlays lose same-kind push-back and cascade-dismiss. When a lower overlay closes from outside (its root unmounts, or its controlled `open` flips, like a router-owned drawer on Back), a managed overlay above it stays open.
- A drawer that can close from outside, such as a router-owned detail drawer, and that opens managed overlays mounts its own `OverlayProvider` inside `DrawerContent`. So does a `Drawer` that opens a managed `Drawer` and should scale back:

```tsx
<Drawer open={Boolean(userId)} onOpenChange={handleDrawerOpenChange}>
  <DrawerContent>
    <OverlayProvider closeOnChange={userId}>
      <UserDrawerHeader userId={userId} />
    </OverlayProvider>
  </DrawerContent>
</Drawer>
```

Overlays opened through it are React descendants of the drawer's content, so they close with it, cascade-dismiss and push-back work as usual, and switching entities closes them. It reports errors through the app provider's `onError`. Key it on the value that drives the drawer's `open` (the raw id, `undefined` after Back), never a latched copy: cascade-dismiss reaches only overlays already on screen, and the key change is what drops one whose code is still loading. Call `useOverlay` in a component rendered inside that provider, such as the actions menu in `UserDrawerHeader`. A call in the drawer's top-level hook, above `<Drawer>`, resolves to the app's provider and brings the problem back.

Overlays opened through it also read the drawer's context, which the same definition opened from the list through the app's provider does not: keep page data in the payload, or an overlay that works from the drawer breaks from the list. An overlay that must outlive the drawer, such as a Create drawer that Duplicate opens before it closes the detail drawer, opens through the app's provider: call that `useOverlay` above `<Drawer>` and pass its `open` down.

## Limits

- A remote without its own provider falls through to the host's. When the host and the remote share the design-system module, a remote's `useOverlay` finds any provider of the same design-system version above it, and the overlay renders with the host's contexts (query client, router), not the remote's. It throws `useOverlay must be used inside an <OverlayProvider>` only when none is above, so mount one provider per remote.
- Focus return is unchanged from a controlled `Dialog`. With no trigger, focus returns to the element that had it when the overlay opened: the clicked button in Chrome; in Safari, which does not focus a clicked button, the nearest focusable container around it, or `body` at the top level. When a menu item opened it, focus returns to the menu trigger. It lands on `body` only when the item is picked in the same frame as its highlight, as automated clicks do: zag's menu does not cancel its focus frame on close, tracked in `docs/storybook-docs-findings.md`.
- Test ids repeat during an exit. A closing instance stays mounted while it animates out, so a reopen inside that window, or two stacked instances of one definition, share ids such as `{id}--content`. Wait for the closing content to detach before reopening, or target the open instance.
- A `closeOnChange` change and a provider unmount force the close, and a guard cannot veto them. For a route change from a dirty form, use your router's blocker.
- A closed overlay is dropped 1 s after it closes, even mid-exit: keep custom exit animations well under 1 s (the defaults are 150 ms for the content and 200 ms for the backdrop). A Suspense boundary above that re-suspends during an exit, such as a navigation outside a transition to a route whose code is loading, can stall the exit; the overlay then goes at that 1 s mark too.
- An `<Activity mode="hidden">` above the provider drops its open overlays without an exit, and their `open()` resolves `undefined`.
