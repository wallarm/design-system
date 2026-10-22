import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { renderHook } from '@testing-library/react';
import { useInView } from '../useInView';

afterEach(() => {
  rs.unstubAllGlobals();
});

describe('useInView', () => {
  it('useInView falls back to true without IntersectionObserver', () => {
    rs.stubGlobal('IntersectionObserver', undefined);
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useInView(ref));
    expect(result.current).toBe(true);
  });
});
