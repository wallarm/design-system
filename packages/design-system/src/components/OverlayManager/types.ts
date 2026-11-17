import type { ComponentType, ReactNode } from 'react';

export interface OverlayRootProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExitComplete: () => void;
}

export interface OverlayController<Result = void> {
  rootProps: OverlayRootProps;
  close: (result?: Result) => void;
}

export interface OverlayProps<Result = void> {
  controller: OverlayController<Result>;
}

type AllKeys<T> = T extends unknown ? keyof T : never;

export type OverlayPayload<Props> = Props extends unknown
  ? { [K in keyof Props as K extends 'controller' ? never : K]: Props[K] }
  : never;

export type OverlayResult<Props> = Props extends OverlayProps<infer Result> ? Result : never;

export type OverlayOpenArgs<Payload> = [AllKeys<Payload>] extends [never]
  ? []
  : Partial<Payload> extends Payload
    ? [payload?: Payload]
    : [payload: Payload];

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
