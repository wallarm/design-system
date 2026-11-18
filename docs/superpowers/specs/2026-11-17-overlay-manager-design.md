# Overlay manager: open the same Dialog or Drawer from anywhere, load it lazily

Status: design spec, 2026-11-17; implemented 2026-11-17 · branch `feat/modal-manager`. Paths are under `packages/design-system/src/` unless marked otherwise.

As built, the implementation differs from this spec in four places. `guidelines/rules.md` got no wrong → right line: the file has no room under its 2000-character cap. "The exit animation plays" and "Back closes both" are unit tests, not e2e: a 150 ms window would be flaky in e2e, and Storybook has no URL-driven drawer. The StrictMode cleanup test uses a Dialog only; a managed Drawer runs under StrictMode in the test where a Suspense boundary above the provider re-suspends. Closing a dialog opened from a menu item leaves focus on `body` in Chromium, not on the menu trigger; that is an open finding in the repo-root `docs/storybook-docs-findings.md`.

The numbers below come from a recon with adversarial verification: DS overlay internals, core-frontend usage, the legacy console and standalone remotes, Chakra's `createOverlay` source, and other overlay libraries. The design then went through a builder check and three adversarial reviews (lifecycle and accessibility, module identity, API and developer experience), and each serious finding was verified independently.

## Intent

Let an app define a Dialog or Drawer once, markup and logic together, and open it with one call from any component. The overlay's code loads only when it is first needed. Inspiration: Chakra UI's overlay manager (`createOverlay`).

### Why

core-frontend today runs DS 4.16.0. 107 files import `/Dialog` or `/Drawer`, defining about 100 overlay components.

- Every overlay is controlled through `open`. `DialogTrigger` and `DrawerTrigger` are used zero times, so opening is already imperative, but each call site wires its own state.
- The same overlay is mounted from 2 to 14 files. Each copy has its own open state and often its own copy of the mutation logic: about 12 host confirm-dialog pairs, such as a delete confirm in a list's `XxxDialogs` container and again in the entity's detail drawer.
- Pages pass open and target state through `XxxDialogs` containers. `UsersDialogs` takes 17 props.
- 13 drawers keep a "last value" latch so content does not blank during the exit animation. `PolicyConfirmDialog` closes with `setTimeout(onClose, 150)`. Remotes mount overlays conditionally and lose the exit animation. The DS gives no exit-complete signal.
- No overlay is lazy-loaded; each ships in its page's route chunk.
- Teams have hand-written the same promise-returning overlay state machine 8+ times: `usePendingDrawerRequest` in core-frontend `packages/ip-acl` and rules-frontend `packages/rules-drawers`, plus the legacy console's host-action hooks. The copies already disagree on semantics.

## Goals

1. Define an overlay once: `defineOverlay(loader)`, with markup and logic in one component.
2. Open it from any component under the app's provider: `useOverlay(definition).open(payload)` returns a promise of the overlay's result.
3. Load the overlay's code on first open, or earlier with `preload()`. The opener's chunk does not include it.
4. The exit animation always plays, and the payload stays intact until it ends. No latches and no timers in app code.
5. For overlays that follow the component contract, every `open()` promise settles exactly once, on every path.
6. No DS module-level state. Each provider owns its store, so stories and tests are isolated. In Module Federation an app is isolated once it mounts its own provider; see "Provider placement" for why it is not automatic under `sharedDesignSystem`.

## Non-goals (v1)

- URL-driven detail drawers (`?user=`, `?role=`, deployment-management's path-param drawer) stay router-owned. Their deep links, Back-to-close and cross-org redirect already work.
- Opening an overlay across MF boundaries, such as a remote opening a host overlay. Apps may later pass an `open` function into an SDK contract; the DS does not carry requests between bundles.
- Opening from non-React code. There is no global `overlays.open()`. Recon found no such caller in core-frontend.
- Closing an instance from the opener (`close(id)`), updating an open instance's payload, a stack or back-navigation helper.
- Presets such as `confirm()`, `alert()` or `prompt()`. The confirmation-dialogs guideline and the metrics contract keep buttons consumer-composed.
- A loading shell: a frame with a skeleton shown before the code arrives.
- Focus return beyond what zag does today (see Focus).
- Migrating existing core-frontend overlays. That is consumer work, done separately.
- See Follow-ups for the deferred pieces.

## Anti-goals

Any of these makes the work a failure even if it functions:

- Manager state at DS module scope. Under `sharedDesignSystem`, a module-level store is shared by every container on the same DS version. A remote's overlay could then render inside the host's providers (wrong QueryClient, wrong router) or render twice.
- An `open()` promise that can hang for an overlay that follows the contract.
- Cutting the exit animation, or content blanking during it.
- Any change in behavior for existing declarative Dialog and Drawer usage. The manager is additive and needs no migration.
- A Suspense boundary between a Dialog or Drawer root and its content.

## Constraints

Verified on Ark 5.39.2, zag 1.43.3 and React 19.

1. `DrawerRoot` hard-codes `lazyMount` and `unmountOnExit` and does not forward Ark's `onExitComplete` (`components/Drawer/DrawerRoot.tsx`, the `Dialog.Root` props). `Dialog` is `<Drawer kind='dialog' …/>`, so one change covers both.
2. `open` must be a boolean from the first render. `useControlled` fixes controlled or uncontrolled mode on mount (`components/Drawer/DrawerContext/DrawerProvider.tsx`).
3. In controlled mode, zag calls `onOpenChange(false)` on user dismissal (Escape, outside click, the header ×, `DrawerClose`) and stays open until the prop flips. Flipping `open` from outside goes through zag's `CONTROLLED.CLOSE` and never calls `onOpenChange`. Close guards live in `onOpenChange`, so only user dismissal can be guarded.
4. Unmounting an open root is cleanup-safe: focus trap, scroll lock, aria-hidden and the layer stack are all released. It plays no exit animation and fires neither `onOpenChange` nor `onExitComplete`.
5. On open, zag looks for the content node for about one frame and then gives up. The result has no focus trap, no Escape, no outside click and no aria-hidden, yet the scroll lock still applies. So nothing may suspend between root and content. zag also links the title (`aria-labelledby`) once, about one frame after open, so the title must render from the first frame.
6. Stacking, Escape routing and outside-click order come from zag's document-global layer stack, not from the React tree. Overlays rendered as siblings therefore stack correctly in open order. In core-frontend the `@zag-js/*` overlay leaves are MF singletons, so this also holds across bundles.
7. Same-kind push-back (`DrawerNestingContext`) and ancestor-only dismissal (`DrawerAncestorIdsContext` plus `keepOpenUnlessAncestorCloses`) depend on React-tree ancestry.
8. `sharedDesignSystem` is on in all 6 core-frontend apps, and also in rules-app and the attacks remote (DS 4.5.1). Every `@wallarm-org/design-system/*` subpath is shared at the exact installed version (`singleton: false`; the first container to load a subpath supplies it). The root barrel stays local, so a root-barrel import and a subpath import can resolve to different module instances. Private modules reached by relative imports from two subpaths can also split.
9. React Compiler compiles all DS code. Render stays pure, `ref.current` is never read or written in render, and external stores go through `useSyncExternalStore`.
10. Overlay content reads the React context above the place it renders, not the place it was opened. In core-frontend, overlay content uses `useSdkContext` (56 times), `useQueryClient`, router hooks and `useIpAclApi`, all provided at each app's root or root route.
11. The core-frontend host runs in StrictMode.
12. The manager's code also ships in Claude Design's React 18 canvas bundle, so it uses no React 19-only APIs such as `use` or `useEffectEvent`.
13. core-frontend remotes render inside the host's React tree: `SdkRemoteApp` renders the remote's `App` inline. Embedded remotes render inside their embedder's tree. With one DS version, `/OverlayManager` and its context object are a single module instance across containers.
14. TanStack Router's route-scoped hooks (`Route.useX`, `getRouteApi(…).useX`, and `useParams`, `useSearch`, `useLoaderData`, `useRouteContext` or `useMatch` with `from`) throw once their route is no longer matched. TanStack Router also sets `location` when navigation starts, and commits the new matches later.

## Approaches

1. **Chakra-style.** `createOverlay(Component)` returns a handle that owns a store and its own `<Viewport/>`. It is MF-safe because the store lives in consumer code, and it can be called outside React. But every definition needs its own viewport mounted exactly once: forget it and nothing opens, mount it twice and the overlay renders twice.
2. **One provider per app, store-free definitions, and a hook that finds the nearest provider. Chosen by the user.** There is one mount per app. Definitions can be exported from libraries and still render under the app's providers. Opening needs a hook.
3. **A hook returning `{ open, element }`**, a generalized `usePendingDrawerRequest`. It keeps the opener's context and DS nesting, but every call site still mounts `element`, and the overlay dies with its caller (the legacy console's bulk-bar bug).
4. **A DS-global store with a prop-less viewport and `definition.open()` callable anywhere.** Rejected by the first anti-goal.

## Delivery: two branches

1. **`onExitComplete` on Drawer and Dialog.** A separate branch and PR (user's decision) that lands first. See Change 1.
2. **The overlay manager** on `feat/modal-manager`, built on top of Change 1. The types cannot tell whether Change 1 has landed: spreading `rootProps` onto a root without `onExitComplete` compiles, because JSX spreads skip excess-property checks. Without Change 1, instances would only ever be removed by the fallback timer.

## Change 1: `onExitComplete` on Drawer and Dialog

- Add an optional `onExitComplete?: () => void` prop to `DrawerProps` (and therefore `Dialog`), forwarded through `DrawerRoot` to Ark `Dialog.Root`. It is additive and needs no migration. HoverCard already forwards Ark's `onExitComplete` (`components/HoverCard/HoverCard.tsx`).
- **Wait for the backdrop.** The backdrop (`DrawerOverlay`, 200ms fade) outlives the content signal (150ms). Do not change the durations. The backdrop is the shared `Overlay`, which Tour and SearchModal also render, and the anti-goals forbid behavior changes. Instead, fire the forwarded `onExitComplete` only after both the content's exit and the backdrop's exit have finished, for example by also listening for the backdrop's `animationend`. With `overlay={false}`, fire on the content alone. Check it in a browser.
- **When it fires (zag 1.43.3).** Document these cases:
  - It fires once, when the exit has finished.
  - It also fires when there is no animation: at once when the document is hidden, and after one frame when the animation name is `none`, the duration is `0s` or the content has `display: none`.
  - A root mounted open and closed within about one frame exits with no animation, and `onExitComplete` still fires.
  - It does not fire if the overlay reopens before the exit ends, if it never opened, or if the root unmounts while open or mid-exit.
  - On a mount-open, Ark's `onEnterComplete` never fires, so it cannot serve as a "presented" signal.
- **Stuck exits.** On zag 1.43.3, an exit animation that never starts can leave presence suspended with `onExitComplete` never fired; zag 1.47 adds a guard for this. The branch checks this in a browser (reduced motion, hidden tab) and documents what it finds. The manager has its own fallback either way.
- **Commit type:** `feat` (user's decision), a minor bump, since it adds a public prop.

## Change 2: the overlay manager

### Public API

Add a new folder, `components/OverlayManager/`. It is public only through the subpath `@wallarm-org/design-system/OverlayManager` and is not exported from the root barrel. Constraint 8 is why: a root-barrel import of the hook and a subpath import of the provider could resolve to different context objects. `Dialog` already follows the same subpath-only rule.

Exports:

- `defineOverlay(load)` returns an `OverlayDefinition<Payload, Result>`.
- `OverlayProvider` takes `children`, an optional `closeOnChange` and an optional `onError`. It wraps the app and renders its children, then every open overlay.
- `useOverlay(definition)` returns `{ open(payload): Promise<Result | undefined> }`.
- Types: `OverlayProps<Result>`, `OverlayController<Result>`, `OverlayDefinition<Payload, Result>`, `OverlayProviderProps`, and the helper types `OverlayPayload` and `OverlayResult`, so column builders can type their callbacks.

The names are placeholders the builder may adjust, with one exception: `OverlayProvider` must wrap its subtree. `useOverlay` finds the provider through React context, and a leaf viewport such as `<Toaster/>` would need module state.

```tsx
// features/users/DeleteUserDialog.tsx: the overlay, with its markup and logic together
import type { OverlayProps } from '@wallarm-org/design-system/OverlayManager';

interface DeleteUserDialogProps extends OverlayProps<boolean> {
  userId: string;
  userName: string;
}

export const DeleteUserDialog = ({ userId, userName, controller }: DeleteUserDialogProps) => {
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
      <DialogContent>{/* title, description, Cancel in DialogClose, confirm -> handleConfirm */}</DialogContent>
    </Dialog>
  );
};

// features/users/overlays.ts: a tiny module; importing it does not pull in the dialog's code
export const DeleteUserOverlay = defineOverlay(() =>
  import('./DeleteUserDialog').then(m => m.DeleteUserDialog),
);

// routes/__root.tsx: once per app and once per remote, wrapping everything the root route renders
<OverlayProvider closeOnChange={pageKey} onError={reportOverlayError}>
  {/* the app shell, navigation, <Outlet/> */}
</OverlayProvider>

// any component under the provider: a table row menu, a page button, an overlay
const deleteUser = useOverlay(DeleteUserOverlay);

const handleDelete = async () => {
  const deleted = await deleteUser.open({ userId, userName });
  if (deleted) toast.create({ type: 'default', title: 'User deleted' });
};
```

### The overlay component's contract

- **Props.** The component receives its payload props plus one `controller: OverlayController<Result>` prop, shaped `{ rootProps: { open, onOpenChange, onExitComplete }, close(result?) }`. The prop is not named `overlay`, because `Drawer` already has an `overlay` prop for the backdrop. The prop is nested rather than spread flat as in Chakra, so it cannot clash with payload keys such as `open`, and the settle internals stay private.
- **One root, always rendered.** The component renders exactly one DS `Dialog` or `Drawer` root at its top level, on every render from its first render until it is removed. That rules out an early return, a conditional root, and anything that suspends above the root.
  - Loading, error and not-found states go inside `DialogBody` or `DrawerBody`.
  - The title renders from the first frame, using placeholder text while data loads. This follows the `DetailDrawerFallback` pattern and constraint 5.
  - An overlay that decides not to show calls `controller.close()` from an effect or a handler.
- **Other dialogs it needs**, such as an unsaved-changes guard or a nested confirm, either render inside its root's content as React children (which keeps cascade-dismiss and push-back) or open as managed overlays from inside it. They never render as Fragment siblings of the root, which is today's core-frontend guard pattern: their exit would be cut when the instance is removed.
- **Spreading and closing.** The component spreads `controller.rootProps` onto the root. It may wrap `onOpenChange` for a pending guard or an unsaved-changes guard, but must eventually call through to close. `close(result)` settles the promise with `result`. `rootProps.onOpenChange(false)`, which is user dismissal, settles with `undefined`.
- **No route-scoped router hooks** (constraint 14). Ids travel in the payload. `useNavigate`, `useRouter` and `strict: false` hooks are fine. A closing overlay keeps rendering for its exit animation after the page has changed.
- **Close before navigating.** An overlay that navigates calls `controller.close(result)` first, so `closeOnChange` does not settle it with `undefined` first.
- **Loader and definitions.**
  - The loader returns the component itself, never `React.lazy(...)`, because React.lazy caches a failed chunk forever and defeats retry.
  - An eager definition is written `defineOverlay(async () => Component)`.
  - Definitions are created at module scope, never during render, because the loader cache and the replace rule key on the definition object. The builder may add a dev warning when a hook sees its definition change identity.

### Types

The types below were typechecked by a reviewer with tsc 7.0.2 (strict, `noUncheckedIndexedAccess`, `@types/react` 19.3.0). The check included 12 cases that must fail to compile and a declaration-emit check. Treat this as a known-good starting point, not final code.

```ts
interface OverlayController<R = void> {
  rootProps: { open: boolean; onOpenChange: (open: boolean) => void; onExitComplete: () => void };
  close: (result?: R) => void;
}
interface OverlayProps<R = void> {
  controller: OverlayController<R>;
}

type AllKeys<T> = T extends unknown ? keyof T : never;
type OverlayPayload<P> = P extends unknown
  ? { [K in keyof P as K extends 'controller' ? never : K]: P[K] }
  : never;
type OverlayResult<P> = P extends OverlayProps<infer R> ? R : never;
type OverlayOpenArgs<P> = [AllKeys<P>] extends [never]
  ? []
  : Partial<P> extends P
    ? [payload?: P]
    : [payload: P];

interface OverlayDefinition<Payload, Result> {
  preload: () => Promise<void>;
  readonly '~types'?: { readonly payload: Payload; readonly result: Result };
}

declare function defineOverlay<P extends OverlayProps<never>>(
  load: () => Promise<ComponentType<P> & { readonly _result?: never }>,
): OverlayDefinition<OverlayPayload<P>, OverlayResult<P>>;

declare function useOverlay<Payload, Result>(
  definition: OverlayDefinition<Payload, Result>,
): { open: (...args: OverlayOpenArgs<Payload>) => Promise<Result | undefined> };
```

Why these shapes, and what the obvious alternatives break:

- **`OverlayProps<never>` as the constraint.** `close` is a property, so its parameter is contravariant, and `OverlayProps<unknown>` would reject every typed result.
- **A distributive, key-remapped payload type.** A plain `Omit` collapses discriminated-union payloads. In a library whose props interface is not exported, `Omit` also breaks declaration emit with TS4023.
- **Arity from the keys of every union member.** `open()` must look at all union members to decide whether the payload argument is required, optional or absent.
- **A phantom carrier.** `OverlayDefinition` needs `'~types'` (or a private `unique symbol` key), otherwise `useOverlay` infers `unknown`.
- **`_result?: never` on the loader result.** It rejects a direct `React.lazy` at compile time. This is cheap feedback only; the per-instance Suspense boundary is what makes a lazy result safe.
- **No `any`.** The render path needs one `as unknown as Props` cast and never `any`.

### Lifecycle

Each `open()` call creates one instance, with an id unique within its provider. The instance moves through loading, open, closing and removed.

1. **Loading.** The definition's loader runs; its promise is cached per definition. The instance is not rendered yet, so nothing is visible.
2. **Open.** The instance renders as `<Component {...payload} controller={controller} />`, keyed by its id, with `open: true` on its first render.
3. **Closing.** Entered on `close(result)` or on `onOpenChange(false)`. The promise settles here, when closing starts, not after the exit. The instance stays mounted with an unchanged payload and `open: false`, so the exit animation plays and the content does not blank.
4. **Removed.** Triggered by `onExitComplete`. On zag 1.43.3 that signal sometimes never fires (the instance was never presented, or presence got stuck), so a closing instance also has a fallback, such as a timer well above the exit durations. The builder chooses the mechanism. The unit test with a real Dialog asserts that removal came from `onExitComplete`, not from the timer.

Each instance renders inside its own pair of boundaries:

```tsx
<OverlayErrorBoundary>
  <Suspense fallback={null}>
    <Component />
  </Suspense>
</OverlayErrorBoundary>
```

The pair is keyed by the instance id and wraps the whole overlay component: above the root, never between the root and its content. Root, content and title still commit together (constraint 5), and an overlay that suspends above its root delays only itself. Examples are `memo(lazy(…))`, `use()` and `useSuspenseQuery`. Such an overlay never reaches a router-level Suspense boundary above the provider; in core-frontend that boundary would blank the whole shell. Code that suspends after open still needs its own boundary below the title, inside the content. The error boundary is a small class inside the folder: the DS has no boundary to reuse, and React Compiler skips classes.

Each instance's promise settles exactly once:

| Path | Promise | Instance |
|---|---|---|
| `controller.close(value)` | resolves with `value` | closes with its exit animation |
| User dismissal (Escape, outside click, ×, `DialogClose`) | resolves with `undefined` | closes with its exit animation |
| `closeOnChange` changes, for an instance created before the change | resolves with `undefined` | if open: closes with its exit animation; if loading: never inserted |
| Provider unmounts (product switch, test teardown) | resolves with `undefined` | dropped without an exit animation; a pending load never inserts |
| `open()` called on a provider that has already unmounted | resolves with `undefined` at once | no load, no insert |
| Replaced while still loading (see Concurrency) | resolves with `undefined` | never inserted |
| Loader rejects | resolves with `undefined`; `onError(error)` is called | never inserted; the next `open()` retries |
| Overlay throws while rendering | resolves with `undefined` if not settled yet; `onError(error)` is called | removed without an exit animation; other instances are untouched |
| Second `close()` or dismissal | no-op | no change |
| Contract violation: root not rendered, or unmounted while open | stays pending until `closeOnChange` or a provider unmount | stays in the store |

**Errors.** `OverlayProvider` takes `onError?: (error: unknown) => void` and calls it for loader and render errors. The default is `reportError(error)`. `open()` never rejects, so call sites stay `const ok = await x.open(); if (ok) …`, and the app handles failures in one place. In core-frontend that is `captureException` plus an error toast. The caller cannot tell a failed load from a dismissal.

**Timing.** The promise resolves when closing starts, so chained flows feel instant: close "Create", then open the next overlay. The DS already guards a dialog closing and a drawer opening in the same tick (`keepOpenUnlessAncestorCloses`).

### Concurrency

- Every `open()` creates a new instance, and instances of the same definition stack.
- One exception guards against double clicks during the first load. A second `open()` of the same definition, in the same provider, while the first is still loading, replaces the first; the first resolves with `undefined`.
- Once the code is loaded, a fast double Escape in a guarded form can open its guard twice. The docs show guards keeping a pending flag.

### Lazy loading and preload

- **Cache.** The loader runs on the first `open()` or on `definition.preload()`. Its promise is cached in the definition object, which lives in consumer module scope: once per bundle, never in DS state. On rejection the cache clears so the next call retries.
- **`preload()` never rejects.** A failed preload only clears the cache; the next `open()` retries and reports through `onError`.
- **Nothing is shown while the code loads.** For heavy overlays, the app calls `preload()` when the opener is hovered or focused, or when the browser is idle.
- **Unmount during a load.** If the provider unmounts while a load is pending, the promise settles and the instance is never inserted.

### Provider placement and context

- **One provider per app, and one per remote.** Mount `OverlayProvider` in the root route component, wrapping everything that component renders, not only `<Outlet/>`. For example, deployment-management renders its RemoteShell, nav panel and breadcrumb outside `<Outlet/>`. Code outside `RouterProvider` must not call `useOverlay`. Per-instance error boundaries keep overlay errors local, so a provider placed above the app's own error boundary is fine.
- **Whose context overlays see.** Overlays see the provider's context (QueryClient, router, SDK, app-root providers), not the opener's. Page-level data travels in the payload, and live data is fetched by id inside the overlay.
- **Nested providers.** `useOverlay` uses the nearest provider. Overlays render inside their provider, so an overlay that opens another overlay stacks it in the same provider.
- **MF fall-through.** Under `sharedDesignSystem`, a remote's React tree sits inside the host's tree (or its embedder's), and it resolves the same `/OverlayManager` module whenever the DS versions match (constraint 13). A remote with no provider of its own, or remote code outside its provider, therefore silently uses the outer app's provider and its contexts: QueryClient, router and remote-root providers. `useOverlay` throws its "no provider" error only when no provider of the same DS version sits above the call. The placement rule is therefore a hard adoption requirement, not a convenience. A guard is listed under Follow-ups.
- **One store per provider instance.** Stories and tests are isolated. StrictMode's simulated unmount and remount must not leave the provider with a disposed store, but a real unmount marks the store disposed (see the settle table).

### Navigation

- **The prop.** `closeOnChange?: string | number | boolean | null | undefined`. It is a primitive key, so a fresh object literal cannot close everything on each render.
- **What closes.** When the key changes, every instance created before the change settles with `undefined`. Open instances close with their exit animation, and instances still loading are never inserted. Instances opened after the change are left alone.
- **When the sweep runs.** It runs in the provider's layout effect and compares against the last committed key held in the store, so StrictMode's effect replay does not sweep. All layout effects run before passive effects, so an overlay that the new page opens from a mount `useEffect` in the same commit survives. Only an `open()` from a descendant's layout effect in that same commit is swept; document this.
- **Choosing the key.** That is the consumer's job: pick a key that changes when the new page commits. On TanStack Router, `location` changes when navigation starts, while page A is still on screen and clickable. A key derived from the committed matches changes in the same commit as the page swap; check it in a browser. To also close on a tenant switch, as `usePendingDrawerRequest` does, include the org id in the key: `` `${orgId}:${path}` ``.
- **Without the prop**, overlays stay open across navigation.

### Close guards

- User dismissal goes through `rootProps.onOpenChange(false)`. Existing patterns therefore keep working inside managed overlays: ignoring close while a request is pending, and an unsaved-changes guard that intercepts `onOpenChange(false)`.
- A `closeOnChange` change and a provider unmount force the close and cannot be vetoed. That is the same as today, where navigation unmounts the page; the guideline already leaves route changes to the router's blocker.

### Nesting

- **What app-level overlays lose.** Managed overlays render as siblings in their provider and stack in open order through zag's layer stack (constraint 6). Under the app-level provider they lose two things that React-nested overlays have: same-kind push-back, and cascade-dismiss when a lower overlay closes from outside.
- **When a lower overlay closes from outside:**
  - its root unmounts;
  - its controlled `open` flips, for example a router-owned detail drawer (`?user=`) on a Back press that changes only the search params. `closeOnChange` keyed on the path does not see this.

  `keepOpenUnlessAncestorCloses` then actively keeps the managed overlay open, because it has no ancestor ids. "Delete user?" would stay on screen over the list.
- **Rule: a nested provider.** A drawer that can close from outside, such as a router-owned detail drawer, and that opens managed overlays mounts its own `<OverlayProvider closeOnChange={entityId}>` inside its `DrawerContent`. With that provider:
  - Overlays opened through it are React descendants of the drawer content, so cascade-dismiss and same-kind push-back work as they do today.
  - They drop when the content unmounts.
  - Switching entities (`?user=A` to `?user=B`) closes them.
  - The definition is still shared with the list page's app-level provider, so the duplicated pair still collapses into one definition.
- **Where `useOverlay` is called.** The call must sit in a component rendered inside that nested provider, for example the actions menu in `DrawerHeader`. It must not sit in the drawer's top-level hook above `<Drawer>`: that call would resolve to the app provider and bring the problem back. Document this.
- **Recon.** core-frontend's 16 nested pairs are all Drawer→Dialog, where push-back never applies, and at least 9 of them sit in router-owned drawers.
- **Future push-back.** Push-back for app-level managed overlays must not import Drawer-private contexts from `components/OverlayManager/` (constraint 8).

### Focus

- Unchanged from today. With no trigger, zag returns focus to the element that had focus when the trap activated. That is the clicked opener in Chrome, the menu trigger when opened from a menu item, and `body` in Safari or when the opener has unmounted. The async load does not change this, because focus stays on the opener while the code loads.

### Integration in the DS

- **Files.** Everything lives in `components/OverlayManager/`: store, provider, hook, definition, error boundary, types, `index.ts`, stories, unit tests and e2e. The store and the code that reads it stay inside this folder (constraint 8), and no other DS module imports them.
- **React Compiler.**
  - The provider reads the store with `useSyncExternalStore`, following `components/CodeEditor/lib/portalRegistry.ts` and `PortalOutlet.tsx`.
  - Mutations happen only in handlers and effects.
  - No React 19-only APIs (constraint 12).
  - `pnpm compiler:audit` stays clean.
- **`displayName` and DOM.** The provider sets a `displayName` and renders no DOM of its own, so it has no `data-slot` (precedents: `PortalOutlet`, `DateFormatProvider`).
- **Test IDs.** The manager has none of its own; overlays set `data-testid` on their own root. Two instances of one definition can coexist: a reopen within the exit window, or stacking. Their ids would duplicate (`{id}--content`, `{id}--close` and so on). Add a managed-overlay row to `docs/test-id-pattern.md` and to the e2e rules: wait for the closing content to detach before reopening, or target the open instance.
- **Metrics contract.** Neutral. The manager renders consumer-composed overlays and adds no interactive targets. Wrapping `onOpenChange` composes with the consumer's handler and never replaces it.
- **Storybook.**
  - Stories go under `Overlay/OverlayManager` and start closed.
  - Mount the provider through `meta.decorators`, never in `packages/design-system/.storybook/preview.tsx`; the website and Claude Design compose stories without it. A story body cannot both mount the provider and call `useOverlay`, and the story rules forbid local wrapper components.
  - Story bodies call `useOverlay` with named handlers.
  - The example overlays and their `defineOverlay` calls live in `components/OverlayManager/stories/`. That folder is excluded from dist, from `.d.ts` emission and from the compiler audit.
  - Write the Overview page with `/storybook-docs`.
- **Docs for the overlay half.** Extracted story code shows only the opener: `useOverlay(X)` plus a relative import. So:
  - add `components/OverlayManager/docs/usage.md` with the full flow: provider in the root route, the definitions module, the overlay component, the opener and `preload()`. MCP serves it as `docs/usage`;
  - name `defineOverlay`, `useOverlay`, `OverlayProps` and the single root-route provider in `parameters.docs.description.component`, which both MCP and the website render;
  - put the same full flow as a plain `tsx` fence in the confirmation-dialogs guideline, outside `## Examples`. The website renders guideline pages, but not `components/OverlayManager/docs/usage.md`.
- **Guidelines** (served to agents through MCP).
  - `guidelines/foundations/layering.md`: add an exception for managed overlays to "Depth comes from the React tree".
  - `guidelines/patterns/confirmation-dialogs.md`: add the managed alternative to "Use one controlled `open` state per dialog", the nested-provider rule for drawers, and the `tsx` fence.
  - `guidelines/rules.md` wrong → right list: "OverlayProvider, useOverlay from the root → `@wallarm-org/design-system/OverlayManager`".
- **MCP.** Add aliases in `packages/mcp/src/tools/search-component.ts`. A search for "overlay" ranks the existing `Overlay` backdrop first, and the alias "modal manager" would tie with Dialog. Choose aliases with that in mind, and keep `budget.test.ts` passing.
- **gen-ui.** Add an `excluded` decision in `packages/gen-ui/src/tests/coverage.test.ts`, with a provider-style reason.
- **Claude Design.** Omit the OverlayManager guide and previews, with a reason: a hook-only, app-level API; on a canvas, render Dialog or Drawer with `open`. Canvas scripts cannot run hooks, and the manager has no non-hook path. Its code still ships in the canvas bundle (constraint 12).
- **Website.** The page is generated in the Overlay category from the stories.
- **Migrator.** None needed, since the change is additive. The commit is `feat(overlay-manager): …`, a minor bump.

### Testing

**Unit (Rstest, jsdom):**

- Settle and removal:
  - every row of the settle table;
  - removal on `onExitComplete`, asserting it was not the timer, and removal on the fallback;
  - an unchanged payload while closing;
  - replace-while-loading;
  - a loader failure followed by a retry, with `onError` called;
  - a render error: `onError` is called, the instance is removed, and the other instances are untouched;
  - an overlay that suspends above its root (a `React.lazy` result, `use()`) under an outer `<Suspense>`: the outer fallback never appears;
  - `open()` after the provider has unmounted.
- `closeOnChange`:
  - a loading instance is never inserted;
  - an overlay opened in the new page's mount effect survives;
  - StrictMode's effect replay does not sweep.
- Providers:
  - nested-provider resolution, including a pinned MF fall-through case: a subtree without its own provider resolves to the outer one;
  - a controlled Drawer with a nested provider in `DrawerContent`: flipping its `open` closes the managed Dialog and settles `undefined`. With an app-level provider the Dialog stays open; this is the documented negative case;
  - `useOverlay` outside any provider throws.
- StrictMode around the provider with a real DS Dialog and Drawer: focus trap, scroll lock and aria-hidden are cleaned up.
- Types: a `@ts-expect-error` fixture for misuse, and a declaration-emit fixture with a module that exports a definition whose props interface is not exported.

**E2E (Playwright, in CI):**

- opening from a button and from a DropdownMenu item;
- Escape closes;
- the exit animation plays;
- two overlays stack;
- an unsaved-changes guard works inside a managed Drawer;
- a detail drawer with a nested provider opens a confirm, and Back closes both.

Screenshots follow the e2e rules.

## Decisions

Made by the user:

- Scope: in-memory overlays inside one app. Not URL-driven drawers, not cross-MF opening.
- Approach: one provider per app, store-free definitions, and `useOverlay`.
- `onExitComplete` ships first, as a separate branch and PR, committed as `feat`.

Made by the designer (Claude), open to override:

- The folder and subpath are `OverlayManager`. `OverlayProvider` wraps the app, and it is not exported from the root barrel.
- The injected prop is `controller` (`{ rootProps, close }`); the name `overlay` would clash with Drawer's backdrop prop.
- `open()` never rejects. Loader and render errors go to `onError` and resolve `undefined`.
- The promise resolves when closing starts, not after the exit.
- Every `open()` creates a new instance; a second open of the same definition is replaced only while its code is still loading.
- Each instance gets its own Suspense and error boundary.
- Nothing is shown while the code loads; `preload()` covers heavy overlays.
- `closeOnChange` is a primitive key. It sweeps everything created before the change, including loads, and runs as a layout effect.
- Router-owned drawers use a nested provider inside `DrawerContent` instead of a new `closeWithOpener` option.
- A missing provider in a nested MF app is handled by a documented hard rule now; the `OverlayScope` guard is a follow-up.
- Claude Design omits the manager's guide; gen-ui excludes it.

## Left to the builder

- Exact names, the removal fallback and its timer, the store's shape, the file split and the test layout.
- Whether to add a dev warning for definitions created during render.
- The wording of the guideline changes, and whether to add a new pattern page.

## Follow-ups (not v1)

- **`OverlayScope`.** A context reset exported from `/OverlayManager`: it provides "no provider" and renders no DOM. Each embedder renders it from its own DS import around each `SdkRemoteApp` mount, so a remote without its own provider gets the clear error whatever its DS version. It does not go inside `@wallarm/sdk`: that root barrel is DS-free, and its copy resolves the host's DS version.
- **Focus return.** Capture the opener in `open()` and pass it as `finalFocusEl`; this needs one more Drawer passthrough.
- **Push-back** for app-level managed overlays.
- **Opening from outside React**, through an explicit manager object.

## Adoption notes (outside this work)

- **core-frontend.**
  - Mount the provider in every app's root route: the host and each remote.
  - Add it to the remote template (`packages/boilerplates/remote-template/apps/remote-template-app`).
  - Add the OverlayManager context to the release gates in `docs/design-system-loading.md`.
  - Rollout hazard: the host pilots first. Until a remote mounts its own provider, any `useOverlay` that the remote or a library inside it adopts falls through to the host's provider.
- **Pilot.** The host's IAM `XxxDialogs` containers and the duplicated confirm-dialog pairs. The drawer half of each pair uses a nested provider.
- **Libraries.**
  - The HostAction adapter is `async req => (await open(req)) ?? false`.
  - `@wallarm/ip-acl` and `@wallarm/rules-drawers` declare the DS peer as `^3.0.0 || ^4.3.4`. To adopt the manager they must narrow it, or keep their own hooks.
  - The library's own providers must sit above the app's `OverlayProvider`.
- **The legacy console** (DS 2.7.1) cannot adopt the manager without a DS upgrade.
