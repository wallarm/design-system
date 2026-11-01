import { defineConfig, mergeRstestConfig } from '@rstest/core';
import { reactConfig } from '@wallarm-org/rstest-config/react';

// Resolve DS imports to `packages/design-system/src`. Setting conditionNames replaces
// rstest's jsdom default, so `browser` is repeated here.
export default defineConfig(
  mergeRstestConfig(reactConfig, {
    resolve: { conditionNames: ['development', 'browser', '...'] },
  }),
);
