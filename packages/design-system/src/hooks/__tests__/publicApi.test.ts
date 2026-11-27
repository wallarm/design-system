import { describe, expect, it } from '@rstest/core';
import * as root from '../../index';

const HOOKS = [
  'useArrowNav',
  'useControlled',
  'useCopyToClipboard',
  'useIsKeyPressed',
  'useOverflowItems',
  'useScrollSpy',
] as const;

describe('hooks public API', () => {
  it('exports every hook from the package root', () => {
    for (const name of HOOKS) {
      expect(typeof (root as Record<string, unknown>)[name]).toBe('function');
    }
  });
});
