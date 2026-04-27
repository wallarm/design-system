import { createContext, useContext } from 'react';

interface DrawerContentScope {
  /** The rendered DrawerContent panel element, or null while it is unmounted. */
  element: HTMLElement | null;
}

/**
 * Scope for descendants of the rendered DrawerContent panel.
 *
 * `null` when consumed outside DrawerContent (e.g. next to DrawerTrigger).
 * Inside DrawerContent the value is non-null but `element` may be null on
 * the very first render before the callback ref attaches — consumers that
 * portal/anchor against the panel should gate on `element` to avoid a
 * one-frame flash through document.body.
 */
export const DrawerContentContext = createContext<DrawerContentScope | null>(null);

export const useOptionalDrawerContentScope = () => useContext(DrawerContentContext);
