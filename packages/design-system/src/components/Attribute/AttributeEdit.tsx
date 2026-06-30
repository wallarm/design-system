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
      selectOnFocus,
      handleSetValue,
      edit_,
      submit,
      cancel,
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
