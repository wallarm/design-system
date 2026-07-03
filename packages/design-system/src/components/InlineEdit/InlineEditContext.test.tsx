import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useInlineEdit } from './InlineEditContext';

describe('useInlineEdit', () => {
  it('throws when used outside InlineEdit', () => {
    expect(() => renderHook(() => useInlineEdit())).toThrow(/must be used within <InlineEdit>/);
  });
});
