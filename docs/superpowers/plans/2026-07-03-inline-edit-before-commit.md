# InlineEdit Commit Guard (`onBeforeValueCommit`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional `onBeforeValueCommit` guard prop to `InlineEdit` that intercepts every submit before `onValueCommit` and can asynchronously block it (confirmation-dialog use case), plus the internal commit-token mechanism that makes the pending window safe.

**Architecture:** One internal ref-backed token (`pendingCommitRef`) owns the whole submit lifecycle — guard phase and `onValueCommit` promise phase. Suppression and stale-resolution invalidation are token-compares, never status checks. `InlineEditControl` learns to ignore blur while a commit is pending (via a ref-backed `isCommitPending()` on context) and to re-focus the editor when a guard declines (via a `focusEpoch` counter on context).

**Tech Stack:** React 19 (no forwardRef), TypeScript strict, Vitest + Testing Library (unit/integration), Playwright (e2e), Storybook (`storybook-react-rsbuild`), Biome.

**Spec:** `docs/superpowers/specs/2026-07-03-inline-edit-before-commit-design.md` — read it before starting; every semantic decision below is justified there.

## Global Constraints

- Conventional commits enforced by commitlint; scope `inline-edit`, ticket suffix `(WDS-143)` on every commit subject.
- TypeScript strict; **no `any`** (use `unknown` + narrowing; `T` generics).
- No `React.forwardRef` — `ref` is a normal prop (React 19).
- Biome formatting: single quotes, semicolons, trailing commas. Run `pnpm --filter @wallarm-org/design-system lint:fix` before each commit.
- Only an explicit `false` blocks the commit: runtime check is `=== false`, type is `boolean | void | Promise<boolean | void>`.
- Guard rejection / sync throw → status `error` + message, stay editing (same mapping as `onValueCommit` rejection). Resolved `false` → silent (status stays `idle`).
- Status must stay `idle` while a guard is pending — never borrow `loading`.
- The no-guard sync-commit path must stay synchronous in the same tick (no `Promise.resolve().then(...)` wrapping).
- The value committed after guard-`true` is the draft captured at `submit()` time (the same value the guard received). If the draft changed while pending, the resolution is dropped.
- E2E tests follow `docs/e2e-test-rules.md` (Should-sentences, Visual/Interactions/Accessibility groups); all selectors via `data-testid` (never `data-slot`).
- Unit test runs: `pnpm --filter @wallarm-org/design-system test:run <file-filter>` from the repo root.
- E2E runs expect Storybook on `http://localhost:6006` (no webServer in the Playwright config): start `pnpm --filter @wallarm-org/design-system storybook` first, or set `STORYBOOK_URL`.

---

### Task 1: Fix the StrictMode-dead `mounted` ref

The cleanup sets `mounted.current = false` but the effect body never resets it to `true`. Under StrictMode's dev mount→cleanup→remount the ref stays `false` forever, so async commits never complete. The guard continuation (Task 3) relies on this ref — fix it first.

**Files:**
- Modify: `packages/design-system/src/components/InlineEdit/InlineEdit.tsx:106-111`
- Test: `packages/design-system/src/components/InlineEdit/InlineEdit.test.tsx`

**Interfaces:**
- Consumes: existing `InlineEdit` public API.
- Produces: no API change; `mounted.current` is `true` whenever the component is mounted, including after a StrictMode remount.

- [ ] **Step 1: Write the failing test**

Add to `InlineEdit.test.tsx` (inside `describe('InlineEdit', ...)`). Add `StrictMode` to the React import at the top of the file:

```tsx
import { StrictMode } from 'react';
```

```tsx
it('completes an async commit under StrictMode', async () => {
  const onCommit = vi.fn(() => Promise.resolve());
  render(
    <StrictMode>
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} savedDuration={20}>
        <Harness />
      </InlineEdit>
    </StrictMode>,
  );
  await userEvent.click(screen.getByText('edit'));
  await userEvent.click(screen.getByText('submit'));
  await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('saved'));
  await waitFor(() => expect(screen.getByTestId('editing')).toHaveTextContent('false'));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @wallarm-org/design-system test:run InlineEdit.test.tsx`
Expected: FAIL — status stays `loading` (the resolve handler early-returns on the dead `mounted` ref), `waitFor` times out on `'saved'`.

- [ ] **Step 3: Fix the effect**

In `InlineEdit.tsx`, change the mount effect:

```tsx
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    // StrictMode remounts reuse the fiber (and this ref): reset on every
    // effect run, or the cleanup's `false` outlives the simulated remount.
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @wallarm-org/design-system test:run InlineEdit.test.tsx`
Expected: PASS — all tests including the new one.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/InlineEdit/InlineEdit.tsx packages/design-system/src/components/InlineEdit/InlineEdit.test.tsx
git commit -m "fix(inline-edit): reset mounted ref on StrictMode remount (WDS-143)"
```

---

### Task 2: Commit token — stale async resolutions must not commit

Introduce `pendingCommitRef` (a per-submit `symbol`) spanning the `onValueCommit` promise phase, invalidated by `cancel()`/`edit_()`. Fixes the pre-existing bug where Escape during a pending async commit still commits and flashes `saved`. Also moves `onValueCommit`/`savedDuration` behind latest-refs (a later guard window can stay open for minutes; continuations must see current bindings).

**Files:**
- Modify: `packages/design-system/src/components/InlineEdit/InlineEdit.tsx`
- Test: `packages/design-system/src/components/InlineEdit/InlineEdit.test.tsx`

**Interfaces:**
- Consumes: Task 1's fixed `mounted` ref.
- Produces: `pendingCommitRef: MutableRefObject<symbol | null>` inside `InlineEdit` — set for the entire submit lifecycle, `null` when idle. `cancel()`/`edit_()` null it. Later tasks key the guard phase and `isCommitPending()` on it. No public API change.

- [ ] **Step 1: Write the failing test**

Add `act` to the Testing Library import in `InlineEdit.test.tsx`:

```tsx
import { act, render, screen, waitFor } from '@testing-library/react';
```

Add the test:

```tsx
it('drops a late async commit resolution after cancel', async () => {
  let resolve!: () => void;
  const onCommit = vi.fn(
    () =>
      new Promise<void>(r => {
        resolve = r;
      }),
  );
  const onRevert = vi.fn();
  render(
    <InlineEdit defaultValue='hello' onValueCommit={onCommit} onValueRevert={onRevert}>
      <Harness />
    </InlineEdit>,
  );
  await userEvent.click(screen.getByText('edit'));
  await userEvent.click(screen.getByText('setDraft'));
  await userEvent.click(screen.getByText('submit')); // → loading
  await userEvent.click(screen.getByText('cancel')); // user gives up mid-flight
  expect(onRevert).toHaveBeenCalledWith('hello');
  await act(async () => {
    resolve();
    await Promise.resolve();
  });
  // The late resolution must not resurrect the cancelled edit.
  expect(screen.getByTestId('committed')).toHaveTextContent('hello');
  expect(screen.getByTestId('status')).toHaveTextContent('idle');
  expect(screen.getByTestId('editing')).toHaveTextContent('false');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @wallarm-org/design-system test:run InlineEdit.test.tsx`
Expected: FAIL — `committed` shows `draft` and `status` shows `saved` (the resolve handler only checks `mounted`).

- [ ] **Step 3: Implement the token**

In `InlineEdit.tsx`, add refs after the `overrideRef.current = submitModeOverride;` line:

```tsx
  // Owns the whole submit lifecycle (guard phase + commit phase). One symbol
  // per submit; cancel()/edit_() null it, so a late async resolution can
  // prove it still owns the session before touching state. A ref, not state:
  // blur can re-enter submit() in the same tick, before any re-render.
  const pendingCommitRef = useRef<symbol | null>(null);

  // Latest-ref pattern (see draftRef/overrideRef): async continuations must
  // see the consumer's current bindings, not those captured at submit time.
  const onValueCommitRef = useRef(onValueCommit);
  onValueCommitRef.current = onValueCommit;
  const savedDurationRef = useRef(savedDuration);
  savedDurationRef.current = savedDuration;
```

Update `edit_` and `cancel` to invalidate the token (first line of each callback body, before the existing logic):

```tsx
  const edit_ = useCallback(() => {
    if (disabled || readOnly) return;
    pendingCommitRef.current = null;
    draftRef.current = committedValue as T;
    // ...rest unchanged
```

```tsx
  const cancel = useCallback(() => {
    pendingCommitRef.current = null;
    draftRef.current = committedValue as T;
    // ...rest unchanged
```

Replace the whole `submit` callback with:

```tsx
  const submit = useCallback(() => {
    if (pendingCommitRef.current) return;
    if ((status ?? autoStatus) === 'loading') return;
    const current = draftRef.current;
    const token = Symbol('inline-edit-commit');
    pendingCommitRef.current = token;

    const result = onValueCommitRef.current?.(current);
    if (result && typeof (result as PromiseLike<unknown>).then === 'function') {
      setAutoStatus('loading');
      setAutoError(undefined);
      Promise.resolve(result).then(
        () => {
          if (!mounted.current || pendingCommitRef.current !== token) return;
          pendingCommitRef.current = null;
          setCommitted(current);
          setEditingState(false);
          setAutoStatus('saved');
          if (savedTimer.current) clearTimeout(savedTimer.current);
          savedTimer.current = setTimeout(() => {
            if (mounted.current) setAutoStatus('idle');
          }, savedDurationRef.current);
        },
        (reason: unknown) => {
          if (!mounted.current || pendingCommitRef.current !== token) return;
          pendingCommitRef.current = null;
          setAutoStatus('error');
          setAutoError(reason instanceof Error ? reason.message : 'Failed to save');
        },
      );
      return;
    }
    pendingCommitRef.current = null;
    setCommitted(current);
    setEditingState(false);
  }, [setCommitted, setEditingState, status, autoStatus]);
```

Note the dependency array: `onValueCommit` and `savedDuration` are gone (read through refs now).

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @wallarm-org/design-system test:run InlineEdit.test.tsx`
Expected: PASS — the new test and every existing one (in particular `'ignores submit while a commit is already in flight'`: the token check now gates it alongside the loading check).

Also run the whole InlineEdit family to catch regressions in editors:

Run: `pnpm --filter @wallarm-org/design-system test:run src/components/InlineEdit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/InlineEdit/InlineEdit.tsx packages/design-system/src/components/InlineEdit/InlineEdit.test.tsx
git commit -m "fix(inline-edit): ignore stale async commit resolution after cancel (WDS-143)"
```

---

### Task 3: `onBeforeValueCommit` prop — full guard semantics at the root

The guard runs inside `submit()` before `onValueCommit`, for every commit path. Sync results settle in the same tick; thenables hold the token until settlement; only `=== false` blocks; rejection/throw maps to the error path; cancel/draft-divergence/unmount invalidate the resolution.

**Files:**
- Modify: `packages/design-system/src/components/InlineEdit/InlineEdit.tsx`
- Test: `packages/design-system/src/components/InlineEdit/InlineEdit.test.tsx`

**Interfaces:**
- Consumes: Task 2's `pendingCommitRef` + token pattern.
- Produces: public prop `onBeforeValueCommit?: (value: T, committedValue: T) => boolean | void | Promise<boolean | void>` on `InlineEditProps<T>`. Internal: `submit()` contains a local `runCommit()` (the existing commit tail) and a `failCommit(reason: unknown)` error mapper — Task 4's decline branch hooks in here.

- [ ] **Step 1: Extend the test harness**

In `InlineEdit.test.tsx`, add a second draft button to `Harness` (needed by the draft-divergence test):

```tsx
      <button type='button' onClick={() => setValue('draft-2')}>
        setDraft2
      </button>
```

- [ ] **Step 2: Write the failing tests — sync semantics**

Add a new `describe` block after the existing tests:

```tsx
describe('InlineEdit onBeforeValueCommit', () => {
  it('blocks the commit when the guard returns false', async () => {
    const onCommit = vi.fn();
    const guard = vi.fn(() => false);
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    expect(guard).toHaveBeenCalledWith('draft', 'hello');
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('editing')).toHaveTextContent('true');
    expect(screen.getByTestId('value')).toHaveTextContent('draft');
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
  });

  it('proceeds when the guard returns true', async () => {
    const onCommit = vi.fn();
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} onBeforeValueCommit={() => true}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    expect(onCommit).toHaveBeenCalledWith('draft');
    expect(screen.getByTestId('editing')).toHaveTextContent('false');
    expect(screen.getByTestId('committed')).toHaveTextContent('draft');
  });

  it('proceeds when the guard returns nothing — only explicit false blocks', async () => {
    const onCommit = vi.fn();
    const guard = vi.fn(() => undefined);
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    expect(onCommit).toHaveBeenCalledWith('draft');
  });

  it('maps a synchronous guard throw to the error status and stays editing', async () => {
    const onCommit = vi.fn();
    const guard = vi.fn(() => {
      throw new Error('guard blew up');
    });
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('submit'));
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('status')).toHaveTextContent('error');
    expect(screen.getByTestId('editing')).toHaveTextContent('true');
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm --filter @wallarm-org/design-system test:run InlineEdit.test.tsx`
Expected: FAIL — TypeScript/JSX error or all four new tests fail (`onBeforeValueCommit` does not exist).

- [ ] **Step 4: Implement the prop and the guard call**

In `InlineEdit.tsx`, add to `InlineEditProps<T>` (after `onValueRevert`):

```tsx
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
   * shows no status (`idle` — the consumer's confirmation UI is the
   * feedback). Escape still cancels; a late resolution after cancel is
   * dropped. The value committed on `true` is exactly the `value` argument
   * the guard received; if the draft changed while the guard was pending,
   * the resolution is dropped and the field stays in edit mode.
   *
   * Guards must settle via non-blocking UI (a promise resolved by dialog
   * buttons). Synchronous blocking dialogs (`window.confirm`) are
   * unsupported with submitMode 'blur'/'both' (the queued blur re-prompts).
   * The guard's owner never gets its consumer UI closed by the DS — treat
   * the dialog's own buttons as the source of truth for closing it.
   */
  onBeforeValueCommit?: (value: T, committedValue: T) => boolean | void | Promise<boolean | void>;
```

Destructure it in the component signature (after `onValueRevert,`):

```tsx
  onBeforeValueCommit,
```

Add its latest-ref next to `onValueCommitRef`:

```tsx
  const onBeforeValueCommitRef = useRef(onBeforeValueCommit);
  onBeforeValueCommitRef.current = onBeforeValueCommit;
```

Replace the `submit` callback from Task 2 with:

```tsx
  const submit = useCallback(() => {
    if (pendingCommitRef.current) return;
    if ((status ?? autoStatus) === 'loading') return;
    const current = draftRef.current;
    const token = Symbol('inline-edit-commit');

    const failCommit = (reason: unknown) => {
      pendingCommitRef.current = null;
      setAutoStatus('error');
      setAutoError(reason instanceof Error ? reason.message : 'Failed to save');
    };

    // The pre-guard commit tail. Sync results settle in the same tick — the
    // sync-commit contract must not gain a microtask window.
    const runCommit = () => {
      const result = onValueCommitRef.current?.(current);
      if (result && typeof (result as PromiseLike<unknown>).then === 'function') {
        setAutoStatus('loading');
        setAutoError(undefined);
        Promise.resolve(result).then(
          () => {
            if (!mounted.current || pendingCommitRef.current !== token) return;
            pendingCommitRef.current = null;
            setCommitted(current);
            setEditingState(false);
            setAutoStatus('saved');
            if (savedTimer.current) clearTimeout(savedTimer.current);
            savedTimer.current = setTimeout(() => {
              if (mounted.current) setAutoStatus('idle');
            }, savedDurationRef.current);
          },
          (reason: unknown) => {
            if (!mounted.current || pendingCommitRef.current !== token) return;
            failCommit(reason);
          },
        );
        return;
      }
      pendingCommitRef.current = null;
      setCommitted(current);
      setEditingState(false);
    };

    pendingCommitRef.current = token;

    const guard = onBeforeValueCommitRef.current;
    if (!guard) {
      runCommit();
      return;
    }

    let verdict: boolean | void | Promise<boolean | void>;
    try {
      verdict = guard(current, committedValue as T);
    } catch (reason) {
      failCommit(reason);
      return;
    }

    if (verdict && typeof (verdict as PromiseLike<unknown>).then === 'function') {
      (verdict as Promise<boolean | void>).then(
        resolved => {
          if (!mounted.current || pendingCommitRef.current !== token) return;
          if (resolved === false) {
            pendingCommitRef.current = null;
            return;
          }
          if (draftRef.current !== current) {
            // The guard approved `current`, but the draft moved on — the
            // approval no longer describes what would be committed. Decline.
            pendingCommitRef.current = null;
            return;
          }
          runCommit();
        },
        (reason: unknown) => {
          if (!mounted.current || pendingCommitRef.current !== token) return;
          failCommit(reason);
        },
      );
      return;
    }

    if (verdict === false) {
      pendingCommitRef.current = null;
      return;
    }
    runCommit();
  }, [setCommitted, setEditingState, status, autoStatus, committedValue]);
```

Note `committedValue` joins the dependency array (the guard receives it).

- [ ] **Step 5: Run the sync tests to verify they pass**

Run: `pnpm --filter @wallarm-org/design-system test:run InlineEdit.test.tsx`
Expected: PASS — all tests.

- [ ] **Step 6: Write the failing tests — async semantics**

Add inside the same `describe('InlineEdit onBeforeValueCommit', ...)` block:

```tsx
  it('commits after the guard resolves true', async () => {
    const onCommit = vi.fn();
    let resolve!: (ok: boolean) => void;
    const guard = vi.fn(
      () =>
        new Promise<boolean>(r => {
          resolve = r;
        }),
    );
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('status')).toHaveTextContent('idle'); // no loading during guard
    await act(async () => {
      resolve(true);
      await Promise.resolve();
    });
    expect(onCommit).toHaveBeenCalledWith('draft');
    expect(screen.getByTestId('editing')).toHaveTextContent('false');
    expect(screen.getByTestId('committed')).toHaveTextContent('draft');
  });

  it('stays editing with the draft when the guard resolves false', async () => {
    const onCommit = vi.fn();
    let resolve!: (ok: boolean) => void;
    const guard = vi.fn(
      () =>
        new Promise<boolean>(r => {
          resolve = r;
        }),
    );
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    await act(async () => {
      resolve(false);
      await Promise.resolve();
    });
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('editing')).toHaveTextContent('true');
    expect(screen.getByTestId('value')).toHaveTextContent('draft');
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
  });

  it('runs the async commit lifecycle after guard-true (loading then error, stays editing)', async () => {
    const onCommit = vi.fn(() => Promise.reject(new Error('save failed')));
    render(
      <InlineEdit
        defaultValue='hello'
        onValueCommit={onCommit}
        onBeforeValueCommit={() => Promise.resolve(true)}
      >
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('submit'));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('error'));
    expect(screen.getByTestId('editing')).toHaveTextContent('true');
  });

  it('suppresses duplicate submits while the guard is pending', async () => {
    const guard = vi.fn(() => new Promise<boolean>(() => {})); // never settles
    render(
      <InlineEdit defaultValue='hello' onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('submit'));
    await userEvent.click(screen.getByText('submit'));
    expect(guard).toHaveBeenCalledTimes(1);
  });

  it('suppresses duplicate submits even when status is consumer-controlled idle', async () => {
    const guard = vi.fn(() => new Promise<boolean>(() => {}));
    render(
      <InlineEdit defaultValue='hello' status='idle' onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('submit'));
    await userEvent.click(screen.getByText('submit'));
    expect(guard).toHaveBeenCalledTimes(1);
  });

  it('drops a late guard resolution after cancel', async () => {
    const onCommit = vi.fn();
    const onRevert = vi.fn();
    let resolve!: (ok: boolean) => void;
    const guard = vi.fn(
      () =>
        new Promise<boolean>(r => {
          resolve = r;
        }),
    );
    render(
      <InlineEdit
        defaultValue='hello'
        onValueCommit={onCommit}
        onValueRevert={onRevert}
        onBeforeValueCommit={guard}
      >
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    await userEvent.click(screen.getByText('cancel'));
    expect(onRevert).toHaveBeenCalledWith('hello');
    await act(async () => {
      resolve(true);
      await Promise.resolve();
    });
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('editing')).toHaveTextContent('false');
    expect(screen.getByTestId('committed')).toHaveTextContent('hello');
  });

  it('drops the resolution when the draft changed while the guard was pending', async () => {
    const onCommit = vi.fn();
    let resolve!: (ok: boolean) => void;
    const guard = vi.fn(
      () =>
        new Promise<boolean>(r => {
          resolve = r;
        }),
    );
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    await userEvent.click(screen.getByText('setDraft2')); // keeps typing while pending
    await act(async () => {
      resolve(true);
      await Promise.resolve();
    });
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('editing')).toHaveTextContent('true');
    expect(screen.getByTestId('value')).toHaveTextContent('draft-2');
  });

  it('maps a guard rejection to the error status and stays editing', async () => {
    const onCommit = vi.fn();
    render(
      <InlineEdit
        defaultValue='hello'
        onValueCommit={onCommit}
        onBeforeValueCommit={() => Promise.reject(new Error('confirm failed'))}
      >
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('submit'));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('error'));
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('editing')).toHaveTextContent('true');
  });

  it('does not commit when unmounted while the guard is pending', async () => {
    const onCommit = vi.fn();
    let resolve!: (ok: boolean) => void;
    const guard = vi.fn(
      () =>
        new Promise<boolean>(r => {
          resolve = r;
        }),
    );
    const { unmount } = render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    unmount();
    resolve(true);
    await act(async () => {
      await Promise.resolve();
    });
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('fires onEditChange(false) only after the guard resolves true (controlled edit)', async () => {
    const onEditChange = vi.fn();
    let resolve!: (ok: boolean) => void;
    const guard = vi.fn(
      () =>
        new Promise<boolean>(r => {
          resolve = r;
        }),
    );
    render(
      <InlineEdit value='hello' edit onEditChange={onEditChange} onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    expect(onEditChange).not.toHaveBeenCalled();
    await act(async () => {
      resolve(true);
      await Promise.resolve();
    });
    expect(onEditChange).toHaveBeenCalledWith(false);
  });
```

- [ ] **Step 7: Run the tests**

Run: `pnpm --filter @wallarm-org/design-system test:run InlineEdit.test.tsx`
Expected: PASS — the implementation in Step 4 already covers the async semantics. If any test fails, fix the implementation (not the test) until green: each of these tests encodes a spec clause.

- [ ] **Step 8: Lint, typecheck, commit**

```bash
pnpm --filter @wallarm-org/design-system lint:fix
pnpm --filter @wallarm-org/design-system typecheck
git add packages/design-system/src/components/InlineEdit/InlineEdit.tsx packages/design-system/src/components/InlineEdit/InlineEdit.test.tsx
git commit -m "feat(inline-edit): onBeforeValueCommit commit guard (WDS-143)"
```

---

> **Post-implementation note:** the `focusEpoch` decline focus-restore below
> was removed after browser e2e showed it wedges a modal confirmation dialog
> open (the DS `.focus()` races the dialog's own close-time restore). Only the
> `isCommitPending` blur-suppression shipped; the modal dialog restores focus
> itself. See the spec's "Decline UX and focus" section.

### Task 4: Control integration — blur suppression and decline focus-restore

The root exposes two new context fields: ref-backed `isCommitPending()` (synchronous — blur can fire in the same tick the guard opens a dialog) and `focusEpoch` (bumped on decline so `InlineEditControl` re-runs its focus routine). The control's blur handler becomes a no-op while a commit is pending; Escape keeps working.

**Files:**
- Modify: `packages/design-system/src/components/InlineEdit/InlineEditContext.ts`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEdit.tsx`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEditControl.tsx`
- Test: `packages/design-system/src/components/InlineEdit/InlineEdit.integration.test.tsx`
- Test (context test-double fix-ups if needed): `packages/design-system/src/components/InlineEditContext.test.tsx`, `packages/design-system/src/components/InlineEdit/InlineEditControl.test.tsx`

**Interfaces:**
- Consumes: `pendingCommitRef` from Task 2; the guard decline branch from Task 3.
- Produces: `InlineEditContextValue` gains `isCommitPending: () => boolean` and `focusEpoch: number`. `InlineEditControl` consumes both. Any test that builds a fake context value must add these two fields.

- [ ] **Step 1: Write the failing integration tests**

In `InlineEdit.integration.test.tsx`, add `act` and `waitFor` to the Testing Library import:

```tsx
import { act, render, screen, waitFor } from '@testing-library/react';
```

Add a new `describe` block:

```tsx
function deferredBoolean() {
  let resolve!: (ok: boolean) => void;
  const promise = new Promise<boolean>(r => {
    resolve = r;
  });
  return { promise, resolve };
}

describe('InlineEdit commit guard integration', () => {
  function GuardedExample({
    guard,
    onCommit,
    onRevert,
    submitMode,
  }: {
    guard: (value: string, committed: string) => Promise<boolean>;
    onCommit?: (v: string) => void;
    onRevert?: (v: string) => void;
    submitMode?: 'enter' | 'blur' | 'both' | 'none';
  }) {
    return (
      <>
        <InlineEdit
          defaultValue='a@x.io'
          submitMode={submitMode}
          onBeforeValueCommit={guard}
          onValueCommit={onCommit}
          onValueRevert={onRevert}
          data-testid='g'
        >
          <InlineEditPreview>a@x.io</InlineEditPreview>
          <InlineEditControl>
            <InlineEditInput />
          </InlineEditControl>
        </InlineEdit>
        <button type='button'>outside</button>
      </>
    );
  }

  it('ignores focus loss while the guard is pending (submitMode enter would cancel)', async () => {
    const d = deferredBoolean();
    const guard = vi.fn(() => d.promise);
    const onCommit = vi.fn();
    const onRevert = vi.fn();
    render(
      <GuardedExample guard={guard} onCommit={onCommit} onRevert={onRevert} submitMode='enter' />,
    );
    await userEvent.click(screen.getByTestId('g--preview'));
    const input = screen.getByTestId('g--input');
    await userEvent.clear(input);
    await userEvent.type(input, 'b@x.io{Enter}');
    expect(guard).toHaveBeenCalledWith('b@x.io', 'a@x.io');
    await userEvent.click(screen.getByText('outside')); // the dialog stealing focus
    expect(onRevert).not.toHaveBeenCalled();
    expect(screen.getByTestId('g--input')).toHaveValue('b@x.io');
    await act(async () => {
      d.resolve(true);
      await Promise.resolve();
    });
    expect(onCommit).toHaveBeenCalledWith('b@x.io');
  });

  it('does not re-submit on blur while the guard is pending (submitMode both)', async () => {
    const d = deferredBoolean();
    const guard = vi.fn(() => d.promise);
    const onCommit = vi.fn();
    render(<GuardedExample guard={guard} onCommit={onCommit} submitMode='both' />);
    await userEvent.click(screen.getByTestId('g--preview'));
    const input = screen.getByTestId('g--input');
    await userEvent.clear(input);
    await userEvent.type(input, 'b@x.io{Enter}');
    await userEvent.click(screen.getByText('outside'));
    expect(guard).toHaveBeenCalledTimes(1);
    await act(async () => {
      d.resolve(false);
      await Promise.resolve();
    });
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('g--input')).toHaveValue('b@x.io');
  });

  it('returns focus to the editor when the guard declines', async () => {
    const d = deferredBoolean();
    const guard = vi.fn(() => d.promise);
    render(<GuardedExample guard={guard} />);
    await userEvent.click(screen.getByTestId('g--preview'));
    const input = screen.getByTestId('g--input');
    await userEvent.clear(input);
    await userEvent.type(input, 'b@x.io{Enter}');
    await userEvent.click(screen.getByText('outside')); // focus leaves, like a dialog
    await act(async () => {
      d.resolve(false);
      await Promise.resolve();
    });
    await waitFor(() => expect(screen.getByTestId('g--input')).toHaveFocus());
    expect(screen.getByTestId('g--input')).toHaveValue('b@x.io');
  });

  it('invokes the guard once even when it synchronously steals focus', async () => {
    // A guard that opens a dialog imperatively (showModal/.focus()) moves
    // focus inside its own invocation — the resulting blur-submit fires in
    // the same tick, before any re-render. The token is set before the guard
    // runs, so the re-entrant submit must be a no-op.
    const guard = vi.fn(() => {
      screen.getByText('outside').focus();
      return new Promise<boolean>(() => {}); // never settles
    });
    render(<GuardedExample guard={guard} submitMode='both' />);
    await userEvent.click(screen.getByTestId('g--preview'));
    const input = screen.getByTestId('g--input');
    await userEvent.clear(input);
    await userEvent.type(input, 'b@x.io{Enter}');
    expect(guard).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('g--input')).toHaveValue('b@x.io');
  });

  it('Escape during a pending guard cancels and defuses the resolution', async () => {
    const d = deferredBoolean();
    const guard = vi.fn(() => d.promise);
    const onCommit = vi.fn();
    const onRevert = vi.fn();
    render(<GuardedExample guard={guard} onCommit={onCommit} onRevert={onRevert} />);
    await userEvent.click(screen.getByTestId('g--preview'));
    const input = screen.getByTestId('g--input');
    await userEvent.clear(input);
    await userEvent.type(input, 'b@x.io{Enter}');
    await userEvent.keyboard('{Escape}');
    expect(onRevert).toHaveBeenCalledWith('a@x.io');
    await act(async () => {
      d.resolve(true);
      await Promise.resolve();
    });
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('g--preview')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @wallarm-org/design-system test:run InlineEdit.integration.test.tsx`
Expected: FAIL — `'ignores focus loss...'` fails on `onRevert` having been called (blur → cancel destroys the session); `'returns focus...'` fails on focus.

- [ ] **Step 3: Extend the context type**

In `InlineEditContext.ts`, add to `InlineEditContextValue<T>` after `selectOnFocus: boolean;`:

```tsx
  /**
   * True while a submit is held by a pending `onBeforeValueCommit` guard or
   * an in-flight `onValueCommit` promise. Ref-backed function so event
   * handlers get a synchronous answer — blur can fire in the same tick the
   * guard opens a dialog, before any re-render.
   */
  isCommitPending: () => boolean;
  /**
   * Increments when a declined guard hands focus back to the editor.
   * `InlineEditControl` re-runs its focus routine when it changes.
   */
  focusEpoch: number;
```

- [ ] **Step 4: Produce both fields from the root**

In `InlineEdit.tsx`:

Add state and the stable callback (next to the other state declarations):

```tsx
  const [focusEpoch, setFocusEpoch] = useState(0);
```

```tsx
  const isCommitPending = useCallback(() => pendingCommitRef.current !== null, []);
```

In the guard's resolve handler (Task 3, Step 4), bump the epoch on decline — the `resolved === false` branch becomes:

```tsx
          if (resolved === false) {
            pendingCommitRef.current = null;
            // Hand focus back to the editor: the consumer's dialog stole it,
            // and no editing:false→true transition will re-run the routine.
            setFocusEpoch(e => e + 1);
            return;
          }
```

Add both to the context value and the `useMemo` dependency array:

```tsx
      selectOnFocus,
      isCommitPending,
      focusEpoch,
```

(in the object literal), and `isCommitPending, focusEpoch,` in the deps list.

- [ ] **Step 5: Consume both in the control**

In `InlineEditControl.tsx`:

```tsx
  const { editing, selectOnFocus, submit, cancel, isCommitPending, focusEpoch } = ctx;
```

Focus effect — change the dependency array and the leading comment:

```tsx
  // Focus the first focusable descendant each time editing begins, and again
  // when a declined commit guard bumps focusEpoch (the consumer's dialog took
  // focus; nothing else will hand it back).
  useEffect(() => {
    if (!editing) return;
    const node = divRef.current;
    if (!node) return;
    const focusable = node.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusable) return;
    focusable.focus();
    if (
      selectOnFocusRef.current &&
      (focusable instanceof HTMLInputElement || focusable instanceof HTMLTextAreaElement)
    ) {
      focusable.select();
    }
  }, [editing, focusEpoch]);
```

Blur handler — add the pending check after the containment check:

```tsx
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    onBlur?.(event);
    if (event.defaultPrevented) return;
    // Ignore focus moves that stay inside the control.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    // A pending commit guard owns the session: focus moving to the consumer's
    // confirmation dialog is incidental — it must neither submit nor cancel.
    if (isCommitPending()) return;
    // `none`: the editor commits through its own events (e.g. a select/calendar
    // closing) — blur must NOT cancel, or it would revert that committed value.
    if (submitsOnBlur) submit();
    else if (submitMode !== 'none') cancel();
  };
```

- [ ] **Step 6: Fix any fake-context test doubles**

Run: `pnpm --filter @wallarm-org/design-system test:run src/components/InlineEdit`
If `InlineEditContext.test.tsx` or `InlineEditControl.test.tsx` construct an `InlineEditContextValue` literal, add the two new fields to it:

```tsx
  isCommitPending: () => false,
  focusEpoch: 0,
```

- [ ] **Step 7: Run all InlineEdit tests to verify they pass**

Run: `pnpm --filter @wallarm-org/design-system test:run src/components/InlineEdit`
Expected: PASS — including all four new integration tests.

- [ ] **Step 8: Lint, typecheck, commit**

```bash
pnpm --filter @wallarm-org/design-system lint:fix
pnpm --filter @wallarm-org/design-system typecheck
git add packages/design-system/src/components/InlineEdit/
git commit -m "feat(inline-edit): hold edit session during pending commit guard (WDS-143)"
```

---

### Task 5: Storybook — ConfirmCommit story, CustomEditor buttons, docs

One new story showing the Dialog confirmation recipe for a text input and a select (the parked-state editor family), plus the `onMouseDown` preventDefault guidance on custom confirm/cancel buttons, plus the component docs mention.

**Files:**
- Modify: `packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx`

**Interfaces:**
- Consumes: `onBeforeValueCommit` from Task 3.
- Produces: story exports `ConfirmCommit` (Storybook URL id `data-display-inlineedit--confirm-commit`, helper name `'Confirm Commit'`); test ids `confirm-email`, `confirm-role`, `confirm-dialog`, `confirm-decline`, `confirm-accept`, `custom-confirm`, `custom-cancel` — Task 6's e2e tests target exactly these.

- [ ] **Step 1: Add imports**

In `InlineEdit.stories.tsx`, extend the React import and add DS imports:

```tsx
import { useRef, useState } from 'react';
```

```tsx
import { Button } from '../Button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogFooterControls,
  DialogHeader,
  DialogTitle,
} from '../Dialog';
```

- [ ] **Step 2: Add the ConfirmCommit story**

Append after the `CustomEditor` story:

```tsx
export const ConfirmCommit: StoryFn = () => {
  const [email, setEmail] = useState('dev@wallarm.com');
  const [role, setRole] = useState<string[]>(['editor']);
  const [pending, setPending] = useState<string | null>(null);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  // Promise-based confirm: the guard returns this promise and the dialog
  // buttons settle it. The DS never closes the dialog — `settle` does.
  const confirmChange = (message: string) =>
    new Promise<boolean>(resolve => {
      resolverRef.current = resolve;
      setPending(message);
    });

  const settle = (ok: boolean) => {
    resolverRef.current?.(ok);
    resolverRef.current = null;
    setPending(null);
  };

  const roleLabel = roleItems.find(i => i.value === (role[0] ?? ''))?.label ?? '';

  return (
    <div className='flex w-[320px] flex-col gap-8'>
      <Row label='Email'>
        <InlineEdit
          value={email}
          onBeforeValueCommit={(next, prev) =>
            next === prev || confirmChange(`Change email to ${next as string}?`)
          }
          onValueCommit={v => setEmail(v as string)}
          data-testid='confirm-email'
        >
          <InlineEditPreview>{email}</InlineEditPreview>
          <InlineEditControl>
            <InlineEditInput type='email' aria-label='Email' />
          </InlineEditControl>
        </InlineEdit>
      </Row>

      <Row label='Role'>
        <InlineEdit
          value={role}
          onBeforeValueCommit={(next, prev) => {
            // The guard fires on every popover close, including no-op ones —
            // short-circuit when nothing changed (for dates use `.compare()`).
            const nextRole = (next as string[]).join();
            if (nextRole === (prev as string[]).join()) return true;
            const label = roleItems.find(i => i.value === (next as string[])[0])?.label ?? nextRole;
            return confirmChange(`Change role to ${label}?`);
          }}
          onValueCommit={v => setRole(v as string[])}
          data-testid='confirm-role'
        >
          <InlineEditPreview triggerIcon={<ChevronDown size='md' />}>{roleLabel}</InlineEditPreview>
          <InlineEditControl>
            <InlineEditSelect items={roleItems} />
          </InlineEditControl>
        </InlineEdit>
      </Row>

      <Dialog
        open={pending !== null}
        onOpenChange={open => {
          if (!open) settle(false);
        }}
        data-testid='confirm-dialog'
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm change</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text>{pending}</Text>
          </DialogBody>
          <DialogFooter>
            <DialogFooterControls>
              <Button
                variant='ghost'
                color='neutral'
                size='large'
                onClick={() => settle(false)}
                data-testid='confirm-decline'
              >
                Cancel
              </Button>
              <Button
                variant='primary'
                color='brand'
                size='large'
                onClick={() => settle(true)}
                data-testid='confirm-accept'
              >
                Change
              </Button>
            </DialogFooterControls>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

ConfirmCommit.parameters = {
  docs: {
    description: {
      story:
        'The `onBeforeValueCommit` guard intercepts every commit before `onValueCommit` runs. ' +
        'Return a promise resolved by your own confirmation UI: `false` silently keeps the field ' +
        'in edit mode with the typed draft (no error state) and focus returns to the editor; any ' +
        'other result lets the commit proceed; a rejection maps to the error status. The guard ' +
        'fires for every commit path — Enter, blur, popover close — including no-op submits, so ' +
        'short-circuit on unchanged values (`next === prev`; use `.compare()` for date values ' +
        'and an item comparison for arrays). Declining a popover editor (the Role select here) ' +
        'leaves it parked in edit mode with the popover closed: reopen and re-close to be asked ' +
        'again, or press Escape inside the field to revert. The DS never closes your dialog — ' +
        'its own buttons must settle the promise and close it.',
    },
  },
};
```

- [ ] **Step 3: Add confirm/cancel buttons to the CustomEditor story**

Replace the `InlineEditControl` block inside `CustomEditor` with:

```tsx
          <InlineEditControl submitMode='both'>
            {({ value: draft, setValue: setDraft, submit, cancel }) => (
              <span className='flex items-center gap-4'>
                <Input
                  aria-label='Custom'
                  value={(draft as string) ?? ''}
                  onChange={e => setDraft(e.target.value.toUpperCase())}
                  className='h-28 px-8'
                />
                {/* preventDefault on mousedown keeps focus in the input, so
                    Safari's click-after-blur ordering cannot fire a blur
                    submit/cancel before the button's click lands. */}
                <Button
                  variant='primary'
                  color='brand'
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => submit()}
                  data-testid='custom-confirm'
                >
                  Save
                </Button>
                <Button
                  variant='ghost'
                  color='neutral'
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => cancel()}
                  data-testid='custom-cancel'
                >
                  Cancel
                </Button>
              </span>
            )}
          </InlineEditControl>
```

Append to the existing `CustomEditor.parameters` docs description string:

```tsx
        ' Custom confirm/cancel buttons should call `e.preventDefault()` in `onMouseDown`: it ' +
        'keeps focus in the input, so browsers that do not focus buttons on mousedown (Safari, ' +
        'macOS Firefox) cannot fire a blur submit/cancel before the click lands.',
```

- [ ] **Step 4: Mention the guard in the component docs**

In the `meta.parameters.docs.description.component` string, append after `'and submit-mode handling (enter, blur, both, or none).'`:

```tsx
          ' An optional `onBeforeValueCommit` guard intercepts every commit — return `false` ' +
          '(or a promise resolving to `false`) to keep the field in edit mode, e.g. after a ' +
          'declined confirmation dialog.',
```

- [ ] **Step 5: Verify in Storybook**

Run: `pnpm --filter @wallarm-org/design-system storybook`
Open `http://localhost:6006/?path=/story/data-display-inlineedit--confirm-commit` and check manually:
- Edit email → Enter → dialog opens; **Cancel** → input still editing with the draft, focused; **Change** → preview shows the new email.
- Enter without changing → no dialog, edit closes.
- Role select: pick a new option → dialog; Cancel → collapsed trigger stays in edit mode; reopen + pick → dialog again; Change → preview updates.

Leave Storybook running for Task 6.

- [ ] **Step 6: Lint, typecheck, commit**

```bash
pnpm --filter @wallarm-org/design-system lint:fix
pnpm --filter @wallarm-org/design-system typecheck
git add packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx
git commit -m "docs(inline-edit): confirm-commit story and mousedown guidance (WDS-143)"
```

---

### Task 6: E2E coverage

Follows `docs/e2e-test-rules.md`: Should-sentences, Visual/Interactions/Accessibility groups, `data-testid` selectors only.

**Files:**
- Modify: `packages/design-system/src/components/InlineEdit/InlineEdit.e2e.ts`

**Interfaces:**
- Consumes: story `'Confirm Commit'` and the test ids from Task 5. `InlineEditSelect`'s trigger renders test id `{base}--input` (`useTestId('input')`), so the role trigger is `confirm-role--input`.
- Produces: e2e specs + one new screenshot baseline (generated by CI via the `[update-screenshots]` commit trigger).

- [ ] **Step 1: Register the story in the helper**

```ts
const inlineEditStory = createStoryHelper('data-display-inlineedit', [
  'Gallery',
  'States',
  'Async',
  'Non Editable',
  'Custom Editor',
  'Confirm Commit',
] as const);
```

- [ ] **Step 2: Add the Visual test**

Inside `test.describe('Visual', ...)`:

```ts
    test('Should render the commit confirmation dialog correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Confirm Commit');
      await page.getByTestId('confirm-email--preview').click();
      const input = page.getByTestId('confirm-email--input');
      await input.fill('new@wallarm.com');
      await input.press('Enter');
      await expect(page.getByTestId('confirm-dialog--content')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
```

(`confirm-dialog--content` is the cascaded test id: `DialogContent` calls `useTestId('content')` under the `confirm-dialog` root.)

- [ ] **Step 3: Add the Interactions tests**

Inside `test.describe('Interactions', ...)`:

```ts
    test('Should keep editing with the draft when the confirmation is declined', async ({
      page,
    }) => {
      await inlineEditStory.goto(page, 'Confirm Commit');
      await page.getByTestId('confirm-email--preview').click();
      const input = page.getByTestId('confirm-email--input');
      await input.fill('new@wallarm.com');
      await input.press('Enter');
      await page.getByTestId('confirm-decline').click();
      await expect(input).toBeVisible();
      await expect(input).toHaveValue('new@wallarm.com');
    });

    test('Should commit when the confirmation is accepted', async ({ page }) => {
      await inlineEditStory.goto(page, 'Confirm Commit');
      await page.getByTestId('confirm-email--preview').click();
      const input = page.getByTestId('confirm-email--input');
      await input.fill('new@wallarm.com');
      await input.press('Enter');
      await page.getByTestId('confirm-accept').click();
      await expect(page.getByTestId('confirm-email--preview')).toHaveText(/new@wallarm.com/);
    });

    test('Should not prompt when the submitted value is unchanged', async ({ page }) => {
      await inlineEditStory.goto(page, 'Confirm Commit');
      await page.getByTestId('confirm-email--preview').click();
      await page.getByTestId('confirm-email--input').press('Enter');
      await expect(page.getByTestId('confirm-email--preview')).toBeVisible();
      await expect(page.getByTestId('confirm-accept')).toBeHidden();
    });

    test('Should park a declined select in edit mode and ask again on reclose', async ({
      page,
    }) => {
      await inlineEditStory.goto(page, 'Confirm Commit');
      await page.getByTestId('confirm-role--preview').click();
      await page.getByRole('option', { name: 'Admin' }).click(); // closes popover → guard
      await page.getByTestId('confirm-decline').click();
      // Parked: still in edit mode (collapsed trigger, no preview).
      await expect(page.getByTestId('confirm-role--preview')).toBeHidden();
      await expect(page.getByTestId('confirm-role--input')).toBeVisible();
      // Recovery: reopen and re-close the popover — the guard fires again.
      await page.getByTestId('confirm-role--input').click();
      await page.getByRole('option', { name: 'Admin' }).click();
      await page.getByTestId('confirm-accept').click();
      await expect(page.getByTestId('confirm-role--preview')).toHaveText(/Admin/);
    });
```

- [ ] **Step 4: Add the Accessibility test**

Inside `test.describe('Accessibility', ...)` (create the group if the file does not have one yet):

```ts
    test('Should return focus to the editor when the confirmation is declined', async ({
      page,
    }) => {
      await inlineEditStory.goto(page, 'Confirm Commit');
      await page.getByTestId('confirm-email--preview').click();
      const input = page.getByTestId('confirm-email--input');
      await input.fill('new@wallarm.com');
      await input.press('Enter');
      // Focus moved into the dialog while it decides.
      await expect(page.getByTestId('confirm-decline')).toBeVisible();
      await expect(input).not.toBeFocused();
      await page.getByTestId('confirm-decline').click();
      await expect(input).toBeFocused();
    });
```

- [ ] **Step 5: Run the e2e suite locally**

With Storybook still running from Task 5 (or restart it):

Run: `pnpm --filter @wallarm-org/design-system e2e InlineEdit.e2e.ts`
Expected: all tests pass except the new Visual test, which fails with "snapshot doesn't exist" — that baseline is generated in CI.

Generate the local baseline so the suite is green locally:

Run: `pnpm --filter @wallarm-org/design-system e2e InlineEdit.e2e.ts --update-snapshots`
Then re-run without the flag: PASS.

- [ ] **Step 6: Commit (with the screenshot trigger)**

The `[update-screenshots]` trigger makes CI regenerate Linux baselines on main:

```bash
git add packages/design-system/src/components/InlineEdit/InlineEdit.e2e.ts packages/design-system/src/components/InlineEdit/InlineEdit.e2e.ts-snapshots
git commit -m "test(inline-edit): commit guard e2e coverage [update-screenshots] (WDS-143)"
```

---

### Task 7: Full verification pass

**Files:** none new — verification only.

**Interfaces:**
- Consumes: everything above.
- Produces: a green branch ready for PR review.

- [ ] **Step 1: Run the full quality gate**

```bash
pnpm --filter @wallarm-org/design-system lint
pnpm --filter @wallarm-org/design-system typecheck
pnpm --filter @wallarm-org/design-system test:run
```

Expected: zero Biome errors, zero TS errors, all unit/integration tests pass.

- [ ] **Step 2: Check the spec against the result**

Open `docs/superpowers/specs/2026-07-03-inline-edit-before-commit-design.md` and verify each "In scope" bullet has landed: guard prop + JSDoc; token spanning both phases; blur suppression; decline focus restore; both pre-existing bug fixes; story; unit + integration + e2e tests. The spec's naming decision (`onBeforeValueCommit`) must match the shipped prop name everywhere (grep for `onBeforeCommit` to catch strays).

- [ ] **Step 3: Verify the change end-to-end in Storybook**

Run the ConfirmCommit story once more and walk the driving scenario: edit email → Enter → decline → draft intact and focused → Enter → accept → committed. This is the spec's acceptance scenario.

- [ ] **Step 4: Push and open the PR (if requested)**

PR title (conventional-commit format, required by CI): `feat(inline-edit): onBeforeValueCommit commit guard (WDS-143)`.
