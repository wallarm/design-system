import '@testing-library/jest-dom/vitest';

// Mock scrollIntoView which is not implemented in jsdom
// biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
Element.prototype.scrollIntoView = () => {};

// Mock ResizeObserver which is not implemented in jsdom
global.ResizeObserver = class ResizeObserver {
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  observe() {}
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  unobserve() {}
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  disconnect() {}
};
