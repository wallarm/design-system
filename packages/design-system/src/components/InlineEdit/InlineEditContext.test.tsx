import { describe, expect, it } from '@rstest/core';
import { renderHook } from '@testing-library/react';
import { useInlineEdit } from './InlineEditContext';

describe('useInlineEdit', () => {
  it('throws when used outside InlineEdit', () => {
    expect(() => renderHook(() => useInlineEdit())).toThrow(/must be used within <InlineEdit>/);
  });
});
