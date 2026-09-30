import type { FC } from 'react';
import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import type { PortalRegistry } from './portalRegistry';

export interface PortalOutletProps {
  registry: PortalRegistry;
}

/**
 * Renders every registry entry into its engine-owned host with `createPortal`.
 * Renders no DOM of its own (so no `data-slot`); portals keep React context,
 * so DS components inside hosts see the surrounding providers.
 */
export const PortalOutlet: FC<PortalOutletProps> = ({ registry }) => {
  const entries = useSyncExternalStore(
    registry.subscribe,
    registry.getSnapshot,
    registry.getSnapshot,
  );

  return <>{entries.map(entry => createPortal(entry.node, entry.host, String(entry.id)))}</>;
};

PortalOutlet.displayName = 'PortalOutlet';
