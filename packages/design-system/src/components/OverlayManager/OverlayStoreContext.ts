import { createContext } from 'react';
import type { OverlayStore } from './overlayStore';
import type { OverlayController } from './types';

/** The nearest OverlayProvider's store; `null` outside every provider. */
export const OverlayStoreContext = createContext<OverlayStore | null>(null);

/**
 * The managed overlay a component renders in; `null` outside one. `lazyOverlayBody` closes it when
 * its body fails.
 */
export const OverlayInstanceContext = createContext<OverlayController<unknown> | null>(null);
