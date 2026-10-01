import { defineConfig, mergeRstestConfig } from '@rstest/core';
import { reactConfig } from '@wallarm-org/rstest-config/react';

export default defineConfig(
  mergeRstestConfig(reactConfig, {
    // Load jsdom natively instead of Rstest's prebundled copy: FileUpload's test helpers
    // build a real jsdom FileList through jsdom's own idl utils (createRequire), and
    // those only see wrappers created by the very same jsdom module instance.
    testEnvironment: { name: 'jsdom', prebundle: false },
    setupFiles: ['./rstest.setup.ts'],
    // Interaction tests (userEvent + Ark/zag portal menus) mount the menu a frame
    // after the state transition. Under CI's parallel file load the event loop is
    // starved and that frame can exceed the query timeout, so the same tests pass
    // in isolation but flake under load. Retry re-runs only failed tests — a real
    // regression still fails every attempt, while a load flake clears on retry.
    retry: 2,
  }),
);
