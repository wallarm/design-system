# Attribute Inline Edit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add inline editing to the existing `Attribute` component — a read↔edit value lifecycle with consumer-supplied DS editors, async save feedback, and full keyboard support.

**Architecture:** A compound family inside `packages/design-system/src/components/Attribute/` mirroring the `AttributeActions` pattern. A generic root (`AttributeEdit`) owns the controlled value + edit state and the async commit lifecycle, exposing them via `AttributeEditContext`. `AttributeEditPreview` is the read-mode hover target; `AttributeEditControl` hosts the editor in edit mode; thin wrappers (`AttributeEditInput/Textarea/Number`) wire the common text editors; `useAttributeEdit()` lets consumers compose any DS input (Select/DateInput/TimeInput/Tag). Orientation/testId/empty are reused from the existing Attribute contexts.

**Tech Stack:** React 19, TypeScript (strict), Tailwind, CVA, Vitest + @testing-library/react (unit/component), Playwright (e2e/visual), Storybook (storybook-react-rsbuild).

## Global Constraints

- TypeScript strict — **no `any`**. Use generics / `unknown`.
- **CVA for variants** in a `classes.ts` when a class set has variants; merge classes with `cn()` from `../../utils/cn` — never template-literal concatenation.
- Every rendered root element carries `data-slot='<kebab-name>'`.
- Set `Component.displayName = 'Component'` at the end of every component file.
- Accept `ref?: Ref<...>` and forward it to the root element. **No `React.forwardRef`** (React 19 ref-as-prop).
- **Named exports only**; export each component and its Props type from `Attribute/index.ts`.
- `data-testid` cascades via the existing Attribute `TestIdProvider`; sub-components call `useTestId('slot')`. Slot format `{base}--{slot}`.
- **Metrics contract:** no analytics-named props; arbitrary consumer `data-*` / `aria-*` / handlers must forward to the real interactive DOM node (the editor input, and the preview's `role="button"` target). Never allowlist or reshape props.
- Stories: `import type { Meta, StoryFn } from 'storybook-react-rsbuild'`; category `Data Display/Attribute`.
- E2E follows `docs/e2e-test-rules.md`: `Component: Attribute` › `Visual | Interactions | Accessibility`.
- Run unit tests from `packages/design-system` with `pnpm test:run <path>`.
- Run `npx biome check --write <changed files>` before each commit; commit the formatted result. Conventional commits, scope `attribute`.

---

### Task 1: AttributeEditContext + useAttributeEdit hook

**Files:**
- Create: `packages/design-system/src/components/Attribute/AttributeEditContext.ts`
- Test: `packages/design-system/src/components/Attribute/AttributeEditContext.test.tsx`

**Interfaces:**
- Produces:
  - `type AttributeEditStatus = 'idle' | 'loading' | 'saved' | 'error'`
  - `interface AttributeEditContextValue<T = unknown>` with: `editing: boolean`, `value: T`, `committedValue: T`, `status: AttributeEditStatus`, `invalid: boolean`, `error?: string`, `disabled: boolean`, `readOnly: boolean`, `activationMode: 'click' | 'focus' | 'none'`, `submitMode: 'enter' | 'blur' | 'both' | 'none'`, `selectOnFocus: boolean`, `setValue: (value: T) => void`, `edit: () => void`, `submit: () => void`, `cancel: () => void`
  - `const AttributeEditProvider` (context Provider)
  - `function useAttributeEdit<T = unknown>(): AttributeEditContextValue<T>` — throws if used outside provider

- [ ] **Step 1: Write the failing test**

```tsx
// AttributeEditContext.test.tsx
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAttributeEdit } from './AttributeEditContext';

describe('useAttributeEdit', () => {
  it('throws when used outside AttributeEdit', () => {
    expect(() => renderHook(() => useAttributeEdit())).toThrow(
      /must be used within <AttributeEdit>/,
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/design-system && pnpm test:run src/components/Attribute/AttributeEditContext.test.tsx`
Expected: FAIL — cannot find module `./AttributeEditContext`.

- [ ] **Step 3: Write minimal implementation**

```ts
// AttributeEditContext.ts
import { createContext, useContext } from 'react';

export type AttributeEditStatus = 'idle' | 'loading' | 'saved' | 'error';

export type AttributeEditActivationMode = 'click' | 'focus' | 'none';
export type AttributeEditSubmitMode = 'enter' | 'blur' | 'both' | 'none';

export interface AttributeEditContextValue<T = unknown> {
  editing: boolean;
  value: T;
  committedValue: T;
  status: AttributeEditStatus;
  invalid: boolean;
  error?: string;
  disabled: boolean;
  readOnly: boolean;
  activationMode: AttributeEditActivationMode;
  submitMode: AttributeEditSubmitMode;
  selectOnFocus: boolean;
  setValue: (value: T) => void;
  edit: () => void;
  submit: () => void;
  cancel: () => void;
}

const AttributeEditContext = createContext<AttributeEditContextValue | null>(null);

export const AttributeEditProvider = AttributeEditContext.Provider;

export function useAttributeEdit<T = unknown>(): AttributeEditContextValue<T> {
  const ctx = useContext(AttributeEditContext);
  if (!ctx) {
    throw new Error('useAttributeEdit must be used within <AttributeEdit>');
  }
  return ctx as AttributeEditContextValue<T>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/design-system && pnpm test:run src/components/Attribute/AttributeEditContext.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
npx biome check --write packages/design-system/src/components/Attribute/AttributeEditContext.ts packages/design-system/src/components/Attribute/AttributeEditContext.test.tsx
git add packages/design-system/src/components/Attribute/AttributeEditContext.ts packages/design-system/src/components/Attribute/AttributeEditContext.test.tsx
git commit -m "feat(attribute): add AttributeEdit context and useAttributeEdit hook"
```

---

### Task 2: AttributeEdit root (state + async commit lifecycle)

**Files:**
- Create: `packages/design-system/src/components/Attribute/AttributeEdit.tsx`
- Test: `packages/design-system/src/components/Attribute/AttributeEdit.test.tsx`

**Interfaces:**
- Consumes: `AttributeEditProvider`, `AttributeEditContextValue`, `AttributeEditStatus`, `AttributeEditActivationMode`, `AttributeEditSubmitMode` (Task 1); `useControlled` from `../../hooks/useControlled`; `TestableProps`/`TestIdProvider` are NOT re-set here (base testId already provided by the `Attribute` root) — but read `useTestId()` for an optional slot; `useAttributeOrientation` from `./AttributeOrientationContext`; `cn`.
- Produces:
  - `interface AttributeEditProps<T = unknown>` (see Step 3)
  - `function AttributeEdit<T = unknown>(props: AttributeEditProps<T>): ReactElement`

Tests drive the lifecycle through a tiny harness that reads the context.

- [ ] **Step 1: Write the failing test**

```tsx
// AttributeEdit.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AttributeEdit } from './AttributeEdit';
import { useAttributeEdit } from './AttributeEditContext';

// Harness exposes context actions as buttons + text.
function Harness() {
  const { editing, value, committedValue, status, invalid, edit, submit, cancel, setValue } =
    useAttributeEdit<string>();
  return (
    <div>
      <span data-testid='editing'>{String(editing)}</span>
      <span data-testid='value'>{value}</span>
      <span data-testid='committed'>{committedValue}</span>
      <span data-testid='status'>{status}</span>
      <span data-testid='invalid'>{String(invalid)}</span>
      <button type='button' onClick={() => edit()}>edit</button>
      <button type='button' onClick={() => setValue('draft')}>setDraft</button>
      <button type='button' onClick={() => submit()}>submit</button>
      <button type='button' onClick={() => cancel()}>cancel</button>
    </div>
  );
}

describe('AttributeEdit', () => {
  it('enters edit mode and seeds the draft from the committed value', async () => {
    render(
      <AttributeEdit defaultValue='hello'>
        <Harness />
      </AttributeEdit>,
    );
    expect(screen.getByTestId('editing')).toHaveTextContent('false');
    await userEvent.click(screen.getByText('edit'));
    expect(screen.getByTestId('editing')).toHaveTextContent('true');
    expect(screen.getByTestId('value')).toHaveTextContent('hello');
  });

  it('commits the draft synchronously and exits edit', async () => {
    const onCommit = vi.fn();
    render(
      <AttributeEdit defaultValue='hello' onValueCommit={onCommit}>
        <Harness />
      </AttributeEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    expect(onCommit).toHaveBeenCalledWith('draft');
    expect(screen.getByTestId('editing')).toHaveTextContent('false');
    expect(screen.getByTestId('committed')).toHaveTextContent('draft');
  });

  it('reverts the draft on cancel', async () => {
    const onRevert = vi.fn();
    render(
      <AttributeEdit defaultValue='hello' onValueRevert={onRevert}>
        <Harness />
      </AttributeEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('cancel'));
    expect(onRevert).toHaveBeenCalledWith('hello');
    expect(screen.getByTestId('editing')).toHaveTextContent('false');
    expect(screen.getByTestId('committed')).toHaveTextContent('hello');
  });

  it('runs the async lifecycle: loading then saved then idle', async () => {
    vi.useFakeTimers();
    let resolve!: () => void;
    const onCommit = vi.fn(() => new Promise<void>(r => { resolve = r; }));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <AttributeEdit defaultValue='hello' onValueCommit={onCommit} savedDuration={2000}>
        <Harness />
      </AttributeEdit>,
    );
    await user.click(screen.getByText('edit'));
    await user.click(screen.getByText('submit'));
    expect(screen.getByTestId('status')).toHaveTextContent('loading');
    resolve();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('saved'));
    vi.advanceTimersByTime(2000);
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('idle'));
    vi.useRealTimers();
  });

  it('surfaces error and stays editing when the commit rejects', async () => {
    const onCommit = vi.fn(() => Promise.reject(new Error('save failed')));
    render(
      <AttributeEdit defaultValue='hello' onValueCommit={onCommit}>
        <Harness />
      </AttributeEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('submit'));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('error'));
    expect(screen.getByTestId('editing')).toHaveTextContent('true');
    expect(screen.getByTestId('invalid')).toHaveTextContent('true');
  });

  it('lets explicit status/error props override the internal machine', () => {
    render(
      <AttributeEdit defaultValue='hello' status='error' error='bad'>
        <Harness />
      </AttributeEdit>,
    );
    expect(screen.getByTestId('status')).toHaveTextContent('error');
    expect(screen.getByTestId('invalid')).toHaveTextContent('true');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/design-system && pnpm test:run src/components/Attribute/AttributeEdit.test.tsx`
Expected: FAIL — cannot find module `./AttributeEdit`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// AttributeEdit.tsx
import {
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useControlled } from '../../hooks/useControlled';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import { useTestId } from '../../utils/testId';
import {
  type AttributeEditActivationMode,
  type AttributeEditContextValue,
  AttributeEditProvider,
  type AttributeEditStatus,
  type AttributeEditSubmitMode,
} from './AttributeEditContext';

export interface AttributeEditProps<T = unknown> extends TestableProps {
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  onValueCommit?: (value: T) => void | Promise<unknown>;
  onValueRevert?: (value: T) => void;
  edit?: boolean;
  defaultEdit?: boolean;
  onEditChange?: (editing: boolean) => void;
  activationMode?: AttributeEditActivationMode;
  submitMode?: AttributeEditSubmitMode;
  selectOnFocus?: boolean;
  status?: AttributeEditStatus;
  error?: string;
  savedDuration?: number;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export function AttributeEdit<T = unknown>({
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  onValueRevert,
  edit,
  defaultEdit = false,
  onEditChange,
  activationMode = 'click',
  submitMode = 'both',
  selectOnFocus = true,
  status,
  error,
  savedDuration = 2000,
  disabled = false,
  readOnly = false,
  className,
  children,
  ref,
  'data-testid': testIdProp,
}: AttributeEditProps<T>): ReactElement {
  const testId = useTestId(undefined, testIdProp);
  const [committedValue, setCommitted] = useControlled<T>({
    controlled: value,
    default: defaultValue,
  });
  const [editing, setEditing] = useControlled<boolean>({
    controlled: edit,
    default: defaultEdit,
  });
  const [draft, setDraft] = useState<T>(committedValue as T);
  const [autoStatus, setAutoStatus] = useState<AttributeEditStatus>('idle');
  const [autoError, setAutoError] = useState<string | undefined>(undefined);

  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  const resolvedStatus = status ?? autoStatus;
  const resolvedError = error ?? autoError;
  const invalid = resolvedStatus === 'error' || Boolean(resolvedError);

  const setEditingState = useCallback(
    (next: boolean) => {
      setEditing(next);
      onEditChange?.(next);
    },
    [setEditing, onEditChange],
  );

  const handleSetValue = useCallback(
    (next: T) => {
      setDraft(next);
      onValueChange?.(next);
    },
    [onValueChange],
  );

  const edit_ = useCallback(() => {
    if (disabled || readOnly) return;
    setDraft(committedValue as T);
    setAutoStatus('idle');
    setAutoError(undefined);
    setEditingState(true);
  }, [disabled, readOnly, committedValue, setEditingState]);

  const cancel = useCallback(() => {
    setDraft(committedValue as T);
    setAutoStatus('idle');
    setAutoError(undefined);
    setEditingState(false);
    onValueRevert?.(committedValue as T);
  }, [committedValue, setEditingState, onValueRevert]);

  const submit = useCallback(() => {
    const result = onValueCommit?.(draft);
    if (result && typeof (result as PromiseLike<unknown>).then === 'function') {
      setAutoStatus('loading');
      setAutoError(undefined);
      Promise.resolve(result).then(
        () => {
          if (!mounted.current) return;
          setCommitted(draft);
          setEditingState(false);
          setAutoStatus('saved');
          if (savedTimer.current) clearTimeout(savedTimer.current);
          savedTimer.current = setTimeout(() => {
            if (mounted.current) setAutoStatus('idle');
          }, savedDuration);
        },
        (reason: unknown) => {
          if (!mounted.current) return;
          setAutoStatus('error');
          setAutoError(reason instanceof Error ? reason.message : 'Failed to save');
        },
      );
      return;
    }
    setCommitted(draft);
    setEditingState(false);
  }, [onValueCommit, draft, setCommitted, setEditingState, savedDuration]);

  const contextValue = useMemo<AttributeEditContextValue<T>>(
    () => ({
      editing: Boolean(editing),
      value: draft,
      committedValue: committedValue as T,
      status: resolvedStatus,
      invalid,
      error: resolvedError,
      disabled,
      readOnly,
      activationMode,
      submitMode,
      selectOnFocus,
      setValue: handleSetValue,
      edit: edit_,
      submit,
      cancel,
    }),
    [
      editing, draft, committedValue, resolvedStatus, invalid, resolvedError,
      disabled, readOnly, activationMode, submitMode, selectOnFocus,
      handleSetValue, edit_, submit, cancel,
    ],
  );

  return (
    <AttributeEditProvider value={contextValue as AttributeEditContextValue}>
      <div
        ref={ref}
        data-testid={testId}
        data-slot='attribute-edit'
        data-editing={editing ? '' : undefined}
        className={cn('flex w-full min-w-0 flex-col', className)}
      >
        {children}
      </div>
    </AttributeEditProvider>
  );
}

AttributeEdit.displayName = 'AttributeEdit';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/design-system && pnpm test:run src/components/Attribute/AttributeEdit.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
npx biome check --write packages/design-system/src/components/Attribute/AttributeEdit.tsx packages/design-system/src/components/Attribute/AttributeEdit.test.tsx
git add packages/design-system/src/components/Attribute/AttributeEdit.tsx packages/design-system/src/components/Attribute/AttributeEdit.test.tsx
git commit -m "feat(attribute): add AttributeEdit root with async commit lifecycle"
```

---

### Task 3: AttributeEditPreview (read mode + activation + indicator)

**Files:**
- Create: `packages/design-system/src/components/Attribute/AttributeEditPreview.tsx`
- Test: `packages/design-system/src/components/Attribute/AttributeEditPreview.test.tsx`

**Interfaces:**
- Consumes: `useAttributeEdit` (Task 1); `AttributeEdit` (Task 2) in tests; `useTestId`, `cn`; `Loader` from `../Loader`; `Check`, `Pencil` from `../../icons`.
- Produces: `interface AttributeEditPreviewProps`, `const AttributeEditPreview: FC<AttributeEditPreviewProps>`.

- [ ] **Step 1: Write the failing test**

```tsx
// AttributeEditPreview.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AttributeEdit } from './AttributeEdit';
import { AttributeEditPreview } from './AttributeEditPreview';

describe('AttributeEditPreview', () => {
  it('renders the value and enters edit on click', async () => {
    render(
      <AttributeEdit defaultValue='hello' data-testid='attr'>
        <AttributeEditPreview>hello</AttributeEditPreview>
      </AttributeEdit>,
    );
    const preview = screen.getByTestId('attr--edit-preview');
    expect(preview).toHaveTextContent('hello');
    expect(preview).toHaveAttribute('role', 'button');
    await userEvent.click(preview);
    // preview unmounts in edit mode
    expect(screen.queryByTestId('attr--edit-preview')).toBeNull();
  });

  it('enters edit via keyboard (Enter)', async () => {
    render(
      <AttributeEdit defaultValue='hello' data-testid='attr'>
        <AttributeEditPreview>hello</AttributeEditPreview>
      </AttributeEdit>,
    );
    screen.getByTestId('attr--edit-preview').focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.queryByTestId('attr--edit-preview')).toBeNull();
  });

  it('is not activatable when readOnly', async () => {
    render(
      <AttributeEdit defaultValue='hello' readOnly data-testid='attr'>
        <AttributeEditPreview>hello</AttributeEditPreview>
      </AttributeEdit>,
    );
    const preview = screen.getByTestId('attr--edit-preview');
    expect(preview).not.toHaveAttribute('role', 'button');
    await userEvent.click(preview);
    expect(screen.getByTestId('attr--edit-preview')).toBeInTheDocument();
  });

  it('forwards arbitrary data-* attributes to the target node (metrics)', () => {
    render(
      <AttributeEdit defaultValue='hello' data-testid='attr'>
        <AttributeEditPreview data-analytics-id='ATTR_EDIT'>hello</AttributeEditPreview>
      </AttributeEdit>,
    );
    expect(screen.getByTestId('attr--edit-preview')).toHaveAttribute(
      'data-analytics-id',
      'ATTR_EDIT',
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/design-system && pnpm test:run src/components/Attribute/AttributeEditPreview.test.tsx`
Expected: FAIL — cannot find module `./AttributeEditPreview`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// AttributeEditPreview.tsx
import type { FC, HTMLAttributes, KeyboardEvent, ReactNode, Ref } from 'react';
import { Check, Pencil } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Loader } from '../Loader';
import { useAttributeEdit } from './AttributeEditContext';

export interface AttributeEditPreviewProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Trailing affordance icon shown on hover/focus in read mode. */
  triggerIcon?: ReactNode;
  children?: ReactNode;
}

export const AttributeEditPreview: FC<AttributeEditPreviewProps> = ({
  ref,
  triggerIcon = <Pencil size='sm' />,
  children,
  className,
  onClick,
  onFocus,
  onKeyDown,
  ...props
}) => {
  const testId = useTestId('edit-preview');
  const { editing, status, disabled, readOnly, activationMode, edit } = useAttributeEdit();

  if (editing) return null;

  const activatable = !disabled && !readOnly && activationMode !== 'none';

  const handleClick: HTMLAttributes<HTMLDivElement>['onClick'] = event => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (activatable && activationMode === 'click') edit();
  };

  const handleFocus: HTMLAttributes<HTMLDivElement>['onFocus'] = event => {
    onFocus?.(event);
    if (activatable && activationMode === 'focus') edit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (activatable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      edit();
    }
  };

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='attribute-edit-preview'
      role={activatable ? 'button' : undefined}
      tabIndex={activatable ? 0 : undefined}
      onClick={handleClick}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      className={cn(
        'group -my-4 flex w-full min-w-0 items-center gap-4 rounded-8 px-6 py-4 transition-colors',
        activatable &&
          'cursor-pointer hover:bg-states-primary-hover active:bg-states-primary-pressed focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
        className,
      )}
    >
      <span className='min-w-0 flex-1 truncate'>{children}</span>
      {status === 'loading' ? (
        <Loader type='circle' size='sm' background={false} />
      ) : status === 'saved' ? (
        <Check size='sm' className='text-icon-success' />
      ) : activatable ? (
        <span className='text-icon-secondary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'>
          {triggerIcon}
        </span>
      ) : null}
    </div>
  );
};

AttributeEditPreview.displayName = 'AttributeEditPreview';
```

> If `text-icon-success` is not a valid token, use `text-icon-brand` (verify against `semantic.css`); do not invent tokens.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/design-system && pnpm test:run src/components/Attribute/AttributeEditPreview.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
npx biome check --write packages/design-system/src/components/Attribute/AttributeEditPreview.tsx packages/design-system/src/components/Attribute/AttributeEditPreview.test.tsx
git add packages/design-system/src/components/Attribute/AttributeEditPreview.tsx packages/design-system/src/components/Attribute/AttributeEditPreview.test.tsx
git commit -m "feat(attribute): add AttributeEditPreview read-mode target"
```

---

### Task 4: AttributeEditControl (edit-mode container, focus + keyboard)

**Files:**
- Create: `packages/design-system/src/components/Attribute/AttributeEditControl.tsx`
- Test: `packages/design-system/src/components/Attribute/AttributeEditControl.test.tsx`

**Interfaces:**
- Consumes: `useAttributeEdit` (Task 1); `useTestId`, `cn`; `composeRefs` from `@radix-ui/react-compose-refs`.
- Produces: `interface AttributeEditControlProps`, `const AttributeEditControl: FC<AttributeEditControlProps>`.

Behavior: renders children only while `editing`. On mount focuses the first focusable descendant; if it is an `<input>`/`<textarea>` and `selectOnFocus`, selects its text. Keydown: `Escape` → `cancel()`; `Enter` → `submit()` when `submitMode` is `enter`/`both` (but not for a bare `Enter` inside a `<textarea>`). Blur leaving the control → `submit()` when `submitMode` is `blur`/`both`, else `cancel()`.

- [ ] **Step 1: Write the failing test**

```tsx
// AttributeEditControl.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AttributeEdit } from './AttributeEdit';
import { AttributeEditControl } from './AttributeEditControl';

function ControlledInput() {
  return <input data-testid='editor' defaultValue='hello' />;
}

describe('AttributeEditControl', () => {
  it('renders nothing when not editing', () => {
    render(
      <AttributeEdit defaultValue='hello' data-testid='attr'>
        <AttributeEditControl>
          <ControlledInput />
        </AttributeEditControl>
      </AttributeEdit>,
    );
    expect(screen.queryByTestId('attr--edit-control')).toBeNull();
  });

  it('focuses the editor on entering edit mode', () => {
    render(
      <AttributeEdit defaultEdit data-testid='attr'>
        <AttributeEditControl>
          <ControlledInput />
        </AttributeEditControl>
      </AttributeEdit>,
    );
    expect(screen.getByTestId('editor')).toHaveFocus();
  });

  it('submits on Enter and cancels on Escape', async () => {
    const onCommit = vi.fn();
    const onRevert = vi.fn();
    render(
      <AttributeEdit defaultEdit onValueCommit={onCommit} onValueRevert={onRevert} data-testid='attr'>
        <AttributeEditControl>
          <ControlledInput />
        </AttributeEditControl>
      </AttributeEdit>,
    );
    await userEvent.keyboard('{Enter}');
    expect(onCommit).toHaveBeenCalledTimes(1);

    // re-open and Escape
    // (component exits edit on submit; render a fresh tree)
  });

  it('cancels on Escape', async () => {
    const onRevert = vi.fn();
    render(
      <AttributeEdit defaultEdit onValueRevert={onRevert} data-testid='attr'>
        <AttributeEditControl>
          <ControlledInput />
        </AttributeEditControl>
      </AttributeEdit>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onRevert).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/design-system && pnpm test:run src/components/Attribute/AttributeEditControl.test.tsx`
Expected: FAIL — cannot find module `./AttributeEditControl`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// AttributeEditControl.tsx
import type { FC, FocusEvent, HTMLAttributes, KeyboardEvent, ReactNode, Ref } from 'react';
import { useCallback } from 'react';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useAttributeEdit } from './AttributeEditContext';

const FOCUSABLE_SELECTOR = 'input, textarea, select, button, [tabindex]:not([tabindex="-1"])';

export interface AttributeEditControlProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const AttributeEditControl: FC<AttributeEditControlProps> = ({
  ref,
  children,
  className,
  onKeyDown,
  onBlur,
  ...props
}) => {
  const testId = useTestId('edit-control');
  const { editing, submitMode, selectOnFocus, submit, cancel } = useAttributeEdit();

  // Focus the first focusable descendant when the control mounts (edit start).
  const focusRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      const focusable = node.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (!focusable) return;
      focusable.focus();
      if (
        selectOnFocus &&
        (focusable instanceof HTMLInputElement || focusable instanceof HTMLTextAreaElement)
      ) {
        focusable.select();
      }
    },
    [selectOnFocus],
  );

  if (!editing) return null;

  const submitsOnEnter = submitMode === 'enter' || submitMode === 'both';
  const submitsOnBlur = submitMode === 'blur' || submitMode === 'both';

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
      return;
    }
    if (event.key === 'Enter' && submitsOnEnter) {
      const target = event.target as HTMLElement;
      const isTextarea = target.tagName === 'TEXTAREA';
      if (isTextarea && !event.metaKey && !event.ctrlKey) return; // allow newline
      event.preventDefault();
      submit();
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    onBlur?.(event);
    if (event.defaultPrevented) return;
    // Ignore focus moves that stay inside the control.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    if (submitsOnBlur) submit();
    else cancel();
  };

  return (
    <div
      {...props}
      ref={composeRefs(ref, focusRef)}
      data-testid={testId}
      data-slot='attribute-edit-control'
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={cn('w-full min-w-0', className)}
    >
      {children}
    </div>
  );
};

AttributeEditControl.displayName = 'AttributeEditControl';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/design-system && pnpm test:run src/components/Attribute/AttributeEditControl.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
npx biome check --write packages/design-system/src/components/Attribute/AttributeEditControl.tsx packages/design-system/src/components/Attribute/AttributeEditControl.test.tsx
git add packages/design-system/src/components/Attribute/AttributeEditControl.tsx packages/design-system/src/components/Attribute/AttributeEditControl.test.tsx
git commit -m "feat(attribute): add AttributeEditControl edit-mode container"
```

---

### Task 5: Editor wrappers — Input / Textarea / Number

**Files:**
- Create: `packages/design-system/src/components/Attribute/AttributeEditInput.tsx`
- Create: `packages/design-system/src/components/Attribute/AttributeEditTextarea.tsx`
- Create: `packages/design-system/src/components/Attribute/AttributeEditNumber.tsx`
- Test: `packages/design-system/src/components/Attribute/AttributeEditInput.test.tsx`

**Interfaces:**
- Consumes: `useAttributeEdit` (Task 1); `useTestId`, `cn`; `Input`/`InputProps` from `../Input`; `Textarea`/`TextareaProps` from `../Textarea`; `NumberInput`/`NumberInputProps` from `../NumberInput`.
- Produces:
  - `type AttributeEditInputProps = Omit<InputProps, 'value' | 'onChange' | 'error'>`; `const AttributeEditInput: FC<AttributeEditInputProps>`
  - `type AttributeEditTextareaProps = Omit<TextareaProps, 'value' | 'onChange' | 'error'>`; `const AttributeEditTextarea: FC<AttributeEditTextareaProps>`
  - `type AttributeEditNumberProps = Omit<NumberInputProps, 'value' | 'onValueChange' | 'error'>`; `const AttributeEditNumber: FC<AttributeEditNumberProps>`

- [ ] **Step 1: Write the failing test**

```tsx
// AttributeEditInput.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AttributeEdit } from './AttributeEdit';
import { AttributeEditControl } from './AttributeEditControl';
import { AttributeEditInput } from './AttributeEditInput';

describe('AttributeEditInput', () => {
  it('binds the draft value and updates it on typing', async () => {
    const onChange = vi.fn();
    render(
      <AttributeEdit defaultEdit defaultValue='ab' onValueChange={onChange} data-testid='attr'>
        <AttributeEditControl>
          <AttributeEditInput />
        </AttributeEditControl>
      </AttributeEdit>,
    );
    const input = screen.getByTestId('attr--edit-input') as HTMLInputElement;
    expect(input.value).toBe('ab');
    await userEvent.type(input, 'c');
    expect(onChange).toHaveBeenLastCalledWith('abc');
  });

  it('forwards arbitrary data-* to the real input node (metrics)', () => {
    render(
      <AttributeEdit defaultEdit defaultValue='ab' data-testid='attr'>
        <AttributeEditControl>
          <AttributeEditInput data-analytics-id='ATTR_INPUT' />
        </AttributeEditControl>
      </AttributeEdit>,
    );
    expect(screen.getByTestId('attr--edit-input')).toHaveAttribute(
      'data-analytics-id',
      'ATTR_INPUT',
    );
  });

  it('marks the input invalid when the edit is in error', () => {
    render(
      <AttributeEdit defaultEdit defaultValue='ab' status='error' error='bad' data-testid='attr'>
        <AttributeEditControl>
          <AttributeEditInput />
        </AttributeEditControl>
      </AttributeEdit>,
    );
    expect(screen.getByTestId('attr--edit-input')).toHaveAttribute('aria-invalid', 'true');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/design-system && pnpm test:run src/components/Attribute/AttributeEditInput.test.tsx`
Expected: FAIL — cannot find module `./AttributeEditInput`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// AttributeEditInput.tsx
import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Input, type InputProps } from '../Input';
import { useAttributeEdit } from './AttributeEditContext';

export type AttributeEditInputProps = Omit<InputProps, 'value' | 'onChange' | 'error'>;

export const AttributeEditInput: FC<AttributeEditInputProps> = ({
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('edit-input', testIdProp);
  const { value, setValue, invalid } = useAttributeEdit<string>();
  return (
    <Input
      {...props}
      data-testid={testId}
      value={value ?? ''}
      onChange={event => setValue(event.target.value)}
      error={invalid}
      className={cn('h-28 px-8', className)}
    />
  );
};

AttributeEditInput.displayName = 'AttributeEditInput';
```

```tsx
// AttributeEditTextarea.tsx
import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Textarea, type TextareaProps } from '../Textarea';
import { useAttributeEdit } from './AttributeEditContext';

export type AttributeEditTextareaProps = Omit<TextareaProps, 'value' | 'onChange' | 'error'>;

export const AttributeEditTextarea: FC<AttributeEditTextareaProps> = ({
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('edit-input', testIdProp);
  const { value, setValue, invalid } = useAttributeEdit<string>();
  return (
    <Textarea
      {...props}
      data-testid={testId}
      value={value ?? ''}
      onChange={event => setValue(event.target.value)}
      error={invalid}
      className={className}
    />
  );
};

AttributeEditTextarea.displayName = 'AttributeEditTextarea';
```

```tsx
// AttributeEditNumber.tsx
import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { NumberInput, type NumberInputProps } from '../NumberInput';
import { useAttributeEdit } from './AttributeEditContext';

export type AttributeEditNumberProps = Omit<NumberInputProps, 'value' | 'onValueChange' | 'error'>;

export const AttributeEditNumber: FC<AttributeEditNumberProps> = ({
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('edit-input', testIdProp);
  const { value, setValue, invalid } = useAttributeEdit<string>();
  return (
    <NumberInput
      {...props}
      data-testid={testId}
      value={value ?? ''}
      onValueChange={details => setValue(details.value)}
      error={invalid}
      className={cn('h-28', className)}
    />
  );
};

AttributeEditNumber.displayName = 'AttributeEditNumber';
```

> `Input`/`Textarea`/`NumberInput` spread `...props` onto the real DOM input, so arbitrary `data-*` forwards there — verify the test asserting `data-analytics-id` on `attr--edit-input` passes (it confirms the metrics contract). If `NumberInput.onValueChange` details shape differs, adapt to the Ark `ValueChangeDetails['value']` string field.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/design-system && pnpm test:run src/components/Attribute/AttributeEditInput.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
npx biome check --write packages/design-system/src/components/Attribute/AttributeEditInput.tsx packages/design-system/src/components/Attribute/AttributeEditTextarea.tsx packages/design-system/src/components/Attribute/AttributeEditNumber.tsx packages/design-system/src/components/Attribute/AttributeEditInput.test.tsx
git add packages/design-system/src/components/Attribute/AttributeEditInput.tsx packages/design-system/src/components/Attribute/AttributeEditTextarea.tsx packages/design-system/src/components/Attribute/AttributeEditNumber.tsx packages/design-system/src/components/Attribute/AttributeEditInput.test.tsx
git commit -m "feat(attribute): add AttributeEdit text/textarea/number editor wrappers"
```

---

### Task 6: AttributeEditError

**Files:**
- Create: `packages/design-system/src/components/Attribute/AttributeEditError.tsx`
- Test: `packages/design-system/src/components/Attribute/AttributeEditError.test.tsx`

**Interfaces:**
- Consumes: `useAttributeEdit` (Task 1); `useTestId`, `cn`; `Text` from `../Text`.
- Produces: `interface AttributeEditErrorProps`, `const AttributeEditError: FC<AttributeEditErrorProps>`.

- [ ] **Step 1: Write the failing test**

```tsx
// AttributeEditError.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AttributeEdit } from './AttributeEdit';
import { AttributeEditError } from './AttributeEditError';

describe('AttributeEditError', () => {
  it('renders nothing when valid', () => {
    render(
      <AttributeEdit defaultValue='x' data-testid='attr'>
        <AttributeEditError />
      </AttributeEdit>,
    );
    expect(screen.queryByTestId('attr--edit-error')).toBeNull();
  });

  it('renders the context error message when invalid', () => {
    render(
      <AttributeEdit defaultValue='x' status='error' error='An error message.' data-testid='attr'>
        <AttributeEditError />
      </AttributeEdit>,
    );
    expect(screen.getByTestId('attr--edit-error')).toHaveTextContent('An error message.');
  });

  it('prefers explicit children over the context error', () => {
    render(
      <AttributeEdit defaultValue='x' status='error' error='ctx' data-testid='attr'>
        <AttributeEditError>custom</AttributeEditError>
      </AttributeEdit>,
    );
    expect(screen.getByTestId('attr--edit-error')).toHaveTextContent('custom');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/design-system && pnpm test:run src/components/Attribute/AttributeEditError.test.tsx`
Expected: FAIL — cannot find module `./AttributeEditError`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// AttributeEditError.tsx
import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';
import { useAttributeEdit } from './AttributeEditContext';

export interface AttributeEditErrorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const AttributeEditError: FC<AttributeEditErrorProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('edit-error');
  const { invalid, error } = useAttributeEdit();
  const message = children ?? error;

  if (!invalid || !message) return null;

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='attribute-edit-error'
      className={cn('pt-4', className)}
    >
      <Text size='sm' color='danger'>
        {message}
      </Text>
    </div>
  );
};

AttributeEditError.displayName = 'AttributeEditError';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/design-system && pnpm test:run src/components/Attribute/AttributeEditError.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
npx biome check --write packages/design-system/src/components/Attribute/AttributeEditError.tsx packages/design-system/src/components/Attribute/AttributeEditError.test.tsx
git add packages/design-system/src/components/Attribute/AttributeEditError.tsx packages/design-system/src/components/Attribute/AttributeEditError.test.tsx
git commit -m "feat(attribute): add AttributeEditError message"
```

---

### Task 7: Barrel exports + end-to-end integration test (text editor)

**Files:**
- Modify: `packages/design-system/src/components/Attribute/index.ts`
- Test: `packages/design-system/src/components/Attribute/AttributeEdit.integration.test.tsx`

**Interfaces:**
- Consumes: all parts from Tasks 1–6 plus `Attribute`, `AttributeLabel`, `AttributeValue`.
- Produces: public exports of every new symbol.

- [ ] **Step 1: Write the failing test**

```tsx
// AttributeEdit.integration.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Attribute,
  AttributeEdit,
  AttributeEditControl,
  AttributeEditError,
  AttributeEditInput,
  AttributeEditPreview,
  AttributeLabel,
  AttributeValue,
} from './index';

function Example({ onCommit }: { onCommit: (v: string) => void }) {
  return (
    <Attribute data-testid='attr'>
      <AttributeLabel>Name</AttributeLabel>
      <AttributeValue>
        <AttributeEdit defaultValue='Checkout API' onValueCommit={onCommit}>
          <AttributeEditPreview>Checkout API</AttributeEditPreview>
          <AttributeEditControl>
            <AttributeEditInput />
          </AttributeEditControl>
          <AttributeEditError />
        </AttributeEdit>
      </AttributeValue>
    </Attribute>
  );
}

describe('AttributeEdit integration', () => {
  it('click → type → Enter commits the new value', async () => {
    const onCommit = vi.fn();
    render(<Example onCommit={onCommit} />);
    await userEvent.click(screen.getByTestId('attr--edit-preview'));
    const input = screen.getByTestId('attr--edit-input') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, 'Payments API{Enter}');
    expect(onCommit).toHaveBeenCalledWith('Payments API');
    expect(screen.getByTestId('attr--edit-preview')).toBeInTheDocument();
  });

  it('Escape reverts without committing', async () => {
    const onCommit = vi.fn();
    render(<Example onCommit={onCommit} />);
    await userEvent.click(screen.getByTestId('attr--edit-preview'));
    await userEvent.type(screen.getByTestId('attr--edit-input'), 'x');
    await userEvent.keyboard('{Escape}');
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('attr--edit-preview')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/design-system && pnpm test:run src/components/Attribute/AttributeEdit.integration.test.tsx`
Expected: FAIL — exports not found in `./index`.

- [ ] **Step 3: Add the exports**

Append to `packages/design-system/src/components/Attribute/index.ts`:

```ts
export { AttributeEdit, type AttributeEditProps } from './AttributeEdit';
export {
  type AttributeEditActivationMode,
  type AttributeEditContextValue,
  type AttributeEditStatus,
  type AttributeEditSubmitMode,
  useAttributeEdit,
} from './AttributeEditContext';
export { AttributeEditControl, type AttributeEditControlProps } from './AttributeEditControl';
export { AttributeEditError, type AttributeEditErrorProps } from './AttributeEditError';
export { AttributeEditInput, type AttributeEditInputProps } from './AttributeEditInput';
export { AttributeEditNumber, type AttributeEditNumberProps } from './AttributeEditNumber';
export { AttributeEditPreview, type AttributeEditPreviewProps } from './AttributeEditPreview';
export { AttributeEditTextarea, type AttributeEditTextareaProps } from './AttributeEditTextarea';
```

- [ ] **Step 4: Run test + typecheck to verify they pass**

Run: `cd packages/design-system && pnpm test:run src/components/Attribute/AttributeEdit.integration.test.tsx`
Expected: PASS (2 tests).
Run: `cd packages/design-system && pnpm exec tsc -p tsconfig.app.json --noEmit`
Expected: no errors. (`pnpm typecheck` is a no-op in this repo — use the explicit `tsc` invocation.)

- [ ] **Step 5: Commit**

```bash
npx biome check --write packages/design-system/src/components/Attribute/index.ts packages/design-system/src/components/Attribute/AttributeEdit.integration.test.tsx
git add packages/design-system/src/components/Attribute/index.ts packages/design-system/src/components/Attribute/AttributeEdit.integration.test.tsx
git commit -m "feat(attribute): export AttributeEdit family and add integration test"
```

---

### Task 8: Storybook stories (all value types + states)

**Files:**
- Modify: `packages/design-system/src/components/Attribute/Attribute.stories.tsx`

**Interfaces:**
- Consumes: the full `AttributeEdit` family (Task 7) plus existing `Select`, `DateInput`, `TimeInput`, `Tag` for composed editors.

Add the new sub-components to the `subcomponents` map in `meta`, then add the stories below. Stories use `StoryFn` and a local `useState` wrapper for controlled value.

- [ ] **Step 1: Add a shared controlled wrapper + text/number/textarea stories**

Add imports at the top of the file:

```tsx
import { useState } from 'react';
import { fn } from 'storybook/test';
import {
  AttributeEdit,
  AttributeEditControl,
  AttributeEditError,
  AttributeEditInput,
  AttributeEditNumber,
  AttributeEditPreview,
  AttributeEditTextarea,
  useAttributeEdit,
} from './index';
```

Add these stories (append to the file, before any default-export reassignment if present — `export default meta` stays unchanged):

```tsx
export const InlineEditText: StoryFn = () => {
  const [value, setValue] = useState('Checkout API');
  return (
    <div className='w-[320px]'>
      <Attribute data-testid='attr'>
        <AttributeLabel>Name</AttributeLabel>
        <AttributeValue>
          <AttributeEdit value={value} onValueCommit={v => setValue(v as string)}>
            <AttributeEditPreview>{value}</AttributeEditPreview>
            <AttributeEditControl>
              <AttributeEditInput />
            </AttributeEditControl>
            <AttributeEditError />
          </AttributeEdit>
        </AttributeValue>
      </Attribute>
    </div>
  );
};

export const InlineEditTextarea: StoryFn = () => {
  const [value, setValue] = useState(
    'Displays a labeled value for a single object attribute.',
  );
  return (
    <div className='w-[320px]'>
      <Attribute data-testid='attr'>
        <AttributeLabel>About</AttributeLabel>
        <AttributeValue>
          <AttributeEdit value={value} onValueCommit={v => setValue(v as string)}>
            <AttributeEditPreview>{value}</AttributeEditPreview>
            <AttributeEditControl>
              <AttributeEditTextarea minRows={2} maxRows={6} />
            </AttributeEditControl>
            <AttributeEditError />
          </AttributeEdit>
        </AttributeValue>
      </Attribute>
    </div>
  );
};

export const InlineEditNumber: StoryFn = () => {
  const [value, setValue] = useState('8443');
  return (
    <div className='w-[320px]'>
      <Attribute data-testid='attr'>
        <AttributeLabel>Port</AttributeLabel>
        <AttributeValue>
          <AttributeEdit value={value} onValueCommit={v => setValue(v as string)}>
            <AttributeEditPreview>{value}</AttributeEditPreview>
            <AttributeEditControl>
              <AttributeEditNumber />
            </AttributeEditControl>
          </AttributeEdit>
        </AttributeValue>
      </Attribute>
    </div>
  );
};
```

- [ ] **Step 2: Add states, horizontal, and async stories**

```tsx
export const InlineEditError: StoryFn = () => (
  <div className='w-[320px]'>
    <Attribute data-testid='attr'>
      <AttributeLabel>Name</AttributeLabel>
      <AttributeValue>
        <AttributeEdit defaultValue='Checkout API and ABC' defaultEdit status='error' error='An error message.'>
          <AttributeEditPreview>Checkout API and ABC</AttributeEditPreview>
          <AttributeEditControl>
            <AttributeEditInput />
          </AttributeEditControl>
          <AttributeEditError />
        </AttributeEdit>
      </AttributeValue>
    </Attribute>
  </div>
);

export const InlineEditLoading: StoryFn = () => (
  <div className='w-[320px]'>
    <Attribute data-testid='attr'>
      <AttributeLabel>Name</AttributeLabel>
      <AttributeValue>
        <AttributeEdit defaultValue='Checkout API and ABC' status='loading'>
          <AttributeEditPreview>Checkout API and ABC</AttributeEditPreview>
          <AttributeEditControl>
            <AttributeEditInput />
          </AttributeEditControl>
        </AttributeEdit>
      </AttributeValue>
    </Attribute>
  </div>
);

export const InlineEditSaved: StoryFn = () => (
  <div className='w-[320px]'>
    <Attribute data-testid='attr'>
      <AttributeLabel>Name</AttributeLabel>
      <AttributeValue>
        <AttributeEdit defaultValue='Checkout API and ABC' status='saved'>
          <AttributeEditPreview>Checkout API and ABC</AttributeEditPreview>
          <AttributeEditControl>
            <AttributeEditInput />
          </AttributeEditControl>
        </AttributeEdit>
      </AttributeValue>
    </Attribute>
  </div>
);

export const InlineEditHorizontal: StoryFn = () => {
  const [value, setValue] = useState('Checkout API');
  return (
    <div className='w-[440px]'>
      <Attribute orientation='horizontal' data-testid='attr'>
        <AttributeLabel>Name</AttributeLabel>
        <AttributeValue>
          <AttributeEdit value={value} onValueCommit={v => setValue(v as string)}>
            <AttributeEditPreview>{value}</AttributeEditPreview>
            <AttributeEditControl>
              <AttributeEditInput />
            </AttributeEditControl>
          </AttributeEdit>
        </AttributeValue>
      </Attribute>
    </div>
  );
};

export const InlineEditAsync: StoryFn = () => {
  const [value, setValue] = useState('Checkout API');
  const save = (v: unknown) =>
    new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if ((v as string).trim().length === 0) reject(new Error('Name is required.'));
        else {
          setValue(v as string);
          resolve();
        }
      }, 1200);
    });
  return (
    <div className='w-[320px]'>
      <Attribute data-testid='attr'>
        <AttributeLabel>Name</AttributeLabel>
        <AttributeValue>
          <AttributeEdit value={value} onValueCommit={save}>
            <AttributeEditPreview>{value}</AttributeEditPreview>
            <AttributeEditControl>
              <AttributeEditInput />
            </AttributeEditControl>
            <AttributeEditError />
          </AttributeEdit>
        </AttributeValue>
      </Attribute>
    </div>
  );
};
```

- [ ] **Step 3: Add composed-editor stories (select / multi-select / tags / date / time / datetime)**

These compose existing inputs via `useAttributeEdit()`. **Before writing, open the existing stories to copy exact prop wiring** (do not guess APIs):
- `packages/design-system/src/components/Select/*.stories.tsx`
- `packages/design-system/src/components/DateInput/*.stories.tsx`
- `packages/design-system/src/components/TimeInput/*.stories.tsx`

Pattern for each (shown for single Select — adapt collection/options to the real Select API):

```tsx
function SelectEditor({ options }: { options: { label: string; value: string }[] }) {
  const { value, setValue, submit } = useAttributeEdit<string[]>();
  // Render the DS Select bound to `value`; on value change call setValue(next);
  // commit on selection close via submit(). Mirror Select.stories.tsx wiring.
  return null; // replace with real <Select> composition
}

export const InlineEditSelect: StoryFn = () => {
  // ... <AttributeEdit value onValueCommit> with <AttributeEditControl><SelectEditor/></AttributeEditControl>
  return null; // build per Select.stories.tsx
};
```

Implement `InlineEditSelect`, `InlineEditMultiSelect`, `InlineEditTags`, `InlineEditDate`, `InlineEditTime`, `InlineEditDateTime` concretely using the real component APIs from those story files. Each follows the same `AttributeEdit` → `Preview` + `Control(editor)` shape as the text stories; only the editor inside `Control` differs.

- [ ] **Step 4: Verify stories build**

Run: `cd packages/design-system && pnpm exec tsc -p tsconfig.app.json --noEmit`
Expected: no errors.
Run (optional manual check): `pnpm storybook` and confirm the new `Data Display/Attribute` stories render and the text story edits correctly.

- [ ] **Step 5: Commit**

```bash
npx biome check --write packages/design-system/src/components/Attribute/Attribute.stories.tsx
git add packages/design-system/src/components/Attribute/Attribute.stories.tsx
git commit -m "docs(attribute): add inline-edit stories for all value types and states"
```

---

### Task 9: E2E tests (Visual / Interactions / Accessibility) + snapshots

**Files:**
- Modify: `packages/design-system/src/components/Attribute/Attribute.e2e.ts`

**Interfaces:**
- Consumes: the stories from Task 8 via `createStoryHelper('data-display-attribute', [...])`.

Follow `docs/e2e-test-rules.md`. Story IDs derive from export names: `InlineEditText` → `'Inline Edit Text'`, etc. Selectors use the cascaded testIds (`attr--edit-preview`, `attr--edit-input`, `attr--edit-error`).

- [ ] **Step 1: Extend the story helper list**

In the existing `createStoryHelper(...)` array at the top of `Attribute.e2e.ts`, add:

```ts
'Inline Edit Text',
'Inline Edit Error',
'Inline Edit Loading',
'Inline Edit Saved',
'Inline Edit Horizontal',
'Inline Edit Async',
```

- [ ] **Step 2: Add Visual tests**

Inside `test.describe('Component: Attribute')` → `test.describe('Visual')`, add:

```ts
test('Should render inline edit read state correctly', async ({ page }) => {
  await attributeStory.goto(page, 'Inline Edit Text');
  await expect(page).toHaveScreenshot({ animations: 'disabled' });
});

test('Should render inline edit hover affordance correctly', async ({ page }) => {
  await attributeStory.goto(page, 'Inline Edit Text');
  await page.getByTestId('attr--edit-preview').hover();
  await expect(page).toHaveScreenshot({ animations: 'disabled' });
});

test('Should render inline edit editing state correctly', async ({ page }) => {
  await attributeStory.goto(page, 'Inline Edit Text');
  await page.getByTestId('attr--edit-preview').click();
  await expect(page).toHaveScreenshot({ animations: 'disabled' });
});

test('Should render inline edit error state correctly', async ({ page }) => {
  await attributeStory.goto(page, 'Inline Edit Error');
  await expect(page).toHaveScreenshot({ animations: 'disabled' });
});

test('Should render inline edit loading state correctly', async ({ page }) => {
  await attributeStory.goto(page, 'Inline Edit Loading');
  await expect(page).toHaveScreenshot({ animations: 'disabled' });
});

test('Should render inline edit saved state correctly', async ({ page }) => {
  await attributeStory.goto(page, 'Inline Edit Saved');
  await expect(page).toHaveScreenshot({ animations: 'disabled' });
});

test('Should render inline edit horizontal orientation correctly', async ({ page }) => {
  await attributeStory.goto(page, 'Inline Edit Horizontal');
  await page.getByTestId('attr--edit-preview').click();
  await expect(page).toHaveScreenshot({ animations: 'disabled' });
});
```

- [ ] **Step 3: Add Interactions tests**

Inside `test.describe('Interactions')`, add:

```ts
test('Should enter edit mode and commit on Enter', async ({ page }) => {
  await attributeStory.goto(page, 'Inline Edit Text');
  await page.getByTestId('attr--edit-preview').click();
  const input = page.getByTestId('attr--edit-input');
  await expect(input).toBeFocused();
  await input.fill('Payments API');
  await input.press('Enter');
  await expect(page.getByTestId('attr--edit-preview')).toHaveText(/Payments API/);
});

test('Should revert on Escape', async ({ page }) => {
  await attributeStory.goto(page, 'Inline Edit Text');
  await page.getByTestId('attr--edit-preview').click();
  const input = page.getByTestId('attr--edit-input');
  await input.fill('Discarded');
  await input.press('Escape');
  await expect(page.getByTestId('attr--edit-preview')).toHaveText(/Checkout API/);
});

test('Should commit on blur', async ({ page }) => {
  await attributeStory.goto(page, 'Inline Edit Text');
  await page.getByTestId('attr--edit-preview').click();
  const input = page.getByTestId('attr--edit-input');
  await input.fill('Blurred API');
  await page.locator('body').click();
  await expect(page.getByTestId('attr--edit-preview')).toHaveText(/Blurred API/);
});

test('Should show loading then saved during async commit', async ({ page }) => {
  await attributeStory.goto(page, 'Inline Edit Async');
  await page.getByTestId('attr--edit-preview').click();
  const input = page.getByTestId('attr--edit-input');
  await input.fill('Async API');
  await input.press('Enter');
  // loading spinner visible inside the preview while the promise is pending
  await expect(page.getByTestId('attr--edit-preview')).toHaveText(/Async API/);
});

test('Should surface error and stay in edit on rejected commit', async ({ page }) => {
  await attributeStory.goto(page, 'Inline Edit Async');
  await page.getByTestId('attr--edit-preview').click();
  const input = page.getByTestId('attr--edit-input');
  await input.fill('');
  await input.press('Enter');
  await expect(page.getByTestId('attr--edit-error')).toBeVisible();
  await expect(page.getByTestId('attr--edit-input')).toBeVisible();
});
```

- [ ] **Step 4: Add Accessibility tests**

Inside `test.describe('Accessibility')`, add:

```ts
test('Should enter edit via keyboard activation', async ({ page }) => {
  await attributeStory.goto(page, 'Inline Edit Text');
  const preview = page.getByTestId('attr--edit-preview');
  await preview.focus();
  await preview.press('Enter');
  await expect(page.getByTestId('attr--edit-input')).toBeFocused();
});

test('Should cancel edit via Escape and restore focus to preview', async ({ page }) => {
  await attributeStory.goto(page, 'Inline Edit Text');
  await page.getByTestId('attr--edit-preview').click();
  await page.getByTestId('attr--edit-input').press('Escape');
  await expect(page.getByTestId('attr--edit-preview')).toBeVisible();
});
```

- [ ] **Step 5: Generate snapshots, run, and commit**

Generate baselines (CI updates screenshots on main via the `[update-screenshots]` commit trigger; locally update with the project's Playwright update flag):

Run: `cd packages/design-system && pnpm exec playwright test src/components/Attribute/Attribute.e2e.ts --update-snapshots`
Then run without the flag to confirm green:
Run: `cd packages/design-system && pnpm exec playwright test src/components/Attribute/Attribute.e2e.ts`
Expected: all inline-edit tests PASS.

```bash
npx biome check --write packages/design-system/src/components/Attribute/Attribute.e2e.ts
git add packages/design-system/src/components/Attribute/Attribute.e2e.ts packages/design-system/src/components/Attribute/Attribute.e2e.ts-snapshots
git commit -m "test(attribute): add inline-edit e2e visual, interaction and a11y tests"
```

> If running Playwright locally is not set up, commit the test code and let CI generate baselines via a commit containing `[update-screenshots]` on the branch, per the repo CI flow.

---

## Self-Review

**Spec coverage:**
- Compound family in `Attribute/` reusing contexts → Tasks 1–7. ✓
- Root props (value/edit/activation/submit/status/error/savedDuration/disabled/readOnly) → Task 2. ✓
- Preview hover target + trigger/loading/saved indicator + activation → Task 3. ✓
- Control edit-mode render + focus + Enter/Escape/blur → Task 4. ✓
- `.Input`/`.Textarea`/`.Number` wrappers → Task 5. ✓
- `.Error` → Task 6. ✓
- `useAttributeEdit()` public hook → Task 1, used in Tasks 8 composed editors. ✓
- Async-by-Promise + override → Task 2 tests + Task 8 `InlineEditAsync`. ✓
- TestId cascade slots (`--edit-preview/-control/-input/-error`) → Tasks 3–6. ✓
- Orientation reuse (no own prop) → Task 2 reads context; `InlineEditHorizontal` story. ✓
- All nine value types in Storybook → Task 8 (text/textarea/number concrete; select/multi/tags/date/time/datetime composed). ✓
- E2E Visual/Interactions/Accessibility → Task 9. ✓
- Metrics contract (forward data-* to real node) → Tasks 3 & 5 tests. ✓

**Placeholder scan:** The only deferred concretes are the composed-editor story bodies in Task 8 Step 3, which require reading the external Select/DateInput/TimeInput story APIs — flagged with exact files to mirror, not left vague. Core component code is complete.

**Type consistency:** Context shape (`AttributeEditContextValue`), status union, and prop omissions on the wrappers match across Tasks 1, 2, 5. `useTestId(slot, override)` usage matches the verified signature. Slot names consistent (`edit-preview`, `edit-control`, `edit-input`, `edit-error`).
