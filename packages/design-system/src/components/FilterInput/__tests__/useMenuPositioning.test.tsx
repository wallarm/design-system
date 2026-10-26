import { useRef } from 'react';

import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { render, renderHook, screen } from '@testing-library/react';

import { useMenuPositioning } from '../hooks/useFilterInputAutocomplete/useMenuPositioning';

const Harness = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buildingChipRef = useRef<HTMLDivElement>(null);
  useMenuPositioning({
    containerRef,
    buildingChipRef,
    isBuilding: true,
    insertIndex: 0,
    chipsCount: 0,
    isMenuOpen: true,
  });
  return (
    <div ref={containerRef} data-testid='container'>
      <div ref={buildingChipRef} data-testid='chip' />
    </div>
  );
};

describe('useMenuPositioning', () => {
  afterEach(() => rs.unstubAllGlobals());

  it('observes the mounted anchor elements without waiting for another render', () => {
    const observe = rs.fn();
    const disconnect = rs.fn();
    rs.stubGlobal(
      'ResizeObserver',
      class {
        observe = observe;
        disconnect = disconnect;
      },
    );
    const { unmount } = render(<Harness />);
    expect(observe).toHaveBeenCalledWith(screen.getByTestId('container'));
    expect(observe).toHaveBeenCalledWith(screen.getByTestId('chip'));
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('publishes the committed anchor before notifying floating UI about a chip change', () => {
    const container = document.createElement('div');
    const input = document.createElement('input');
    container.getBoundingClientRect = () => new DOMRect(0, 0, 300, 40);
    input.getBoundingClientRect = () => new DOMRect(100, 0, 200, 40);
    const containerRef = { current: container };
    const inputRef = { current: input };
    const buildingChipRef = { current: null };
    const { result, rerender } = renderHook(
      ({ chipsCount }) =>
        useMenuPositioning({
          containerRef,
          inputRef,
          buildingChipRef,
          isBuilding: false,
          insertIndex: 0,
          chipsCount,
          isMenuOpen: true,
        }),
      { initialProps: { chipsCount: 0 } },
    );
    const positions: (number | undefined)[] = [];
    const onResize = () => positions.push(result.current.menuPositioning.getAnchorRect()?.x);
    window.addEventListener('resize', onResize);
    try {
      rerender({ chipsCount: 1 });
      expect(positions).toEqual([100]);
    } finally {
      window.removeEventListener('resize', onResize);
    }
  });
});
