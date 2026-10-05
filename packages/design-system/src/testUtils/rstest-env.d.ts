import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// Types for the jest-dom matchers registered in `rstest.setup.ts` — the Rstest
// counterpart of `@testing-library/jest-dom/types/vitest.d.ts`.
declare module '@rstest/core' {
  // Interface merging requires the type parameter (and its default) to match
  // @rstest/core's own `Matchers<T = any>` declaration exactly.
  interface Matchers<T = any> extends TestingLibraryMatchers<unknown, T> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, unknown> {}
}
