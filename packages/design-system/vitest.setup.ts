import '@testing-library/jest-dom/vitest';

// Mock scrollIntoView which is not implemented in jsdom
Element.prototype.scrollIntoView = () => {
  /* noop */
};

// Mock ResizeObserver which is not implemented in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {
    /* noop */
  }
  unobserve() {
    /* noop */
  }
  disconnect() {
    /* noop */
  }
};
