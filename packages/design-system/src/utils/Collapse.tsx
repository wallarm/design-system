import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from './cn';

export interface CollapseProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Whether the content is expanded. */
  open: boolean;
  children?: ReactNode;
  /**
   * Mark the collapsed content `inert` so hidden focusable elements are removed
   * from tab and accessibility order while closed.
   */
  inertWhenClosed?: boolean;
}

/**
 * Smoothly expands/collapses its content via a `grid-template-rows` transition
 * (0fr ↔ 1fr) with an inner `overflow-hidden` wrapper. Shared by Tree and
 * TreeView so the collapse animation lives in one place.
 */
export const Collapse: FC<CollapseProps> = ({
  ref,
  open,
  children,
  className,
  inertWhenClosed = false,
  ...props
}) => (
  <div
    ref={ref}
    data-state={open ? 'open' : 'closed'}
    className={cn(
      'grid transition-[grid-template-rows] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',
      open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
      className,
    )}
    {...props}
  >
    <div className='overflow-hidden' inert={inertWhenClosed && !open ? true : undefined}>
      {children}
    </div>
  </div>
);

Collapse.displayName = 'Collapse';
