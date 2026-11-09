import { expect, it } from '@rstest/core';
import { cn } from './index';

it('exports cn', () => {
  expect(cn('p-1', 'p-2')).toBe('p-2');
});
