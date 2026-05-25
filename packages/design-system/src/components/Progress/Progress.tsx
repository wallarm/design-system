import type { FC, Ref } from 'react';
import { Progress as ArkUiProgress } from '@ark-ui/react/progress';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import { progressRangeVariants, progressTrackVariants } from './classes';
import type { ProgressColor, ProgressSize } from './types';

export interface ProgressProps extends TestableProps {
  /** Progress value (0–max). Pass `null` for indeterminate state. */
  value?: number | null;
  min?: number;
  max?: number;
  size?: ProgressSize;
  color?: ProgressColor;
  showLabel?: boolean;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export const Progress: FC<ProgressProps> = ({
  value,
  min = 0,
  max = 100,
  size = 'xs',
  color = 'brand',
  showLabel = false,
  className,
  'data-testid': testId,
  ref,
}) => {
  return (
    <ArkUiProgress.Root
      ref={ref}
      value={value}
      defaultValue={value}
      min={min}
      max={max}
      data-slot='progress'
      data-testid={testId}
      className={cn('flex items-center gap-8 min-w-118 w-full', className)}
    >
      <ArkUiProgress.Track
        data-slot='progress-track'
        className={progressTrackVariants({ size, color })}
      >
        <ArkUiProgress.Range
          data-slot='progress-range'
          className={progressRangeVariants({ size, color })}
        />
      </ArkUiProgress.Track>
      {showLabel && (
        <ArkUiProgress.ValueText
          data-slot='progress-label'
          className='text-text-secondary font-sans-display text-xs font-medium tabular-nums'
        />
      )}
    </ArkUiProgress.Root>
  );
};

Progress.displayName = 'Progress';
