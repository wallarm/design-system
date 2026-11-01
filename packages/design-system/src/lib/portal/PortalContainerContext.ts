import { createContext, type RefObject } from 'react';

/** Internal canvas integration; without a provider Ark keeps its normal portal destination. */
export const PortalContainerContext = createContext<RefObject<HTMLElement | null> | null>(null);
