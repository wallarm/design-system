import { type Ref, type RefCallback, useCallback } from 'react';

/**
 * Keeps a zag popper positioner's `--z-index` in sync with the computed z-index of its
 * content element.
 *
 * Why: overlay contents (DropdownMenu, Select, Popover, Calendar) carry a layer-aware
 * z-index — `calc(50 + var(--layer-index, 0) * 20)` — and zag's dismissable layer stack
 * sets `--layer-index` inline on the content when it registers the layer. The content sits
 * inside the positioner, which is its own stacking context (`isolation: isolate`,
 * `z-index: var(--z-index)`), so only the positioner's `--z-index` decides how the popup
 * stacks against a dialog/drawer. Zag's popper copies `getComputedStyle(content).zIndex`
 * into that variable exactly once per positioning run. Since @zag-js/dismissable 1.43.3
 * the layer can register after that read, so the positioner kept the `--layer-index`-less
 * value (50) and a popup opened inside a nested dialog/drawer (positioner at 70) rendered
 * beneath it.
 *
 * This watches the content's `style`/`class` (where `--layer-index` lands) and re-copies
 * the computed z-index onto the positioner whenever it changes, so stacking no longer
 * depends on the order in which zag registers the layer and positions the popup.
 *
 * Returns a cleanup that stops observing.
 */
export function syncLayerZIndex(content: HTMLElement): () => void {
  const sync = () => {
    const positioner = content.parentElement;
    if (!positioner) return;
    const { zIndex } = getComputedStyle(content);
    if (!zIndex || zIndex === 'auto') return;
    if (positioner.style.getPropertyValue('--z-index') !== zIndex) {
      positioner.style.setProperty('--z-index', zIndex);
    }
  };

  sync();
  const observer = new MutationObserver(sync);
  observer.observe(content, { attributes: true, attributeFilter: ['style', 'class'] });
  return () => observer.disconnect();
}

/**
 * Ref callback for an overlay content element: forwards the node to `ref` and keeps the
 * parent positioner's `--z-index` synced (see `syncLayerZIndex`). Uses a React 19 ref
 * cleanup, so the observer is disconnected when the node detaches. Stable while `ref` is.
 */
export function useLayerZIndexRef<T extends HTMLElement>(ref?: Ref<T>): RefCallback<T> {
  return useCallback(
    (node: T | null) => {
      if (!node) return;
      const refCleanup = typeof ref === 'function' ? ref(node) : undefined;
      if (ref && typeof ref !== 'function') ref.current = node;
      const stop = syncLayerZIndex(node);
      return () => {
        stop();
        if (typeof refCleanup === 'function') refCleanup();
        else if (typeof ref === 'function') ref(null);
        else if (ref) ref.current = null;
      };
    },
    [ref],
  );
}
