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
import { TestIdProvider, useTestId } from '../../utils/testId';
import {
  type InlineEditActivationMode,
  type InlineEditContextValue,
  InlineEditProvider,
  type InlineEditStatus,
  type InlineEditSubmitMode,
} from './InlineEditContext';

interface SubmitModeOverride {
  token: symbol;
  mode: InlineEditSubmitMode;
}

export interface InlineEditProps<T = unknown> extends TestableProps {
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  onValueCommit?: (value: T) => void | Promise<unknown>;
  onValueRevert?: (value: T) => void;
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
  edit?: boolean;
  defaultEdit?: boolean;
  onEditChange?: (editing: boolean) => void;
  activationMode?: InlineEditActivationMode;
  submitMode?: InlineEditSubmitMode;
  selectOnFocus?: boolean;
  status?: InlineEditStatus;
  error?: string;
  savedDuration?: number;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export function InlineEdit<T = unknown>({
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  onValueRevert,
  onBeforeValueCommit,
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
}: InlineEditProps<T>): ReactElement {
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
  const draftRef = useRef<T>(committedValue as T);
  const [autoStatus, setAutoStatus] = useState<InlineEditStatus>('idle');
  const [autoError, setAutoError] = useState<string | undefined>(undefined);
  const [submitModeOverride, setSubmitModeOverride] = useState<SubmitModeOverride | null>(null);
  const overrideRef = useRef<SubmitModeOverride | null>(null);
  overrideRef.current = submitModeOverride;

  const registerSubmitModeOverride = useCallback((mode: InlineEditSubmitMode) => {
    const prev = overrideRef.current;
    if (process.env.NODE_ENV !== 'production' && prev && prev.mode !== mode) {
      // biome-ignore lint/suspicious/noConsole: dev-only warning surface
      console.warn(
        `InlineEdit: an editor registered submitMode='${mode}' while another editor's '${prev.mode}' override is active. Last registration wins.`,
      );
    }
    const entry: SubmitModeOverride = { token: Symbol('inline-edit-submit-mode'), mode };
    setSubmitModeOverride(entry);
    return () => {
      setSubmitModeOverride(current => (current?.token === entry.token ? null : current));
    };
  }, []);

  // Owns the whole submit lifecycle (guard phase + commit phase). One symbol
  // per submit; cancel()/edit_() null it, so a late async resolution can
  // prove it still owns the session before touching state. A ref, not state:
  // blur can re-enter submit() in the same tick, before any re-render.
  const pendingCommitRef = useRef<symbol | null>(null);
  const isCommitPending = useCallback(() => pendingCommitRef.current !== null, []);

  // Latest-ref pattern (see draftRef/overrideRef): async continuations must
  // see the consumer's current bindings, not those captured at submit time.
  const onValueCommitRef = useRef(onValueCommit);
  onValueCommitRef.current = onValueCommit;
  const onBeforeValueCommitRef = useRef(onBeforeValueCommit);
  onBeforeValueCommitRef.current = onBeforeValueCommit;
  const savedDurationRef = useRef(savedDuration);
  savedDurationRef.current = savedDuration;

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
      draftRef.current = next;
      setDraft(next);
      onValueChange?.(next);
    },
    [onValueChange],
  );

  const edit_ = useCallback(() => {
    if (disabled || readOnly) return;
    pendingCommitRef.current = null;
    draftRef.current = committedValue as T;
    setDraft(committedValue as T);
    setAutoStatus('idle');
    setAutoError(undefined);
    setEditingState(true);
  }, [disabled, readOnly, committedValue, setEditingState]);

  const cancel = useCallback(() => {
    pendingCommitRef.current = null;
    draftRef.current = committedValue as T;
    setDraft(committedValue as T);
    setAutoStatus('idle');
    setAutoError(undefined);
    setEditingState(false);
    onValueRevert?.(committedValue as T);
  }, [committedValue, setEditingState, onValueRevert]);

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
            // Silent decline: stay in edit mode with the draft. Focus is left
            // to the confirmation surface — a modal dialog restores focus to
            // the editor on close; forcing it here races that restore and
            // wedges the dialog open (a non-restoring surface is the
            // consumer's responsibility).
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

  const contextValue = useMemo<InlineEditContextValue<T>>(
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
      submitMode: submitModeOverride?.mode ?? submitMode,
      selectOnFocus,
      isCommitPending,
      setValue: handleSetValue,
      edit: edit_,
      submit,
      cancel,
      registerSubmitModeOverride,
    }),
    [
      editing,
      draft,
      committedValue,
      resolvedStatus,
      invalid,
      resolvedError,
      disabled,
      readOnly,
      activationMode,
      submitMode,
      submitModeOverride,
      selectOnFocus,
      isCommitPending,
      handleSetValue,
      edit_,
      submit,
      cancel,
      registerSubmitModeOverride,
    ],
  );

  return (
    <InlineEditProvider value={contextValue as InlineEditContextValue}>
      <TestIdProvider value={testId}>
        <div
          ref={ref}
          data-testid={testId}
          data-slot='inline-edit'
          data-editing={editing ? '' : undefined}
          className={cn('flex w-full min-w-0 flex-col', className)}
        >
          {children}
        </div>
      </TestIdProvider>
    </InlineEditProvider>
  );
}

InlineEdit.displayName = 'InlineEdit';
