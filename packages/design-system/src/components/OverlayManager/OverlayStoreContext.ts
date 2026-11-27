import { createContext } from 'react';
import type { OverlayStore } from './overlayStore';

/** The nearest OverlayProvider's store; `null` outside every provider. */
export const OverlayStoreContext = createContext<OverlayStore | null>(null);
