import { useLayoutEffect } from 'react';

/**
 * zag returns focus on close only through the modal focus trap, so a non-modal drawer leaves focus
 * on <body> once its focused content unmounts. Hands focus back to whatever had it when the drawer
 * opened — unless the user has since moved it elsewhere on the page.
 */
export const useNonModalFocusReturn = (isOpen: boolean, modal: boolean) => {
  useLayoutEffect(() => {
    if (!isOpen || modal) return;
    const opener = document.activeElement;

    return () => {
      // After the commit: React refocuses whatever was focused when the commit started.
      queueMicrotask(() => {
        const focused = document.activeElement;
        const lost =
          !focused ||
          focused === document.body ||
          focused.closest('[data-scope="dialog"]') !== null;
        if (lost && opener instanceof HTMLElement && opener.isConnected) opener.focus();
      });
    };
  }, [isOpen, modal]);
};
