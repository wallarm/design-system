import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { chartActionsVariants } from './classes';

export interface ChartActionsProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /**
   * Keep actions visible regardless of card hover/focus.
   * Defaults to `false` — the block fades in on card hover/focus-within.
   */
  alwaysVisible?: boolean;
}

export const ChartActions: FC<ChartActionsProps> = ({
  alwaysVisible = false,
  className,
  ref,
  ...props
}) => {
  const testId = useTestId('actions');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='chart-actions'
      data-testid={testId}
      className={cn(chartActionsVariants({ alwaysVisible }), className)}
    />
  );
};

ChartActions.displayName = 'ChartActions';
