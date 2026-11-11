import { Suspense, type ReactNode } from 'react';

import { describe, expect, it, rs } from '@rstest/core';
import { act, renderHook } from '@testing-library/react';

import type { LineChartSeries } from '../LineChartContext';
import { useLineChartActiveKey } from './useLineChartActiveKey';

describe('useLineChartActiveKey', () => {
  it('keeps the committed callback when a later render suspends', () => {
    const committed = rs.fn();
    const pending = rs.fn();
    const pendingRender = new Promise<void>(() => {});
    const seriesByKey = new Map<string, LineChartSeries>();
    const { result, rerender } = renderHook(
      ({ onChange, suspend }) => {
        const api = useLineChartActiveKey({
          controlledActiveKey: undefined,
          onActiveKeyChange: onChange,
          seriesByKey,
        });
        if (suspend) throw pendingRender;
        return api;
      },
      {
        initialProps: { onChange: committed, suspend: false },
        wrapper: ({ children }: { children: ReactNode }) => (
          <Suspense fallback={null}>{children}</Suspense>
        ),
      },
    );
    const setActiveKey = result.current.setActiveKey;
    rerender({ onChange: pending, suspend: true });
    act(() => setActiveKey('series'));
    expect(committed).toHaveBeenCalledWith('series');
    expect(pending).not.toHaveBeenCalled();
  });
});
