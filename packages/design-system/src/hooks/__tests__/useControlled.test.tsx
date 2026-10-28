import { describe, expect, it } from '@rstest/core';
import { act, renderHook } from '@testing-library/react';

import { useControlled } from '../useControlled';

describe('useControlled', () => {
  it('keeps uncontrolled mode and the original default across prop changes', () => {
    const { result, rerender } = renderHook(props => useControlled<string>(props), {
      initialProps: { controlled: undefined as string | undefined, default: 'initial' },
    });
    const setValue = result.current[1];
    act(() => setValue('edited'));
    rerender({ controlled: 'parent', default: 'replacement' });
    expect(result.current[0]).toBe('edited');
    expect(result.current[1]).toBe(setValue);
    act(() => setValue(undefined));
    expect(result.current[0]).toBeUndefined();
  });

  it('keeps controlled mode when the parent clears its value and ignores local writes', () => {
    const { result, rerender } = renderHook(props => useControlled<string>(props), {
      initialProps: { controlled: 'parent' as string | undefined, default: 'fallback' },
    });
    const setValue = result.current[1];
    act(() => setValue('ignored'));
    expect(result.current[0]).toBe('parent');
    rerender({ controlled: undefined, default: 'replacement' });
    expect(result.current[0]).toBeUndefined();
    expect(result.current[1]).toBe(setValue);
    act(() => setValue('still ignored'));
    expect(result.current[0]).toBeUndefined();
  });

  it('treats null as a controlled value', () => {
    const { result } = renderHook(() =>
      useControlled<string | null>({ controlled: null, default: 'fallback' }),
    );
    act(() => result.current[1]('ignored'));
    expect(result.current[0]).toBeNull();
  });
});
