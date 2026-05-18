import { type RefObject, useEffect } from 'react';

export interface UseArrowNavOptions {
  onArrowRight?: () => void;
  onArrowLeft?: () => void;
  onEnter?: () => void;
}

/** Check visibility by walking ancestors up to the container — catches overflow-hidden clipping */
function isVisible(el: HTMLElement, container: HTMLElement): boolean {
  let current: HTMLElement | null = el;
  while (current && current !== container) {
    if (current.offsetWidth === 0 || current.offsetHeight === 0) return false;
    current = current.parentElement;
  }
  return true;
}

export function useArrowNav(
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
  options?: UseArrowNavOptions,
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function getItems(): HTMLElement[] {
      const all = container!.querySelectorAll<HTMLElement>(selector);
      return Array.from(all).filter(el => isVisible(el, container!));
    }

    function syncTabIndex(): void {
      const items = getItems();
      if (items.length === 0) return;

      const active = items.find(el => el.getAttribute('aria-current') === 'page');
      const hasFocused = items.find(el => el.getAttribute('tabindex') === '0');

      // Only set initial tabindex if no item already has tabindex=0
      if (!hasFocused) {
        const target = active ?? items[0];
        for (const item of items) {
          item.setAttribute('tabindex', item === target ? '0' : '-1');
        }
      } else {
        // Ensure new/visible items get tabindex=-1
        for (const item of items) {
          if (!item.hasAttribute('tabindex')) {
            item.setAttribute('tabindex', '-1');
          }
        }
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      const { key } = event;

      if (key === 'Enter') {
        const target = document.activeElement as HTMLElement;
        if (target && getItems().includes(target)) {
          event.preventDefault();
          target.click();
          options?.onEnter?.();
        }
        return;
      }

      if (key === 'ArrowRight' && options?.onArrowRight) {
        event.preventDefault();
        options.onArrowRight();
        return;
      }

      if (key === 'ArrowLeft' && options?.onArrowLeft) {
        event.preventDefault();
        options.onArrowLeft();
        return;
      }

      if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;

      const items = getItems();
      if (items.length === 0) return;

      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      if (currentIndex === -1) return;

      event.preventDefault();

      let nextIndex: number;

      switch (key) {
        case 'ArrowDown':
          nextIndex = currentIndex + 1 >= items.length ? 0 : currentIndex + 1;
          break;
        case 'ArrowUp':
          nextIndex = currentIndex - 1 < 0 ? items.length - 1 : currentIndex - 1;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = items.length - 1;
          break;
        default:
          return;
      }

      items[currentIndex]?.setAttribute('tabindex', '-1');
      items[nextIndex]?.setAttribute('tabindex', '0');
      items[nextIndex]?.focus();
    }

    syncTabIndex();

    const observer = new MutationObserver(syncTabIndex);
    observer.observe(container, { childList: true, subtree: true, attributes: true });

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      observer.disconnect();
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, selector, options?.onArrowRight, options?.onArrowLeft, options?.onEnter]);
}
