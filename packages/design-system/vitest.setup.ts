import '@testing-library/jest-dom/vitest';

// Mock scrollIntoView which is not implemented in jsdom
// biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
Element.prototype.scrollIntoView = () => {};

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
