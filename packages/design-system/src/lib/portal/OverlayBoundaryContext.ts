import { createContext, type RefObject } from 'react';

/**
 * Internal: an element that stands in for the viewport for overlays pinned to its edges, such as
 * the table action bar. A docs card that renders a full screen in place provides it, together with
 * a PortalContainerContext inside it. Without a provider those overlays pin to the window, as before.
 */
export const OverlayBoundaryContext = createContext<RefObject<HTMLElement | null> | null>(null);

/** The bottom edge an overlay pins to: the boundary's, else the viewport's. Call it at layout time. */
export const getOverlayBottom = (boundary: RefObject<HTMLElement | null> | null): number =>
  boundary?.current?.getBoundingClientRect().bottom ?? window.innerHeight;
