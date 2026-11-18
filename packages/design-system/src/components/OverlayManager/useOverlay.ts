import { useContext } from 'react';
import { OverlayStoreContext } from './OverlayStoreContext';
import type { OverlayDefinition, OverlayOpenArgs } from './types';

export interface UseOverlayReturn<Payload, Result> {
  /**
   * Resolves with the value passed to `close`, or `undefined` when the overlay was dismissed or
   * failed. Await it in an event handler, not inside a transition or a form action.
   */
  open: (...args: OverlayOpenArgs<Payload>) => Promise<Result | undefined>;
}

/** Opens `definition` in the nearest `OverlayProvider`; a remote without its own reaches the host's. */
export const useOverlay = <Payload, Result>(
  definition: OverlayDefinition<Payload, Result>,
): UseOverlayReturn<Payload, Result> => {
  const store = useContext(OverlayStoreContext);
  if (!store) throw new Error('useOverlay must be used inside an <OverlayProvider>');
  // The store is erased. This is its typed view for one definition: defineOverlay makes every
  // definition an InternalOverlayDefinition, and the store settles with what close() receives.
  const open = store.open as unknown as (
    definition: OverlayDefinition<Payload, Result>,
    ...args: OverlayOpenArgs<Payload>
  ) => Promise<Result | undefined>;
  return { open: (...args) => open(definition, ...args) };
};
