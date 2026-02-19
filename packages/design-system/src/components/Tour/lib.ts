import type { StepAction, StepEffectArgs } from '@zag-js/tour';
import {
  TOUR_SPOTLIGHT_OFFSET,
  TOUR_SPOTLIGHT_RADIUS,
  TOUR_SPOTLIGHT_RING_WIDTH,
  TOUR_Z_INDEX,
} from './const';

/** @internal Shared ref populated by `TourContent` with `tour.next()` from context. */
export const _tourNextRef: { current: VoidFunction } = { current: () => undefined };

export interface WaitForEventOptions<T extends HTMLElement = HTMLElement> {
  predicate?: (el: T) => boolean;
  delay?: number;
}

/**
 * Listens for a DOM event on the target element and returns a `[Promise, cleanup]` tuple.
 *
 * - Without a `predicate` the promise resolves on the first event.
 * - With a `predicate` the promise resolves once the predicate returns `true`.
 *
 * @param target - Element accessor from `StepEffectArgs`.
 * @param event  - DOM event name (e.g. `'click'`, `'input'`, `'change'`).
 * @param options - Optional predicate to gate resolution.
 */
const waitForEvent = <T extends HTMLElement = HTMLElement>(
  target: (() => T | null) | undefined,
  event: string,
  options?: WaitForEventOptions<T>,
): [Promise<void>, VoidFunction] => {
  let cleanup: VoidFunction = () => undefined;

  const promise = new Promise<void>(resolve => {
    const el = typeof target === 'function' ? target() : null;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout>;

    const handler = () => {
      if (options?.predicate && !options.predicate(el)) {
        clearTimeout(timer);
        return;
      }

      if (options?.delay) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          el.removeEventListener(event, handler);
          resolve();
        }, options.delay);
        return;
      }

      el.removeEventListener(event, handler);
      resolve();
    };

    el.addEventListener(event, handler);
    cleanup = () => {
      clearTimeout(timer);
      el.removeEventListener(event, handler);
    };
  });

  return [promise, cleanup];
};

/**
 * @param event   - DOM event to listen for (e.g. `'click'`, `'input'`, `'change'`).
 * @param args    - Step effect args (`show`, `target`).
 * @param options - Optional predicate to gate advancement.
 */
export const waitForStepEvent = <T extends HTMLElement = HTMLElement>(
  event: string,
  args: Pick<StepEffectArgs, 'show'> & { target?: (() => T | null) | undefined },
  options?: WaitForEventOptions<T>,
): VoidFunction => {
  args.show();

  const getTarget = args.target;
  const focusinGuard = (e: FocusEvent) => {
    const el = typeof getTarget === 'function' ? getTarget() : null;
    if (el && (e.target === el || el.contains(e.target as Node))) {
      e.stopImmediatePropagation();
    }
  };
  document.addEventListener('focusin', focusinGuard, true);

  let cancel: VoidFunction = () => undefined;

  requestAnimationFrame(() => {
    const [promise, cleanup] = waitForEvent(args.target, event, options);
    cancel = () => {
      cleanup();
      clearTimeout(focusTimer);
      document.removeEventListener('focusin', focusinGuard, true);
    };
    promise.then(() => {
      document.removeEventListener('focusin', focusinGuard, true);
      _tourNextRef.current();
    });
  });

  // Focus the target after BOTH focus trap activations complete.
  // The machine transitions show() → target.scrolling (trapFocus #1)
  // → 100ms → tour.active (trapFocus #2, each deferred by raf).
  // 150ms guarantees we run after the second trap steals focus.
  const focusTimer = setTimeout(() => {
    const el = typeof getTarget === 'function' ? getTarget() : null;
    el?.focus();
  }, 150);

  return () => cancel();
};

const BEACON_BORDER_WIDTH = 2;

/**
 * Creates a pulsing beacon overlay positioned over the target element.
 * Returns a cleanup function that removes the overlay from the DOM.
 */
const createBeaconOverlay = (el: HTMLElement): VoidFunction => {
  const offset = TOUR_SPOTLIGHT_OFFSET.x;
  const beacon = document.createElement('div');
  let rafId = 0;

  const sync = () => {
    const rect = el.getBoundingClientRect();
    beacon.style.top = `${rect.top + window.scrollY - offset}px`;
    beacon.style.left = `${rect.left + window.scrollX - offset}px`;
    beacon.style.width = `${rect.width + offset * 2}px`;
    beacon.style.height = `${rect.height + offset * 2}px`;
    rafId = requestAnimationFrame(sync);
  };

  Object.assign(beacon.style, {
    position: 'absolute',
    border: `${BEACON_BORDER_WIDTH}px solid var(--color-border-strong-brand)`,
    borderRadius: `${TOUR_SPOTLIGHT_RADIUS}px`,
    outline: `${TOUR_SPOTLIGHT_RING_WIDTH}px solid var(--color-states-brand-pressed)`,
    outlineOffset: `${offset - TOUR_SPOTLIGHT_RING_WIDTH}px`,
    pointerEvents: 'none',
    zIndex: `${TOUR_Z_INDEX}`,
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  });

  document.body.appendChild(beacon);
  sync();

  return () => {
    cancelAnimationFrame(rafId);
    beacon.remove();
  };
};

/**
 * Passive discovery step effect: shows a pulsing beacon around the target
 * element without displaying a popover. The popover appears only after the
 * user clicks the highlighted element.
 *
 * Use with `type: "tooltip"`. The effect intercepts the default show
 * behaviour and defers it until the user clicks the target.
 *
 * @example
 * ```ts
 * {
 *   id: 'discover',
 *   type: 'tooltip',
 *   target: () => ref.current,
 *   backdrop: false,
 *   effect: beaconStepEffect,
 * }
 * ```
 */
const _beaconDiscovered = new WeakSet<HTMLElement>();

export const beaconStepEffect = (args: StepEffectArgs): VoidFunction => {
  const el = args.target?.();
  if (!el) return () => undefined;

  // Revisit (e.g. via Back) — skip beacon, show tooltip immediately.
  if (_beaconDiscovered.has(el)) {
    args.show();
    return () => undefined;
  }

  const removeBeacon = createBeaconOverlay(el);

  const handleClick = () => {
    el.removeEventListener('click', handleClick);
    removeBeacon();
    _beaconDiscovered.add(el);
    args.show();
  };

  el.addEventListener('click', handleClick);

  return () => {
    removeBeacon();
    el.removeEventListener('click', handleClick);
  };
};

export const getDefaultActions = (
  firstStep: boolean,
  lastStep: boolean,
  totalSteps: number,
): StepAction[] => {
  if (totalSteps === 1) return [{ label: 'Got it', action: 'dismiss' }];
  if (firstStep)
    return [
      { label: 'Skip', action: 'dismiss' },
      { label: 'Start', action: 'next' },
    ];
  if (lastStep)
    return [
      { label: 'Back', action: 'prev' },
      { label: 'Finish', action: 'dismiss' },
    ];
  return [
    { label: 'Back', action: 'prev' },
    { label: 'Next', action: 'next' },
  ];
};
