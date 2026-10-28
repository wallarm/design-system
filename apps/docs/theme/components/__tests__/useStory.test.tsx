import { describe, expect, it, rs } from '@rstest/core';
import { renderHook, waitFor } from '@testing-library/react';

import { useStory } from '../useStory';

rs.mock('storybook-react-rsbuild', () => ({
  composeStories: (module: Record<string, unknown>) => module,
}));

describe('useStory', () => {
  it('yields an error when load rejects', async () => {
    rs.spyOn(console, 'error').mockImplementation(() => undefined);
    const load = () => Promise.reject(new Error('chunk failed'));
    const { result } = renderHook(() => useStory(load, 'Basic'));
    await waitFor(() => expect(result.current.error?.message).toBe('chunk failed'));
    expect(result.current.Story).toBeNull();
  });

  it('yields a not-found error for an unknown story name', async () => {
    rs.spyOn(console, 'error').mockImplementation(() => undefined);
    const load = () => Promise.resolve({ Basic: () => null });
    const { result } = renderHook(() => useStory(load, 'Missing'));
    await waitFor(() =>
      expect(result.current.error?.message).toBe('Story "Missing" not found in module'),
    );
  });

  it('resolves a known story', async () => {
    const Basic = () => null;
    const load = () => Promise.resolve({ Basic });
    const { result } = renderHook(() => useStory(load, 'Basic'));
    await waitFor(() => expect(result.current.Story).toBe(Basic));
    expect(result.current.error).toBeNull();
  });
});
