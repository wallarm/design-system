import type { ComponentType } from 'react';
import type {
  ErasedOverlayComponent,
  OverlayDefinition,
  OverlayPayload,
  OverlayProps,
  OverlayResult,
} from './types';

export interface InternalOverlayDefinition<Payload = unknown, Result = unknown>
  extends OverlayDefinition<Payload, Result> {
  /** Cached per definition; the cache clears on rejection so the next call retries. */
  load: () => Promise<ErasedOverlayComponent>;
}

/**
 * Describes an overlay once. `load` returns the component itself, never `React.lazy`;
 * importing the definition does not load the overlay's code.
 */
export const defineOverlay = <Props extends OverlayProps<never>>(
  load: () => Promise<ComponentType<Props> & { readonly _result?: never }>,
): OverlayDefinition<OverlayPayload<Props>, OverlayResult<Props>> => {
  let cached: Promise<ErasedOverlayComponent> | undefined;
  // `new Promise` calls the loader synchronously and turns a synchronous throw into a rejection.
  const loadOnce = () =>
    (cached ??= new Promise<unknown>(resolve => resolve(load())).then(
      component => component as unknown as ErasedOverlayComponent,
      error => {
        cached = undefined;
        throw error;
      },
    ));
  const definition: InternalOverlayDefinition<OverlayPayload<Props>, OverlayResult<Props>> = {
    load: loadOnce,
    preload: () =>
      loadOnce().then(
        () => undefined,
        () => undefined,
      ),
  };
  return definition;
};
