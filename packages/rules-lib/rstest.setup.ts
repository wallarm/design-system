import { afterEach, expect } from '@rstest/core';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

// jest-dom ships a Vitest-only entry (`@testing-library/jest-dom/vitest`), so
// register its matchers on Rstest's `expect` directly.
expect.extend(matchers);

// Mock ResizeObserver and IntersectionObserver for components that use scroll areas (e.g., CodeSnippet)
global.ResizeObserver = class ResizeObserver {
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  observe() {}
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  unobserve() {}
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  disconnect() {}
};

global.IntersectionObserver = class IntersectionObserver {
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  observe() {}
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  unobserve() {}
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  disconnect() {}
};

// Testing Library only auto-registers cleanup when it finds a global `afterEach`
// at import time; unmount explicitly so the DOM never leaks between tests.
afterEach(() => {
  cleanup();
});
