import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeFile } from './FileUpload.test.helpers';
import { useFilePreviewUrl } from './useFilePreviewUrl';

describe('useFilePreviewUrl', () => {
  let n = 0;
  const create = vi.fn(() => `blob:preview-${++n}`);
  const revoke = vi.fn();

  beforeEach(() => {
    n = 0;
    create.mockClear();
    revoke.mockClear();
    // jsdom has no object URLs.
    URL.createObjectURL = create;
    URL.revokeObjectURL = revoke;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns undefined without a file', () => {
    const { result } = renderHook(() => useFilePreviewUrl(undefined));
    expect(result.current).toBeUndefined();
    expect(create).not.toHaveBeenCalled();
  });

  it('creates a URL, revokes it on change and on unmount', () => {
    const a = makeFile('a.png', 3, 'image/png');
    const b = makeFile('b.png', 3, 'image/png');
    const { result, rerender, unmount } = renderHook(({ file }) => useFilePreviewUrl(file), {
      initialProps: { file: a as File | undefined },
    });
    expect(result.current).toBe('blob:preview-1');

    rerender({ file: b });
    expect(revoke).toHaveBeenCalledWith('blob:preview-1');
    expect(result.current).toBe('blob:preview-2');

    rerender({ file: undefined });
    expect(revoke).toHaveBeenCalledWith('blob:preview-2');
    expect(result.current).toBeUndefined();

    rerender({ file: a });
    unmount();
    expect(revoke).toHaveBeenCalledWith('blob:preview-3');
  });
});
