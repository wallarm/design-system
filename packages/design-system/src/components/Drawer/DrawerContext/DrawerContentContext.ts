import { createContext, type RefObject, useContext } from 'react';

/**
 * Holds a ref to the rendered DrawerContent root element.
 *
 * Descendants that need to portal/anchor against the drawer panel itself
 * (e.g. SelectionBulkBar) should read this — not the broader DrawerContext,
 * which is also active around DrawerTrigger and other ancestors that are
 * outside the panel.
 */
export const DrawerContentContext = createContext<RefObject<HTMLElement | null> | null>(null);

export const useOptionalDrawerContentRef = () => useContext(DrawerContentContext);
