import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// @testing-library/dom's `jestFakeTimersAreEnabled()` checks `typeof jest !== 'undefined'`
// to decide whether to use the fake-timer polling branch in `waitFor`. Under Vitest,
// `jest` is not injected as a global, so that check always returns false — causing waitFor
// to use real setInterval polling, which deadlocks when vi.useFakeTimers() is active.
// Aliasing globalThis.jest to vi makes the detection work correctly:
// waitFor's while-loop then calls jest.advanceTimersByTime (= vi.advanceTimersByTime)
// between checks, allowing Promise microtasks to flush and assertions to pass.
(globalThis as any).jest = vi;

// Mock scrollIntoView which is not implemented in jsdom
// biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
Element.prototype.scrollIntoView = () => {};

// Mock scrollTo which jsdom omits; Zag UI's select uses it to reset the
// content scroll position when value changes.
// biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
Element.prototype.scrollTo = (() => {}) as Element['scrollTo'];

// Mock scrollBy which jsdom omits; the Table horizontal scroll controls call it.
// biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
Element.prototype.scrollBy = (() => {}) as Element['scrollBy'];

// Mock IntersectionObserver which is not implemented in jsdom
global.IntersectionObserver = class IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '0px';
  readonly thresholds: readonly number[] = [0];
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  observe() {}
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  unobserve() {}
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
} as unknown as typeof IntersectionObserver;

// Mock ResizeObserver which is not implemented in jsdom
global.ResizeObserver = class ResizeObserver {
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  observe() {}
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  unobserve() {}
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  disconnect() {}
};

// jsdom omits visualViewport; @zag-js/tour reads it during boundary tracking
// and crashes after unmount in unrelated tests. Stub the minimum surface.
if (typeof window !== 'undefined' && !window.visualViewport) {
  // biome-ignore lint/suspicious/noExplicitAny: jsdom shim
  (window as any).visualViewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    offsetLeft: 0,
    offsetTop: 0,
    pageLeft: 0,
    pageTop: 0,
    scale: 1,
    // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
    addEventListener() {},
    // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
    removeEventListener() {},
    dispatchEvent: () => true,
  };
}
