import { useLayoutEffect } from 'react';

/** Floating layers — drawers, dialogs, selects, menus, popovers — as opposed to the page itself. */
const LAYER = '[data-part="positioner"], [data-scope="dialog"][data-part="content"]';

/** A Drawer/Dialog content still mounted for its exit animation. */
const EXITING_DIALOG_LAYER = '[data-scope="dialog"][data-part="content"][data-state="closed"]';

const isOnPage = (element: Element) => element.closest(LAYER) === null;

/**
 * The DrawerTrigger of this content: its fallback opener when a pointer press did not focus it
 * (Safari does not focus buttons on click). zag's modal path returns focus to it the same way.
 */
const findTrigger = (contentId: string) =>
  Array.from(
    document.querySelectorAll<HTMLElement>('[data-scope="dialog"][data-part="trigger"]'),
  ).find(trigger => trigger.getAttribute('aria-controls') === contentId) ?? null;

/**
 * zag returns focus on close only through the modal focus trap, so a non-modal drawer leaves focus
 * on <body> once its focused content unmounts. While a non-modal drawer is open this tracks the page
 * element that last opened it (a master-detail list retargets an open drawer from row to row) and,
 * when the drawer closes, returns focus to that element without scrolling the page. It does so only
 * if focus was lost with the drawer — on <body>, inside this drawer, or inside a layer that is
 * closing with it. Focus the user has moved to another layer or control stays where it is, and a
 * drawer closed by a pointer press on the page restores nothing: the user has moved on.
 */
export const useNonModalFocusReturn = (isOpen: boolean, modal: boolean, contentId: string) => {
  // `modal` is read when the drawer opens: switching it on an open drawer is not a close.
  useLayoutEffect(() => {
    if (!isOpen || modal) return;

    const isInside = (node: unknown) =>
      node instanceof Node && document.getElementById(contentId)?.contains(node) === true;
    const active = document.activeElement;
    let target =
      active instanceof HTMLElement && active !== document.body && isOnPage(active) ? active : null;
    let pressedOnPage = false;

    const handleFocusIn = (event: FocusEvent) => {
      const element = event.target;
      if (element instanceof HTMLElement && !isInside(element) && isOnPage(element)) {
        target = element;
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      const element = event.target;
      pressedOnPage = element instanceof Element && !isInside(element) && isOnPage(element);
    };
    const handleKeyDown = () => {
      pressedOnPage = false;
    };

    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      if (pressedOnPage) return;

      // After the commit: React refocuses whatever was focused when the commit started.
      queueMicrotask(() => {
        const focused = document.activeElement;
        const lost =
          !focused ||
          focused === document.body ||
          isInside(focused) ||
          focused.closest(EXITING_DIALOG_LAYER) !== null;
        // The trigger is looked up on close: Ark sets its `aria-controls` only once the content mounts.
        const returnTo = target?.isConnected ? target : findTrigger(contentId);
        if (lost && returnTo) returnTo.focus({ preventScroll: true });
      });
    };
  }, [isOpen, contentId]);
};
