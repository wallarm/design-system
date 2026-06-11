import { defineConfig } from 'vitest/config';
import { reactConfig } from '@wallarm-org/vitest-config/react';

export default defineConfig({
  ...reactConfig,
  test: {
    ...reactConfig.test,
    setupFiles: ['./vitest.setup.ts'],
    // Interaction tests (userEvent + Ark/zag portal menus) mount the menu a frame
    // after the state transition. Under CI's parallel file load the event loop is
    // starved and that frame can exceed the query timeout, so the same tests pass
    // in isolation but flake under load. Retry re-runs only failed tests — a real
    // regression still fails every attempt, while a load flake clears on retry.
    retry: 2,
  },
});
