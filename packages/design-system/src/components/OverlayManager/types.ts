import type { ComponentType, ReactNode } from 'react';

/** Spread onto the overlay's single `Dialog` or `Drawer` root. */
export interface OverlayRootProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExitComplete: () => void;
}

export interface OverlayController<Result = void> {
  /** Spread onto the overlay's single root: `<Dialog {...controller.rootProps}>`. */
  rootProps: OverlayRootProps;
  /** Closes the overlay with a result; the `open()` promise settles with it. */
  close: (result?: Result) => void;
}

export interface OverlayProps<Result = void> {
  /**
   * Passed by `OverlayProvider`, not by the caller of `open()`: spread its `rootProps` onto the
   * root, and call its `close` with the result.
   */
  controller: OverlayController<Result>;
}

type AllKeys<T> = T extends unknown ? keyof T : never;

/** The payload `open()` takes: from the overlay's props type, or from its definition (`typeof X`). */
export type OverlayPayload<T> =
  T extends OverlayDefinition<infer Payload, unknown>
    ? Payload
    : { [K in keyof T as K extends 'controller' ? never : K]: T[K] };

/** What `open()` resolves with besides `undefined`: from the props type, or from the definition. */
export type OverlayResult<T> =
  T extends OverlayDefinition<unknown, infer Result>
    ? Result
    : T extends OverlayProps<infer Result>
      ? Result
      : never;

export type OverlayOpenArgs<Payload> = [AllKeys<Payload>] extends [never]
  ? []
  : {} extends Payload
    ? [payload?: Payload]
    : [payload: Payload];

/**
 * Internal: `defineOverlay`'s extra argument, empty for a valid component. Props without
 * `controller` (none at all, or only optional ones) or with a `key` make it required, which fails
 * the call with this message.
 */
export type OverlayPropsCheck<Props> = [Props] extends [OverlayProps<never> & { key?: never }]
  ? []
  : [error: 'an overlay takes OverlayProps<Result>, with controller and without key'];

export interface OverlayDefinition<Payload, Result> {
  preload: () => Promise<void>;
  readonly '~types'?: { readonly payload: Payload; readonly result: Result };
}

export type OverlayCloseKey = string | number | boolean | null | undefined;

export interface OverlayProviderProps {
  children: ReactNode;
  /**
   * Closes every overlay opened before this value changed. Pass the committed page key, from the
   * first render: a key that goes from `undefined` to its first value counts as a change. An
   * `open()` from a descendant's layout effect in the same commit as a change is closed with the
   * rest.
   */
  closeOnChange?: OverlayCloseKey;
  /**
   * Gets loader and render errors; that overlay's `open()` resolves `undefined`. Defaults to the
   * enclosing provider's `onError`, and to `reportError` in the outermost one.
   */
  onError?: (error: unknown) => void;
}

/** Internal: what the provider renders. Not exported from index.ts. */
export type ErasedOverlayComponent = ComponentType<OverlayProps<unknown> & Record<string, unknown>>;
