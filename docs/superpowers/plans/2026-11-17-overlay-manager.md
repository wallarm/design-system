# Overlay Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `@wallarm-org/design-system/OverlayManager`. Apps describe a Dialog or Drawer once with `defineOverlay(loader)`, mount one `OverlayProvider` per app, and open it from any component with `useOverlay(definition).open(payload)`. The overlay's code loads lazily, it keeps its exit animation, and every `open()` promise settles.

**Architecture:**
- **Definitions.** A definition is a store-free object that caches its loader.
- **Providers.** Each `OverlayProvider` owns an external store, created per provider instance, so there is no DS module state. It exposes the store through a React context and renders every instance after its children. Each instance gets its own error boundary and `Suspense`.
- **The store.** It settles each `open()` exactly once: on close, dismissal, navigation sweep, provider unmount or failure. It removes an instance on its root's `onExitComplete` (from the drawer-exit-complete plan), or on a fallback timer.
- **The hook.** `useOverlay` finds the nearest provider.

**Tech Stack:** React 19 with React Compiler, `useSyncExternalStore`, the DS `Dialog` and `Drawer` (Ark UI 5.39.2, zag 1.43.3), TypeScript 7.0.2 strict, Rstest with Testing Library on jsdom, Playwright (in CI only), Storybook 10.

**Spec:** `docs/superpowers/specs/2026-11-17-overlay-manager-design.md`, section "Change 2: the overlay manager".

**Depends on:** `docs/superpowers/plans/2026-11-17-drawer-exit-complete.md`. Its `onExitComplete` prop on Drawer and Dialog must be on this branch before Task 3.

## Global Constraints

- **Location and exports.**
  - The folder is `packages/design-system/src/components/OverlayManager/`. It is public only through the subpath `@wallarm-org/design-system/OverlayManager`.
  - Never add it to `src/index.ts`, and never add it to `INTERNAL_COMPONENTS` (`scripts/metadata/internal.ts`): guidelines must be able to cite `OverlayProvider`.
  - The PR checklists that ask for root-barrel registration get the answer "subpath-only, like Dialog".
  - `OverlayProviderProps` stays exported from `index.ts`, because metadata finds `OverlayProvider` through it.
- **No DS module-level mutable state.** Stores are created per `OverlayProvider` instance, and loader caches live on definition objects.
- **React rules.**
  - Follow the React Compiler rules: no `ref.current` in render, no hand memoization, and no catch-less `try` or `try…finally` in components and hooks, because the audit bails on them.
  - No React 19-only APIs in this folder (`use`, `useEffectEvent`). The code also ships in Claude Design's React 18 canvas.
- **Types.** No `any`. Casts appear only as `as unknown as X`, at the boundary to the erased component.
- **Errors in tests.** `reportError` does not exist in jsdom or Node, so the default reporter must check `typeof reportError === 'function'`. Tests pass `onError={rs.fn()}` and mute `console.error` wherever an error is expected; the precedent is `CodeEditor.test.tsx:182`.
- **Tests and stories.**
  - Tests locate by `data-testid`.
  - Stories start closed, use named handlers before `return`, have no local wrapper components, and use trigger buttons with `variant='outline' color='neutral'`.
  - Example overlay modules live in `components/OverlayManager/stories/`, and their names never end in `.stories.tsx`.
  - No story export is named `Overview`.
- **E2E.** Story names are spaced, for example `'Confirm Dialog'`. E2E runs in CI only.
- **Fixed values.**
  - `REMOVE_FALLBACK_MS = 1000`.
  - The missing-provider error reads exactly `'useOverlay must be used inside an <OverlayProvider>'`.
- **Branch and commits.**
  - Work on `feat/modal-manager`. Before the first push, rename it to `feat/<KEY>-overlay-manager` with the user's Jira key.
  - Commits are conventional. The PR title is `feat(overlay-manager): open the same Dialog or Drawer from anywhere (<KEY>)`.

## Spec deviations decided while planning

- **The `rules.md` line is dropped.** The spec asks for a wrong → right line, but `rules.md` is at 1994 of its 2000-character cap (`scripts/metadata/parse-guidelines.ts:15`). Importing these names from the root fails to compile anyway.
- **"Back closes both" becomes a unit test.** The spec lists an e2e test where a detail drawer opens a confirm and Back closes both. Storybook has no URL-driven drawer, so the behavior is covered in Task 3, and the e2e tests cover stacking.
- **Type tests use a new `tsconfig.typetest.json`, appended to the `typecheck` script.** The repo has no type-test tooling, and `tsconfig.unit.json` is not checked in CI (it has 165 existing errors).
- **The spec's e2e "the exit animation plays" becomes a unit test**: `'keeps the payload and content while the overlay animates out'` in Task 3. In e2e it would have to catch a 150ms window, which would make it flaky.

## Review Focus

1. **The opener unmounts while its overlay is open** (a menu item, a bulk bar). The overlay stays open, and the original caller's `await` still gets the result. Tested in Task 3.
2. **A chained open while the first overlay is still exiting**, as in `if (await confirm.open()) await next.open()`. Both instances coexist, and the first is removed only after its exit. Tested in Task 3.
3. **The opener re-renders with a different payload while the overlay is open.** The overlay keeps the payload it was opened with. Tested in Task 3.
4. **The same definition is opened twice after its code is cached.** That gives two independent instances, each settling with its own result. Tested in Task 2.
5. **`close`, `remove` or `fail` for an instance that no longer exists**, for example from an async handler finishing after a product switch. These are no-ops and never throw. Tested in Task 2.

---

### Task 1: Public types, `defineOverlay` and type tests

**Files:**
- Create in `packages/design-system/src/components/OverlayManager/`: `types.ts`, `defineOverlay.ts` and `index.ts`.
- Test, in the same folder: `defineOverlay.test.ts`, `OverlayManager.types.test.ts` and `__tests__/declarationEmit.fixture.tsx`.
- Create: `packages/design-system/tsconfig.typetest.json`.
- Modify: the `typecheck` script at `packages/design-system/package.json:90`.
- Modify: `packages/gen-ui/src/tests/coverage.test.ts`, after line 106 (`Overlay: { excluded: PRIMITIVE },`).

**Interfaces (Produces):**

```ts
// types.ts
export interface OverlayRootProps { open: boolean; onOpenChange: (open: boolean) => void; onExitComplete: () => void }
export interface OverlayController<Result = void> { rootProps: OverlayRootProps; close: (result?: Result) => void }
export interface OverlayProps<Result = void> { controller: OverlayController<Result> }
type AllKeys<T> = T extends unknown ? keyof T : never;
export type OverlayPayload<Props> = Props extends unknown
  ? { [K in keyof Props as K extends 'controller' ? never : K]: Props[K] }
  : never;
export type OverlayResult<Props> = Props extends OverlayProps<infer Result> ? Result : never;
export type OverlayOpenArgs<Payload> = [AllKeys<Payload>] extends [never]
  ? []
  : Partial<Payload> extends Payload ? [payload?: Payload] : [payload: Payload];
export interface OverlayDefinition<Payload, Result> {
  preload: () => Promise<void>;
  readonly '~types'?: { readonly payload: Payload; readonly result: Result };
}
export type OverlayCloseKey = string | number | boolean | null | undefined;
export interface OverlayProviderProps {
  children: ReactNode;
  /** Closes every overlay opened before this value changed. Pass the committed page key. */
  closeOnChange?: OverlayCloseKey;
  /** Gets loader and render errors; that overlay's `open()` resolves `undefined`. Defaults to `reportError`. */
  onError?: (error: unknown) => void;
}
/** Internal: what the provider renders. Not exported from index.ts. */
export type ErasedOverlayComponent = ComponentType<OverlayProps<unknown> & Record<string, unknown>>;

// defineOverlay.ts
export interface InternalOverlayDefinition<Payload = unknown, Result = unknown>
  extends OverlayDefinition<Payload, Result> {
  /** Cached per definition; the cache clears on rejection so the next call retries. */
  load: () => Promise<ErasedOverlayComponent>;
}
export const defineOverlay: <Props extends OverlayProps<never>>(
  load: () => Promise<ComponentType<Props> & { readonly _result?: never }>,
) => OverlayDefinition<OverlayPayload<Props>, OverlayResult<Props>>;
```

After this task, `index.ts` exports `defineOverlay` and the types `OverlayCloseKey`, `OverlayController`, `OverlayDefinition`, `OverlayPayload`, `OverlayProps`, `OverlayResult` and `OverlayRootProps`. `OverlayProviderProps` joins in Task 3, together with the provider.

- [ ] **Step 1: Install.** Run `pnpm install --frozen-lockfile` at the worktree root.

  Expected: exit 0.

- [ ] **Step 2: Write the failing runtime tests** in `defineOverlay.test.ts`:

```ts
import { describe, expect, it, rs } from '@rstest/core';
import { defineOverlay, type InternalOverlayDefinition } from './defineOverlay';
import type { OverlayProps } from './types';

const Overlay = (_: OverlayProps<boolean>) => null;
const internal = (definition: unknown) => definition as InternalOverlayDefinition;

describe('defineOverlay', () => {
  it('loads the component once and caches it', async () => {
    const load = rs.fn(async () => Overlay);
    const definition = internal(defineOverlay(load));
    expect(await definition.load()).toBe(Overlay);
    expect(await definition.load()).toBe(Overlay);
    expect(load).toHaveBeenCalledTimes(1);
  });
  // 'retries after a rejected load': the loader rejects with Error('chunk') once, then resolves.
  //   The first load() rejects, the second resolves Overlay, and the loader was called twice.
  // 'preload resolves undefined and never rejects': with a rejecting loader,
  //   `await expect(definition.preload()).resolves.toBeUndefined()`.
  // 'preload warms the cache': await preload(), then await load(); the loader was called once.
});
```

- [ ] **Step 3: Write the failing type tests.**

  `OverlayManager.types.test.ts`:

```ts
// Typechecked by tsconfig.typetest.json (part of `pnpm typecheck`). Rstest runs it as a file with no tests.
// Every @ts-expect-error must be used by a real error, or tsc reports an unused directive.
import { lazy } from 'react';
import { defineOverlay } from './defineOverlay';
import type { OverlayOpenArgs, OverlayPayload, OverlayProps, OverlayResult } from './types';

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

interface DeleteProps extends OverlayProps<boolean> { userId: string; userName: string }
interface FilterProps extends OverlayProps { query?: string }
type PolicyProps = OverlayProps<boolean> & ({ mode: 'create' } | { mode: 'edit'; policyId: string });

export type TypeCases = [
  Expect<Equal<OverlayPayload<DeleteProps>, { userId: string; userName: string }>>,
  Expect<Equal<OverlayResult<DeleteProps>, boolean>>,
  Expect<Equal<OverlayResult<OverlayProps>, void>>,
  Expect<Equal<OverlayOpenArgs<OverlayPayload<OverlayProps>>, []>>,
  Expect<Equal<OverlayOpenArgs<OverlayPayload<FilterProps>>, [payload?: { query?: string }]>>,
  Expect<Equal<OverlayPayload<PolicyProps>, { mode: 'create' } | { mode: 'edit'; policyId: string }>>,
];

export const DeleteDialog = ({ controller }: DeleteProps) => {
  // @ts-expect-error close takes the overlay's result type
  controller.close('yes');
  return null;
};
export const DeleteOverlay = defineOverlay(async () => DeleteDialog);
export const PolicyOverlay = defineOverlay(async () => (_: PolicyProps) => null);

const NotAnOverlay = ({ userId }: { userId: string }) => userId;
// @ts-expect-error a component without the `controller` prop
defineOverlay(async () => NotAnOverlay);
// @ts-expect-error return the component itself, never React.lazy
defineOverlay(async () => lazy(async () => ({ default: DeleteDialog })));
```

  `__tests__/declarationEmit.fixture.tsx`:

```tsx
// Checked with declaration emit by tsconfig.typetest.json: the inferred definition type must not need
// the non-exported props interface (TS4023), which library packages hit with a plain Omit.
import { defineOverlay } from '../defineOverlay';
import type { OverlayProps } from '../types';

interface HiddenProps extends OverlayProps<boolean> {
  entityId: string;
}
const HiddenDialog = ({ entityId }: HiddenProps) => <span>{entityId}</span>;
export const HiddenOverlay = defineOverlay(async () => HiddenDialog);
```

  `packages/design-system/tsconfig.typetest.json`:

```json
{
  "extends": "./tsconfig.unit.json",
  "include": ["src/components/OverlayManager/**/*.types.test.ts", "src/components/OverlayManager/__tests__/**"]
}
```

  Append ` && tsc -p tsconfig.typetest.json --noEmit --composite false --incremental false` to the `typecheck` script.

- [ ] **Step 4: Run the tests and confirm they fail.**

  Run:
  - `pnpm --filter @wallarm-org/design-system test:run src/components/OverlayManager`
  - `cd packages/design-system && pnpm exec tsc -p tsconfig.typetest.json --noEmit --composite false --incremental false`

  Expected: both FAIL with "Cannot find module './defineOverlay'" (or `'./types'`).

- [ ] **Step 5: Implement `types.ts`, `defineOverlay.ts` and `index.ts`** with the Interfaces above.
  - `defineOverlay` keeps one cached promise in its closure: `cached ??= load().then(c => c as unknown as ErasedOverlayComponent, error => { cached = undefined; throw error; })`.
  - `preload` is `load().then(() => undefined, () => undefined)`.
  - JSDoc on `defineOverlay`: "Describes an overlay once. `load` returns the component itself, never `React.lazy`; importing the definition does not load the overlay's code."

- [ ] **Step 6: Add the gen-ui decision.** Add `  OverlayManager: { excluded: PROVIDER },` after line 106 of `packages/gen-ui/src/tests/coverage.test.ts`.

- [ ] **Step 7: Run the tests and confirm they pass.**

  Run:
  - `pnpm --filter @wallarm-org/design-system test:run src/components/OverlayManager`
  - the tsc command from Step 4
  - `pnpm --filter @wallarm-org/gen-ui test:run src/tests/coverage.test.ts`
  - `pnpm turbo run typecheck --filter=@wallarm-org/design-system`
  - `pnpm exec biome check packages/design-system/src/components/OverlayManager`

  Expected: all PASS, exit 0, and no Biome errors.

- [ ] **Step 8: Commit.**

```bash
git add packages/design-system/src/components/OverlayManager packages/design-system/tsconfig.typetest.json packages/design-system/package.json packages/gen-ui/src/tests/coverage.test.ts
git commit -m "feat(overlay-manager): add defineOverlay and the overlay types"
```

### Task 2: The overlay store

**Files:**
- Create: `packages/design-system/src/components/OverlayManager/overlayStore.ts`
- Test: `packages/design-system/src/components/OverlayManager/overlayStore.test.ts`

**Interfaces:**
- Consumes: `InternalOverlayDefinition`, `ErasedOverlayComponent` and `OverlayCloseKey` from Task 1.
- Produces:

```ts
export const REMOVE_FALLBACK_MS = 1000;
export interface OverlayInstance {
  readonly id: number;
  readonly Component: ErasedOverlayComponent;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly open: boolean;
}
export interface OverlayStore {
  subscribe: (listener: () => void) => () => void;
  /** Same array reference until something changes (useSyncExternalStore). */
  getSnapshot: () => readonly OverlayInstance[];
  open: (definition: InternalOverlayDefinition, payload?: object) => Promise<unknown>;
  /** Settles with `result` (the first settle wins), sets `open: false` and starts the removal fallback. */
  close: (id: number, result?: unknown) => void;
  /** Drops the instance after its exit and clears its fallback timer. */
  remove: (id: number) => void;
  /** Render error: settles `undefined` if still pending, drops the instance, calls onError. */
  fail: (id: number, error: unknown) => void;
  /** The first call records the key; a different key sweeps every instance created before it. */
  setCloseKey: (key: OverlayCloseKey) => void;
  setOnError: (onError: (error: unknown) => void) => void;
  /** Provider mounted, including the remount after a StrictMode replay. */
  attach: () => void;
  /** Provider unmounted: settles everything `undefined`, drops all, and later open() calls resolve `undefined` at once. */
  detach: () => void;
}
export const createOverlayStore: () => OverlayStore;
export const reportOverlayError: (error: unknown) => void; // reportError when it exists, else console.error
```

- [ ] **Step 1: Write the failing tests** in `overlayStore.test.ts`. Use these helpers:

```ts
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};
const Overlay = (() => null) as unknown as ErasedOverlayComponent;
const definitionOf = (load: () => Promise<ErasedOverlayComponent>) =>
  ({ load, preload: async () => undefined }) as InternalOverlayDefinition;
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
```

  For the timer tests, use `rs.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })`.

| Test | Act | Assert |
|---|---|---|
| `'inserts an open instance with its payload once the code loads'` | `open(def, { name: 'Jane' })`, then `flush()` | snapshot is `[{ open: true, payload: { name: 'Jane' } }]` |
| `'resolves the value passed to close and keeps the instance until removed'` | `close(id, true)` | the promise resolves `true`; the instance is still in the snapshot with `open: false`; after `remove(id)` the snapshot is empty |
| `'settles once: a later close is a no-op'` | `close(id, true)`, then `close(id, false)` | resolves `true` |
| `'resolves undefined on close without a value'` | `close(id)` | `undefined` |
| `'drops a closed instance after REMOVE_FALLBACK_MS without an exit signal'` | fake timers, `close(id)`, `rs.advanceTimersByTime(REMOVE_FALLBACK_MS)` | snapshot empty |
| `'remove clears the fallback timer'` | `close`, `remove`, advance | no throw; snapshot empty |
| `'replaces an open of the same definition that is still loading'` | deferred loader; `open(def, {a:1})`, `open(def, {a:2})`, resolve | the first resolves `undefined`; one instance with `{ a: 2 }` |
| `'keeps two instances of the same definition once its code is cached'` (Review Focus 4) | two opens after `flush()`; close them with `true` and `false` | two instances; each promise gets its own value |
| `'resolves undefined, reports and inserts nothing when the loader rejects'` | `setOnError(spy)`; the loader rejects with `err` | resolves `undefined`; `spy` called with `err`; snapshot empty |
| `'fail settles undefined, drops the instance and reports'` | open, `fail(id, err)` | `undefined`; empty; `spy(err)` |
| `'fail during closing only drops the instance'` | `close(id, true)`, then `fail(id, err)` | still resolves `true`; empty; `spy(err)` |
| `'setCloseKey records the first key and ignores an unchanged one'` | `setCloseKey('a')` twice, with one open instance | still `open: true` |
| `'setCloseKey closes open instances and drops loading ones created before the change'` | A loaded, B deferred; `setCloseKey('a')`, then `setCloseKey('b')`, then resolve B | A resolves `undefined` with `open: false`; B resolves `undefined` and is never inserted |
| `'leaves an instance opened after the key change alone'` | after `setCloseKey('b')`, open C | C is inserted and open |
| `'detach settles everything, drops all and blocks late inserts'` | A loaded, B deferred; `detach()`, resolve B | both `undefined`; snapshot empty |
| `'open after detach resolves undefined without loading'` | `detach()`, then `open(definitionOf(loadSpy))` | `undefined`; `loadSpy` not called |
| `'attach after detach makes the store usable again'` | `detach()`, `attach()`, open | inserted |
| `'ignores close, remove and fail for unknown ids'` (Review Focus 5) | each one called with `999` | no throw; snapshot reference unchanged |
| `'keeps the snapshot reference while nothing changes'` | `getSnapshot()` twice | `toBe` |
| `'notifies subscribers on insert, close and remove'` | a subscriber spy | called on each change |

- [ ] **Step 2: Run the tests and confirm they fail.**

  Run: `pnpm --filter @wallarm-org/design-system test:run src/components/OverlayManager/overlayStore.test.ts`

  Expected: FAIL with "Cannot find module './overlayStore'".

- [ ] **Step 3: Implement `overlayStore.ts`.**
  - Pending opens live in a `Map<number, Pending>` keyed by id, outside the snapshot. A loaded open moves into the immutable `instances` array.
  - Every record carries a once-only `settle`.
  - Replace-while-loading looks up a pending record of the same definition.
  - `reportOverlayError` guards `typeof reportError === 'function'`. Its `console.error` fallback carries `// biome-ignore lint/suspicious/noConsole: no reportError in this environment`.

- [ ] **Step 4: Run the tests and confirm they pass.** Run the command from Step 2.

  Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add packages/design-system/src/components/OverlayManager/overlayStore.ts packages/design-system/src/components/OverlayManager/overlayStore.test.ts
git commit -m "feat(overlay-manager): add the overlay store"
```

### Task 3: Provider, hook, boundaries and rendering

**Files:**
- Create in `packages/design-system/src/components/OverlayManager/`: `OverlayStoreContext.ts`, `InstanceErrorBoundary.tsx`, `OverlayProvider.tsx` and `useOverlay.ts`.
- Modify: `index.ts`, to add `OverlayProvider`, `useOverlay` and the types `OverlayProviderProps` and `UseOverlayReturn`.
- Test: `OverlayManager.test.tsx`, plus more cases in `OverlayManager.types.test.ts`.

**Interfaces:**
- Consumes:
  - `createOverlayStore`, `OverlayStore` and `reportOverlayError` from Task 2;
  - the types from Task 1;
  - `DrawerProps.onExitComplete` from the drawer-exit-complete plan.
- Produces:

```ts
// OverlayStoreContext.ts
export const OverlayStoreContext: Context<OverlayStore | null>;
// useOverlay.ts
export interface UseOverlayReturn<Payload, Result> {
  open: (...args: OverlayOpenArgs<Payload>) => Promise<Result | undefined>;
}
export const useOverlay: <Payload, Result>(
  definition: OverlayDefinition<Payload, Result>,
) => UseOverlayReturn<Payload, Result>;
// OverlayProvider.tsx (displayName 'OverlayProvider'; renders no DOM of its own, so it has no data-slot)
export const OverlayProvider: FC<OverlayProviderProps>;
// InstanceErrorBoundary.tsx (internal; a class, which React Compiler skips)
export class InstanceErrorBoundary extends Component<
  { children: ReactNode; onError: (error: unknown) => void },
  { failed: boolean }
> {}
```

- [ ] **Step 1: Confirm the dependency.** `grep -n onExitComplete packages/design-system/src/components/Drawer/Drawer.tsx` must print the prop. If it doesn't, rebase onto the drawer-exit-complete branch (or onto `origin/main` once that branch has merged), then run `pnpm install --frozen-lockfile`.

- [ ] **Step 2: Write the failing integration tests** in `OverlayManager.test.tsx`.
  - Use the real DS `Dialog` and `Drawer`.
  - Copy `flushLayers` from `Drawer.test.tsx:383-388`.
  - Add these fixtures at module scope:

```tsx
const Marker = createContext('none');

interface ConfirmProps extends OverlayProps<boolean> { name: string }
const ConfirmDialog = ({ name, controller }: ConfirmProps) => {
  const marker = useContext(Marker);
  const handleConfirm = () => controller.close(true);
  return (
    <Dialog {...controller.rootProps} data-testid='confirm'>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {name}? ({marker})</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild><Button data-testid='confirm-cancel'>Cancel</Button></DialogClose>
          <Button data-testid='confirm-ok' onClick={handleConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
const ConfirmOverlay = defineOverlay(async () => ConfirmDialog);

const Opener = ({ name = 'Jane', onResult }: { name?: string; onResult: (result?: boolean) => void }) => {
  const confirm = useOverlay(ConfirmOverlay);
  const handleClick = async () => onResult(await confirm.open({ name }));
  return <Button data-testid='open' onClick={handleClick}>Open</Button>;
};
```

  Write these tests. "Content" means `confirm--content`.

| Test | Arrange and act | Assert |
|---|---|---|
| `'opens the overlay with its payload and resolves the value passed to close'` | `<OverlayProvider><Opener/></OverlayProvider>`, click `open`, then `confirm-ok` | `findByText('Delete Jane? (none)')`; `onResult(true)`; content removed |
| `'resolves undefined when the user dismisses with Escape'` | open, `flushLayers()`, `user.keyboard('{Escape}')` | `onResult(undefined)` |
| `'keeps the payload and content while the overlay animates out'` | open, `fireEvent.click(confirm-ok)` | synchronously: the title is still `'Delete Jane? (none)'` and the content has `data-state='closed'`; then it is removed |
| `'removes the instance on onExitComplete, not on the fallback timer'` | a `ConfirmDialog` variant whose body also calls `useEffect(() => unmountSpy, [])`; `rs.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })` before closing | `waitFor(() => expect(unmountSpy).toHaveBeenCalled())` without advancing timers; then `rs.useRealTimers()` |
| `'drops the instance after the fallback when the root does not forward onExitComplete'` | a fixture that passes only `open` and `onOpenChange` to its `Dialog`; fake timers; close; `rs.advanceTimersByTime(REMOVE_FALLBACK_MS)` | `unmountSpy` called |
| `'an overlay that suspends above its root delays only itself'` | `<Suspense fallback={<span data-testid='outer-fallback'/>}>` around the provider plus a `<span data-testid='page'/>`; the loader resolves `lazy(() => gate.promise) as unknown as typeof ConfirmDialog`; open; `flushLayers()`; resolve `gate` | `outer-fallback` never appears; `page` stays visible; the content appears after `gate` resolves |
| `'reports a render error, settles undefined and keeps other overlays open'` | `onError={spy}`, `console.error` muted; open Confirm, then an overlay that throws `new Error('boom')` | `spy` called with that error; the second `open()` resolves `undefined`; the content is still there |
| `'resolves the original caller after the opener unmounts'` (Review Focus 1) | open; rerender without the `Opener`; click `confirm-ok` | `onResult(true)` |
| `'opens a chained overlay while the first is still exiting'` (Review Focus 2) | the opener runs `if (await confirm.open({ name })) await info.open()`; an `InfoDialog` with `data-testid='info'`; click `confirm-ok` | right after the click both `confirm--content` (closing) and `info--content` exist; later only `info--content` |
| `'keeps the original payload when the opener re-renders'` (Review Focus 3) | open with `'Jane'`; rerender the `Opener` with `name='John'` | the title stays `'Delete Jane? (none)'` |
| `'opens in the nearest provider'` | `<OverlayProvider><Marker.Provider value='app'><OverlayProvider><Opener/></OverlayProvider></Marker.Provider></OverlayProvider>` | title `'Delete Jane? (app)'` |
| `'falls through to an outer provider when the subtree has none'` | `<OverlayProvider><Marker.Provider value='page'><Opener/></Marker.Provider></OverlayProvider>` | title `'Delete Jane? (none)'`, which pins the MF fall-through |
| `'throws when useOverlay has no provider'` | `console.error` muted; render `<Opener onResult={rs.fn()}/>` inside a test-only class error boundary that records `error.message` | the recorded message is `'useOverlay must be used inside an <OverlayProvider>'`. A caught error stays out of `window` error events; an uncaught render error would become an Rstest uncaught exception |
| `'cleans up the focus trap, scroll lock and inert markers under StrictMode'` | `<StrictMode>` around the provider; open; `confirm-ok`; wait for the content to be removed | body has no `data-scroll-lock` and no `data-inert`; `style.overflow` and `style.pointerEvents` are `''`; no `[data-aria-hidden]` or `[data-inerted]` remains; `waitFor` until `open` has focus |
| `'closes a managed dialog when its drawer closes from outside, through a nested provider'` | a controlled `Drawer` with `<OverlayProvider>` inside its `DrawerContent`, wrapping a `DrawerBody` that contains the `Opener`; open the confirm; rerender the Drawer with `open={false}` | content removed; `onResult(undefined)` |
| `'leaves the dialog open when it was opened through the app-level provider'` | the same, but the only provider sits outside the Drawer | after closing the Drawer and running `flushLayers()`, the content is still present; this is the documented limit |

- [ ] **Step 3: Add the call-site cases to `OverlayManager.types.test.ts`.**

```ts
import { useOverlay } from './useOverlay';

const NoPayloadOverlay = defineOverlay(async () => (_: OverlayProps<boolean>) => null);

export const CallSites = () => {
  const del = useOverlay(DeleteOverlay);
  const none = useOverlay(NoPayloadOverlay);
  const policy = useOverlay(PolicyOverlay);
  const handle = async () => {
    // @ts-expect-error missing required payload
    await del.open();
    // @ts-expect-error wrong payload type
    await del.open({ userId: 1, userName: 'x' });
    // @ts-expect-error excess payload key
    await del.open({ userId: '1', userName: 'x', extra: true });
    // @ts-expect-error payload for an overlay without payload props
    await none.open({ userId: '1' });
    // @ts-expect-error the result can be undefined (dismissed)
    const deleted: boolean = await del.open({ userId: '1', userName: 'x' });
    // @ts-expect-error the edit member needs its id
    await policy.open({ mode: 'edit' });
    await none.open();
    await policy.open({ mode: 'create' });
    return deleted;
  };
  // @ts-expect-error a component is not a definition
  useOverlay(DeleteDialog);
  return handle;
};
```

- [ ] **Step 4: Run the tests and confirm they fail.**

  Run:
  - `pnpm --filter @wallarm-org/design-system test:run src/components/OverlayManager`
  - the typetest tsc command from Task 1, Step 4

  Expected: FAIL with "Cannot find module './OverlayProvider'" (or `'./useOverlay'`).

- [ ] **Step 5: Implement the context, boundary, hook and provider** with the Interfaces above.
  - **`useOverlay`:** reads `OverlayStoreContext` and throws the fixed message when it is `null`. `open` calls `store.open(definition as unknown as InternalOverlayDefinition, args[0])`.
  - **`InstanceErrorBoundary`:**
    - `getDerivedStateFromError` returns `{ failed: true }`;
    - `componentDidCatch(error)` calls `props.onError(error)`;
    - it renders `null` once failed.
  - **`OverlayProvider`:**
    - `const [store] = useState(createOverlayStore)`;
    - `useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)`;
    - `useLayoutEffect(() => store.setOnError(onError ?? reportOverlayError), [store, onError])`;
    - `useEffect(() => { store.attach(); return store.detach; }, [store])`;
    - it renders `<OverlayStoreContext.Provider value={store}>{children}{instances.map(…)}</…>`.
  - **The internal `OverlayInstanceView`** (keyed by `instance.id`):
    - It builds the controller: `rootProps.open = instance.open`. `onOpenChange(open)` calls `store.close(id)` when `open` is false. `onExitComplete` calls `store.remove(id)`. `close(result)` calls `store.close(id, result)`.
    - It renders `<InstanceErrorBoundary onError={error => store.fail(id, error)}><Suspense fallback={null}><Component {...payload} controller={controller}/></Suspense></InstanceErrorBoundary>`.
  - **`closeOnChange`** is accepted but not wired until Task 4.

- [ ] **Step 6: Run the tests and confirm they pass.** Run the commands from Step 4.

  Expected: PASS, and tsc exits 0.

- [ ] **Step 7: Run the static checks.**

  Run:
  - `pnpm turbo run typecheck --filter=@wallarm-org/design-system`
  - `pnpm exec biome check packages/design-system/src/components/OverlayManager`
  - `pnpm --filter @wallarm-org/design-system compiler:audit | grep OverlayManager`

  Expected: exit 0; no Biome errors; the grep prints nothing.

- [ ] **Step 8: Commit.**

```bash
git add packages/design-system/src/components/OverlayManager
git commit -m "feat(overlay-manager): add OverlayProvider and useOverlay"
```

### Task 4: Close on navigation (`closeOnChange`)

**Files:**
- Modify: `packages/design-system/src/components/OverlayManager/OverlayProvider.tsx`
- Test: `packages/design-system/src/components/OverlayManager/OverlayManager.test.tsx`, in a new `describe('closeOnChange')`

**Interfaces:**
- Consumes: `store.setCloseKey` from Task 2.

- [ ] **Step 1: Write the failing tests.**

| Test | Arrange and act | Assert |
|---|---|---|
| `'closes open overlays when closeOnChange changes'` | `closeOnChange='/users'`; open; rerender with `'/roles'` | content removed; `onResult(undefined)` |
| `'keeps an overlay that the new page opens from a mount effect in the same commit'` | `App` renders `<OverlayProvider closeOnChange={page}>` with `PageA`, or with `PageB` when `page === 'b'`; `PageB` runs `useEffect(() => { void info.open(); }, [info])`; rerender with `page='b'` | after `flushLayers()`, `info--content` is present |
| `'does not close overlays on the StrictMode effect replay'` | `<StrictMode>` with key `'a'`; open; `flushLayers()` | still open |
| `'drops an overlay still loading when closeOnChange changes'` | a deferred loader; open; rerender with a new key; resolve | nothing renders; `onResult(undefined)` |

- [ ] **Step 2: Run the tests and confirm they fail.**

  Run: `pnpm --filter @wallarm-org/design-system test:run src/components/OverlayManager/OverlayManager.test.tsx -t closeOnChange`

  Expected: the first and fourth tests FAIL, because the overlays stay open.

- [ ] **Step 3: Wire the prop.** In `OverlayProvider`, add `useLayoutEffect(() => { store.setCloseKey(closeOnChange); }, [store, closeOnChange])`. It is a layout effect so that a new page's mount `useEffect` in the same commit runs after the sweep.

- [ ] **Step 4: Run the tests and confirm they pass.** Run the command from Step 2.

  Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add packages/design-system/src/components/OverlayManager
git commit -m "feat(overlay-manager): close overlays when closeOnChange changes"
```

### Task 5: Stories, examples, usage docs, e2e and the Claude Design omission

**Files:**
- Create in `packages/design-system/src/components/OverlayManager/`:
  - `stories/ConfirmDeleteDialog.tsx`, `stories/EditUserDrawer.tsx`, `stories/UnsavedChangesDialog.tsx` and `stories/overlays.ts`;
  - `OverlayManager.stories.tsx`;
  - `docs/usage.md`;
  - `OverlayManager.e2e.ts`.
- Modify in `packages/claude-design/src/`:
  - `config.ts:16-26`;
  - `docs/build-docs.ts:118-127` and `:209-212`;
  - `docs/build-docs.test.ts:217-224` and `:231-235`.
- Modify: `docs/storybook-docs-coverage.md`, through `/storybook-docs`.

**Interfaces:**
- Consumes: the public API from Tasks 1-4.
- Produces, in `stories/overlays.ts`:
  - `ConfirmDeleteOverlay`: payload `{ userName: string }`, result `boolean`;
  - `EditUserOverlay`: payload `{ userName: string }`, result `void`;
  - `UnsavedChangesOverlay`: no payload, result `boolean` (true means leave).

  Each is `defineOverlay(() => import('./X').then(m => m.X))`.
- Test ids:
  - `confirm-delete`, with `confirm-delete-submit` and `confirm-delete-cancel`;
  - `edit-user`, with `edit-user-name`, `edit-user-delete` and `edit-user-save`;
  - `unsaved-changes`, with `unsaved-changes-keep` and `unsaved-changes-leave`;
  - triggers `open-confirm`, `row-menu` with its item `row-menu-delete`, and `open-edit-user`;
  - the result line `result`.

- [ ] **Step 1: Write the example overlays.** The copy follows `guidelines/patterns/confirmation-dialogs.md`.
  - **`ConfirmDeleteDialog`:**
    - `width={400}` and the title "Delete user?";
    - the description "This permanently deletes {userName} and all their access. You can't undo this.";
    - Cancel (ghost neutral, in `DialogClose`), then "Delete user" with `color='destructive'`.
  - **`UnsavedChangesDialog`:**
    - the title "Unsaved changes" and the description "Your changes to this user will be lost.";
    - the buttons "Keep editing" and "Leave without saving", both ghost neutral.
  - **`EditUserDrawer`:**
    - the title "Edit user", with an `Input` for the name;
    - the footer buttons "Delete user", which opens `ConfirmDeleteOverlay` from inside the drawer, and "Save changes".
    - While the name is dirty, its wrapped `onOpenChange(false)` opens `UnsavedChangesOverlay` once (a `guarding` state flag) and calls `controller.close()` when the result is `true`.
  - **For every overlay:** one root, always rendered, with named handlers.

- [ ] **Step 2: Write `OverlayManager.stories.tsx`.**
  - The meta is `title: 'Overlay/OverlayManager'` and `component: OverlayProvider`, plus `decorators: [Story => (<OverlayProvider><Story /></OverlayProvider>)]`.
  - Use `parameters: { layout: 'centered', docs: { description: { component: DESCRIPTION } } }` and `satisfies Meta<typeof OverlayProvider>`.
  - Import `useOverlay` from `'./useOverlay'`; the website's Usage block takes it from the first story.
  - `DESCRIPTION`:

```tsx
const DESCRIPTION = [
  'Opens the same `Dialog` or `Drawer` from any row, menu or drawer: describe it once with `defineOverlay`, mount one `OverlayProvider` in the root route, and await `useOverlay(definition).open(payload)` for the value the overlay passes to `controller.close`.',
  'The overlay takes `OverlayProps` and spreads `controller.rootProps` onto its single root; for a dialog that only one control opens, a plain controlled `Dialog` is simpler.',
].join(' ');
```

  Add these stories; each starts closed and shows `Result: …` in `result` where relevant:

| Export (e2e name) | Body | JSDoc |
|---|---|---|
| `ConfirmDialog` ('Confirm Dialog') | the `open-confirm` button runs `ConfirmDeleteOverlay` with `{ userName: 'Jane Cooper' }` and shows `deleted` or `cancelled` | "`open()` resolves with what the dialog passes to `controller.close`, or `undefined` when it is dismissed." |
| `FromMenuItem` ('From Menu Item') | the `row-menu` DropdownMenu's `row-menu-delete` item opens the same definition (use the API in `DropdownMenu.stories.tsx`) | "A menu item can open it: the dialog lives in the provider, so it outlives the menu that opened it." |
| `StackedOverlays` ('Stacked Overlays') | `open-edit-user` opens `EditUserOverlay`; its "Delete user" opens the confirm above it | "An overlay can open another one, and it stacks above in the same provider." |
| `UnsavedChangesGuard` ('Unsaved Changes Guard') | `open-edit-user` opens `EditUserOverlay`; editing the name arms the guard | "The drawer intercepts `onOpenChange(false)` and opens a managed guard before it closes." |

- [ ] **Step 3: Write `docs/usage.md`.** It has the H1 `Overlay manager` and these sections:
  - `## When to use`: shared overlays opened from several places, or heavy ones. For one control, use a plain controlled `Dialog`.
  - `## Set up`:
    - one `OverlayProvider` per app and per remote, in the root route component, wrapping everything it renders;
    - `closeOnChange` gets a key that changes when the new page commits (on TanStack Router, derived from the matches, not `location`), plus the org id to close on a tenant switch;
    - `onError` reports and toasts.
  - `## Define an overlay`:
    - the contract: `controller`, one root always rendered, the title from the first frame, guards through `onOpenChange`, `close(result)`, no route-scoped router hooks, and close before navigating;
    - a definitions module whose loader returns the component, never `React.lazy`, created at module scope.
  - `## Open it`: `useOverlay`, `await open()`, `undefined` on dismissal or failure, `preload()` on hover.
  - `## Nesting`:
    - app-level overlays are siblings;
    - a drawer that can close from outside mounts its own `OverlayProvider` in `DrawerContent`, and `useOverlay` is called inside it.
  - `## Limits`: a remote without a provider falls through to the host's, focus return is unchanged, and test ids repeat during an exit.

- [ ] **Step 4: Write `OverlayManager.e2e.ts`.** Use `createStoryHelper('overlay-overlaymanager', ['Confirm Dialog', 'From Menu Item', 'Stacked Overlays', 'Unsaved Changes Guard'] as const)` inside `test.describe('Component: OverlayManager')`.
  - `'Visual'`:
    - `'Should render confirm dialog correctly'` and `'Should render stacked overlays correctly'`;
    - open the overlay, wait for its content, then `toHaveScreenshot({ animations: 'disabled' })`.
  - `'Interactions'`:
    - `'Should resolve the result when confirm is clicked'`: `result` shows `'Result: deleted'`;
    - `'Should resolve cancelled when Escape is pressed'`: `'Result: cancelled'`;
    - `'Should open the dialog when a menu item is clicked'`;
    - `'Should close only the top overlay when Escape is pressed over a stack'`: `confirm-delete--content` is hidden and `edit-user--content` stays visible;
    - `'Should ask before closing when the drawer has unsaved changes'`: type, Escape, `unsaved-changes--content` visible, Keep editing keeps the drawer, Escape again, Leave hides the drawer.
  - `'Accessibility'`:
    - `'Should be labelled by its title via role'`: `getByRole('dialog', { name: 'Delete user?' })` is visible;
    - `'Should return focus to the trigger via Escape'`: `open-confirm` has focus.

- [ ] **Step 5: Omit the manager from Claude Design.**
  - In `config.ts`, add `'OverlayManager'` to `CLAUDE_DESIGN.internal` with `// Hook-only, app-level API: canvas scripts cannot run hooks.`
  - In `build-docs.ts`:
    - replace the `PROVIDERS` set with `const NO_GUIDE: ReadonlyMap<string, string>`, mapping `ThemeProvider` and `DateFormatProvider` to their current reason, `'provider; use WallarmDS.Root on the canvas'`, and `OverlayManager` to `'hook-only app-level API (canvas scripts cannot run hooks); render Dialog or Drawer with open'`;
    - use the map at `:209-212`;
    - add `'components/OverlayManager/'` to `NON_COMPONENT_STORIES` with the same reason, and correct the comment above it.
  - In `build-docs.test.ts`, assert `readme` contains `'- OverlayManager: hook-only'` and `'- src/components/OverlayManager/OverlayManager.stories.tsx:'`.

- [ ] **Step 6: Run the checks.**

  Run:
  - `cd packages/design-system && pnpm exec tsc -p tsconfig.storybook.json --noEmit --composite false --incremental false`
  - `pnpm exec tsc -p tsconfig.e2e.json --noEmit --composite false --incremental false`
  - `pnpm --filter @wallarm-org/design-system test:run scripts/metadata`
  - `pnpm turbo run test:export --filter=@wallarm-org/claude-design`

  Expected: exit 0 and PASS everywhere.

- [ ] **Step 7: Check the docs page.** Invoke `/storybook-docs` for `Overlay/OverlayManager`. It checks the page against its standard (on Storybook port 6007), adds the `docs/storybook-docs-coverage.md` row between `Overlay/OverflowTooltip` and `Overlay/Popover`, and bumps the totals.

- [ ] **Step 8: Commit.**

```bash
git add packages/design-system/src/components/OverlayManager packages/claude-design/src docs/storybook-docs-coverage.md
git commit -m "feat(overlay-manager): stories, usage docs, e2e and Claude Design omission"
```

### Task 6: Guidelines, MCP aliases and test-id docs

**Files:**
- Modify: `packages/design-system/src/guidelines/foundations/layering.md`, after line 36.
- Modify: `packages/design-system/src/guidelines/patterns/confirmation-dialogs.md`: front matter line 4, line 53, and a new `### Managed confirmation` before `### Copy` (line 55).
- Modify: `packages/mcp/src/tools/search-component.ts`, after line 22 (`flyout`).
- Modify: `packages/mcp/src/__tests__/budget.test.ts`, after line 129.
- Modify: `docs/test-id-pattern.md`, after line 137, and `docs/e2e-test-rules.md`, after line 58.

- [ ] **Step 1: Write the failing MCP tests** in `budget.test.ts`:

```ts
  it.each(['useOverlay', 'defineOverlay', 'OverlayProvider', 'dialog manager'])(
    '"%s" finds OverlayManager first',
    query => expect(searchComponents(metadata, query)[0]?.name).toBe('OverlayManager'),
  );
  it('"overlay" still finds the Overlay backdrop first', () =>
    expect(searchComponents(metadata, 'overlay')[0]?.name).toBe('Overlay'));
```

- [ ] **Step 2: Run the MCP tests and confirm the new cases fail.**

  Run: `pnpm build --filter=@wallarm-org/design-system && pnpm --filter @wallarm-org/mcp test:run src/__tests__/budget.test.ts`

  Expected: the four `finds OverlayManager first` cases FAIL, and the `Overlay` case passes.

- [ ] **Step 3: Add the aliases** after line 22:

```ts
  'dialog manager': ['OverlayManager'],
  'drawer manager': ['OverlayManager'],
  'overlay provider': ['OverlayManager'],
  'use overlay': ['OverlayManager'],
  'define overlay': ['OverlayManager'],
```

- [ ] **Step 4: Edit the guidelines** with this exact text.
  - **`layering.md`.** Insert after line 36:

    ``- If you open an overlay with `useOverlay` from `@wallarm-org/design-system/OverlayManager`, it renders beside the app, not inside its opener: it still stacks above, but it neither scales its parent back nor closes with it. Inside a drawer that can close from outside, mount an `OverlayProvider` in its `DrawerContent`.``
  - **`confirmation-dialogs.md`:**
    - add `OverlayProvider` to the front-matter `components` list;
    - append ` If several places open it, use a managed overlay (below).` to line 53;
    - insert, before `### Copy`:

````md
### Managed confirmation

Define the dialog once and open it from any row, menu or drawer. It renders one `Dialog` root and spreads `controller.rootProps` onto it; `open()` resolves with the value passed to `controller.close`, or `undefined` when dismissed.

```tsx
import { Dialog, DialogContent } from '@wallarm-org/design-system/Dialog';
import { defineOverlay, type OverlayProps, useOverlay } from '@wallarm-org/design-system/OverlayManager';

interface DeleteUserDialogProps extends OverlayProps<boolean> {
  userId: string;
  userName: string;
}

export const DeleteUserDialog = ({ userId, userName, controller }: DeleteUserDialogProps) => {
  const deleteUser = useDeleteUser();
  // Ignore close requests while the request runs.
  const handleOpenChange = (open: boolean) => {
    if (!deleteUser.isPending) controller.rootProps.onOpenChange(open);
  };
  // On failure keep it open and show an error toast; close only on success.
  const handleConfirm = async () => {
    await deleteUser.mutateAsync(userId);
    controller.close(true);
  };
  return (
    <Dialog {...controller.rootProps} onOpenChange={handleOpenChange} width={400}>
      <DialogContent>{/* title, description, Cancel, confirm calling handleConfirm */}</DialogContent>
    </Dialog>
  );
};

// overlays.ts: importing it does not load the dialog.
export const DeleteUserOverlay = defineOverlay(() =>
  import('./DeleteUserDialog').then(m => m.DeleteUserDialog),
);

// One OverlayProvider per app, around everything the root route renders. A drawer that can close
// from outside (?user=) mounts its own OverlayProvider inside DrawerContent and opens from below it.
const deleteUser = useOverlay(DeleteUserOverlay);
const deleted = await deleteUser.open({ userId, userName });
```
````

- [ ] **Step 5: Add the docs rows.**
  - In `docs/test-id-pattern.md`, after line 137:

    ``| Managed overlay (OverlayManager) | `data-testid` on the overlay's own `Dialog`/`Drawer` root | Two instances of one definition can coexist (reopened during its exit, or stacked), so ids can repeat: wait for the closing content to detach, or target the open one |``
  - In `docs/e2e-test-rules.md`, after line 58:

    ``- A managed overlay (OverlayManager) keeps its content mounted while it animates out, so reopening it can briefly match its test id twice: `await expect(content).toBeHidden()` before reopening.``

- [ ] **Step 6: Run the checks.**

  Run:
  - `pnpm --filter @wallarm-org/mcp test:run src/__tests__/budget.test.ts`
  - `pnpm --filter @wallarm-org/design-system exec rstest run scripts/metadata/__tests__/parse-guidelines.test.ts`
  - `pnpm --filter @wallarm-org/design-system generate-metadata`

  Expected: PASS and exit 0. The word budgets hold: layering is at most 700 words, and confirmation-dialogs at most 1000, with about 49 added prose words against 70 of room; the fence doesn't count.

- [ ] **Step 7: Commit.**

```bash
git add packages/design-system/src/guidelines packages/mcp/src docs/test-id-pattern.md docs/e2e-test-rules.md
git commit -m "docs(overlay-manager): guidelines, MCP aliases and test-id notes"
```

### Task 7: Branch verification, e2e baselines and PR

- [ ] **Step 1: Run every local check.**

  Run:
  - `pnpm --filter @wallarm-org/design-system test:run`
  - `pnpm turbo run typecheck --filter=@wallarm-org/design-system`
  - `pnpm exec biome check packages/design-system/src/components/OverlayManager packages/claude-design/src packages/mcp/src packages/gen-ui/src`
  - `pnpm --filter @wallarm-org/design-system compiler:audit | grep OverlayManager`, which must print nothing
  - `pnpm build --filter=@wallarm-org/design-system`
  - `pnpm turbo run test:export --filter=@wallarm-org/claude-design`
  - `pnpm --filter @wallarm-org/gen-ui test:run src/tests/coverage.test.ts`
  - `pnpm --filter @wallarm-org/website build && pnpm --filter @wallarm-org/website check:build`

  Expected:
  - everything PASSes;
  - `packages/design-system/dist/components/OverlayManager/index.js` and `index.d.ts` exist;
  - there are no `stories/` or `__tests__/` under that dist folder;
  - `apps/website/docs/components/overlay-manager.mdx` was generated.

- [ ] **Step 2: Push and get the e2e baselines.**
  1. Rename the branch with the Jira key: `git branch -m feat/<KEY>-overlay-manager`.
  2. Push, then push an empty commit `test(overlay-manager): e2e baselines [update-screenshots]`.
  3. When the CI bot commits the baselines, `git pull` and run `git show --stat <bot sha>`.
  4. Restore any snapshot outside `OverlayManager.e2e.ts-snapshots` with `git checkout origin/main -- <file>`.

  Expected: the bot's follow-up e2e run is green.

- [ ] **Step 3: Open the PR.** Run `/vestige-audit`, then `gh pr create`:
  - title `feat(overlay-manager): open the same Dialog or Drawer from anywhere (<KEY>)`;
  - the body links the spec and this plan, lists the spec deviations above, and states that the export is subpath-only;
  - it ends with the Claude Code attribution line.
