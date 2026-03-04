import { cn } from '../../../utils/cn';
import { TOUR_SPOTLIGHT_OFFSET } from '../const';
import { tourSpotlightVariants } from '../TourSpotlight';
import type { TourStepEffectArgs } from '../types';

const BEACON_CIRCLE_SIZE = 16;
const BEACON_CIRCLE_GAP = 4;

/**
 * Creates a pulsing beacon overlay that tracks the target element's position.
 * Returns a cleanup function that removes the overlay from the DOM.
 */
const createBeaconOverlay = (el: HTMLElement, shape: 'rect' | 'circle' = 'rect'): VoidFunction => {
  const beacon = document.createElement('div');
  let rafId = 0;

  // Continuously sync position with the target via rAF
  const syncPosition = () => {
    const rect = el.getBoundingClientRect();

    if (shape === 'circle') {
      beacon.style.top = `${rect.bottom + window.scrollY + BEACON_CIRCLE_GAP}px`;
      beacon.style.left = `${rect.left + window.scrollX + rect.width / 2 - BEACON_CIRCLE_SIZE / 2}px`;
      beacon.style.width = `${BEACON_CIRCLE_SIZE}px`;
      beacon.style.height = `${BEACON_CIRCLE_SIZE}px`;
      beacon.style.borderRadius = '50%';
    } else {
      const offset = TOUR_SPOTLIGHT_OFFSET.x;
      const style = window.getComputedStyle(el);
      beacon.style.top = `${rect.top + window.scrollY - offset}px`;
      beacon.style.left = `${rect.left + window.scrollX - offset}px`;
      beacon.style.width = `${rect.width + offset * 2}px`;
      beacon.style.height = `${rect.height + offset * 2}px`;
      beacon.style.borderRadius = style.borderRadius;
    }

    rafId = requestAnimationFrame(syncPosition);
  };

  beacon.className = cn(tourSpotlightVariants({ shape }), 'absolute');

  document.body.appendChild(beacon);
  syncPosition();

  return () => {
    cancelAnimationFrame(rafId);
    beacon.remove();
  };
};

/** Tracks which elements already had their beacon "discovered" (clicked). */
const beaconDiscovered = new WeakSet<HTMLElement>();

export interface BeaconStepEffectOptions {
  /** Beacon shape. `'circle'` renders a 16×16 dot centered below the target. */
  shape?: 'rect' | 'circle';
}

/**
 * Creates a step effect that shows a pulsing beacon around the target element.
 * The popover only appears after the user clicks the highlighted element.
 *
 * On revisit (e.g. Back button), skips the beacon and shows the tooltip immediately.
 *
 * @example
 * ```ts
 * {
 *   id: 'discover',
 *   type: 'tooltip',
 *   target: () => ref.current,
 *   backdrop: false,
 *   effect: beaconStepEffect(),
 * }
 * ```
 *
 * @example Circle beacon
 * ```ts
 * {
 *   id: 'discover-circle',
 *   type: 'tooltip',
 *   target: () => ref.current,
 *   backdrop: false,
 *   effect: beaconStepEffect({ shape: 'circle' }),
 * }
 * ```
 */
export const beaconStepEffect =
  (options: BeaconStepEffectOptions = {}) =>
  (args: TourStepEffectArgs): VoidFunction => {
    const { shape = 'rect' } = options;
    const el = args.target?.();
    if (!el) {
      return () => {};
    }

    // Already discovered — show tooltip immediately, no beacon.
    if (beaconDiscovered.has(el)) {
      args.show();
      return () => {};
    }

    const removeBeacon = createBeaconOverlay(el, shape);

    const handleClick = () => {
      el.removeEventListener('click', handleClick);
      removeBeacon();
      beaconDiscovered.add(el);
      args.show();
    };

    el.addEventListener('click', handleClick);

    return () => {
      removeBeacon();
      el.removeEventListener('click', handleClick);
    };
  };
