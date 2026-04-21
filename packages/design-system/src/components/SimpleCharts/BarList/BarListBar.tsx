import { type CSSProperties, type FC, type HTMLAttributes, type Ref, useContext } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import type { ChartColor } from '../types';
import { BarListItemContext } from './BarListContext';
import { barListBarVariants } from './classes';

export interface BarListBarProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /**
   * Built-in palette fill. Each colour maps to the `--color-badge-{color}-light`
   * design-system token (dark-mode aware).
   *
   * Pass a Tailwind `bg-*` utility via `className` to use any other colour — it
   * wins over the palette class through `tailwind-merge`.
   */
  color?: ChartColor;
}

export const BarListBar: FC<BarListBarProps> = ({ color, className, style, ref, ...props }) => {
  const testId = useTestId('bar');
  const itemCtx = useContext(BarListItemContext);
  const ratio = itemCtx?.ratio ?? 0;

  const mergedStyle: CSSProperties = {
    width: `calc(${ratio} * (100% - var(--spacing-16)))`,
    ...style,
  };

  return (
    <div
      {...props}
      ref={ref}
      data-slot='bar-list-bar'
      data-testid={testId}
      data-color={color ?? 'slate'}
      style={mergedStyle}
      aria-hidden='true'
      className={cn(barListBarVariants({ color }), className)}
    />
  );
};

BarListBar.displayName = 'BarListBar';
