import { createRef } from 'react';

import { describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';

import { OverflowTooltip } from './OverflowTooltip';
import { OverflowTooltipTrigger } from './OverflowTooltipTrigger';

describe('OverflowTooltip refs', () => {
  it('preserves the child and forwarded callback ref cleanup on unmount', () => {
    const childCleanup = rs.fn();
    const outerCleanup = rs.fn();
    const childRef = rs.fn(() => childCleanup);
    const outerRef = rs.fn(() => outerCleanup);
    const { unmount } = render(
      <OverflowTooltip>
        <OverflowTooltipTrigger ref={outerRef}>
          <span ref={childRef}>Trigger</span>
        </OverflowTooltipTrigger>
      </OverflowTooltip>,
    );
    const node = screen.getByText('Trigger');
    expect(childRef).toHaveBeenCalledWith(node);
    expect(outerRef).toHaveBeenCalledWith(node);
    unmount();
    expect(childCleanup).toHaveBeenCalledOnce();
    expect(outerCleanup).toHaveBeenCalledOnce();
  });

  it('clears the child and forwarded object refs on unmount', () => {
    const childRef = createRef<HTMLSpanElement>();
    const outerRef = createRef<HTMLElement>();
    const { unmount } = render(
      <OverflowTooltip>
        <OverflowTooltipTrigger ref={outerRef}>
          <span ref={childRef}>Trigger</span>
        </OverflowTooltipTrigger>
      </OverflowTooltip>,
    );
    expect(childRef.current).toBe(screen.getByText('Trigger'));
    expect(outerRef.current).toBe(childRef.current);
    unmount();
    expect(childRef.current).toBeNull();
    expect(outerRef.current).toBeNull();
  });
});
