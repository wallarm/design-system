import { createContext, useContext, useLayoutEffect } from 'react';

export type InlineEditStatus = 'idle' | 'loading' | 'saved' | 'error';

export type InlineEditActivationMode = 'click' | 'focus' | 'none';
export type InlineEditSubmitMode = 'enter' | 'blur' | 'both' | 'none';

export interface InlineEditContextValue<T = unknown> {
  editing: boolean;
  value: T;
  committedValue: T;
  status: InlineEditStatus;
  invalid: boolean;
  error?: string;
  disabled: boolean;
  readOnly: boolean;
  activationMode: InlineEditActivationMode;
  submitMode: InlineEditSubmitMode;
  selectOnFocus: boolean;
  /**
   * True while a submit is held by a pending `onBeforeValueCommit` guard or
   * an in-flight `onValueCommit` promise. Ref-backed function so event
   * handlers get a synchronous answer — blur can fire in the same tick the
   * guard opens a dialog, before any re-render.
   */
  isCommitPending: () => boolean;
  setValue: (value: T) => void;
  edit: () => void;
  submit: () => void;
  cancel: () => void;
  /**
   * Registers a submit-mode override while an editor is mounted (last
   * registration wins; returns an unregister cleanup). Prefer the
   * `useInlineEditSubmitMode` hook. Popover editors use this so consumers
   * never have to pair `submitMode='none'` on the root by hand.
   */
  registerSubmitModeOverride: (mode: InlineEditSubmitMode) => () => void;
}

const InlineEditContext = createContext<InlineEditContextValue | null>(null);

export const InlineEditProvider = InlineEditContext.Provider;

export function useInlineEdit<T = unknown>(): InlineEditContextValue<T> {
  const ctx = useContext(InlineEditContext);
  if (!ctx) {
    throw new Error('useInlineEdit must be used within <InlineEdit>');
  }
  return ctx as InlineEditContextValue<T>;
}

/**
 * Declares the submit mode an editor needs while it is mounted (e.g. a
 * popover editor commits on close, so blur/enter handling must be 'none').
 * Registered via layout effect so the override is committed before paint and
 * before any browser event can observe the consumer-provided mode.
 */
export function useInlineEditSubmitMode(mode: InlineEditSubmitMode): void {
  const { registerSubmitModeOverride } = useInlineEdit();
  useLayoutEffect(() => registerSubmitModeOverride(mode), [mode, registerSubmitModeOverride]);
}
