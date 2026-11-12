import { createContext, type RefObject } from 'react';

/** Internal: where DS overlays portal to, for claude-design canvas artboards and the docs' live
 *  template cards. Without a provider Ark keeps its normal portal destination. */
export const PortalContainerContext = createContext<RefObject<HTMLElement | null> | null>(null);
