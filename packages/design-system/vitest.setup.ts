import '@testing-library/jest-dom/vitest';

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
  (window as { visualViewport?: unknown }).visualViewport = {
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

// jsdom does not implement layout on Range. CodeMirror measures text through
// Range#getClientRects / getBoundingClientRect (coordsAtPos, cursor drawing,
// tooltips) and throws "getClientRects is not a function" without them.
// Stub zero-size rects; layout-dependent behaviour is covered by Playwright E2E.
if (typeof document !== 'undefined' && typeof document.createRange === 'function') {
  const emptyRect = (): DOMRect =>
    typeof DOMRect === 'function'
      ? new DOMRect(0, 0, 0, 0)
      : ({
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          toJSON: () => ({}),
        } as DOMRect);

  const emptyRectList = (): DOMRectList =>
    ({
      length: 0,
      item: () => null,
      [Symbol.iterator]: function* () {
        yield* [] as DOMRect[];
      },
    }) as unknown as DOMRectList;

  const rangePrototype = Object.getPrototypeOf(document.createRange()) as Range;
  if (typeof rangePrototype.getClientRects !== 'function') {
    rangePrototype.getClientRects = emptyRectList;
  }
  if (typeof rangePrototype.getBoundingClientRect !== 'function') {
    rangePrototype.getBoundingClientRect = emptyRect;
  }
}
