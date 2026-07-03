import { createContext, useContext } from 'react';

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
  setValue: (value: T) => void;
  edit: () => void;
  submit: () => void;
  cancel: () => void;
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
