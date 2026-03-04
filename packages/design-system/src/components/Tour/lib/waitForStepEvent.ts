import { waitForEvent as arkWaitForEvent } from '@ark-ui/react';
import type { TourStepEffectArgs, WaitForStepEventOptions } from '../types';
import { waitForDebouncedEvent } from './waitForDebouncedEvent';

/**
 * Time (ms) for both focus-trap activations to settle after `show()`.
 *
 * show() triggers two sequential focus traps:
 *   target.scrolling (trap #1) → 100ms → tour.active (trap #2, each deferred by rAF).
 * 150ms guarantees we run after both.
 */
const FOCUS_TRAP_SETTLE_DELAY = 150;

/**
 * Prevents the tour's focus trap from stealing focus when it belongs
 * to the target element (e.g. an `<input>` inside the spotlight).
 */
const createFocusGuard = (getTarget: (() => HTMLElement | null) | undefined): VoidFunction => {
  const handler = (e: FocusEvent) => {
    const el = getTarget?.();
    if (el && (e.target === el || el.contains(e.target as Node))) {
      e.stopImmediatePropagation();
    }
  };

  document.addEventListener('focusin', handler, true);
  return () => document.removeEventListener('focusin', handler, true);
};

/**
 * Step effect that pauses the tour until the user triggers a DOM event
 * on the target element, then calls `next()`.
 *
 * **Flow:**
 * 1. Show the tooltip popover.
 * 2. Guard focus so the focus trap doesn't steal it from the target.
 * 3. Wait one frame (popover mounted), then attach the event listener.
 * 4. Auto-focus the target after focus traps settle.
 * 5. On match → teardown → advance to next step.
 *
 * Returns a cleanup function for early teardown (e.g. dismiss / Back).
 */
export const waitForStepEvent = <T extends HTMLElement = HTMLElement>(
  event: keyof HTMLElementEventMap,
  args: Pick<TourStepEffectArgs, 'show' | 'next'> & {
    target?: (() => T | null) | undefined;
  },
  options?: WaitForStepEventOptions<T>,
): VoidFunction => {
  const disposables: VoidFunction[] = [];
  const teardown = () => {
    for (const fn of disposables) fn();
    disposables.length = 0;
  };

  // 1. Show the tooltip
  args.show();

  // 2. Prevent focus trap from fighting the target element
  disposables.push(createFocusGuard(args.target));

  // 3. Attach the event listener after one frame (popover needs to mount first)
  requestAnimationFrame(() => {
    const [eventFired, removeListener] = options?.delay
      ? waitForDebouncedEvent(args.target, event, options.delay, options.predicate)
      : arkWaitForEvent(args.target, event, { predicate: options?.predicate });

    disposables.push(removeListener);

    eventFired.then(() => {
      teardown();
      args.next();
    });
  });

  // 4. Auto-focus the target after both focus traps settle
  const focusTimer = setTimeout(() => args.target?.()?.focus(), FOCUS_TRAP_SETTLE_DELAY);
  disposables.push(() => clearTimeout(focusTimer));

  return teardown;
};
