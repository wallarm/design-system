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
