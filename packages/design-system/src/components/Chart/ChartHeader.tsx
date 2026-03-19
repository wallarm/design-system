import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';

export interface ChartHeaderProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  title: string;
  action?: ReactNode;
  filterLabel?: string;
  onRemoveFilter?: () => void;
}

export const ChartHeader: FC<ChartHeaderProps> = ({
  ref,
  title,
  action,
  filterLabel,
  onRemoveFilter,
  className,
  ...props
}) => {
  const testId = useTestId('header');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='chart-header'
      data-testid={testId}
      className={cn('flex h-32 items-center justify-between px-12', className)}
    >
      <Text asChild size='xs' weight='medium' color='primary'>
        <span>{title}</span>
      </Text>
      {filterLabel ? (
        <button
          type='button'
          onClick={onRemoveFilter}
          className='cursor-pointer font-sans text-xs font-medium text-text-brand hover:underline'
        >
          {filterLabel}
        </button>
      ) : (
        action && (
          <div className='opacity-0 transition-opacity group-hover:opacity-100'>{action}</div>
        )
      )}
    </div>
  );
};

ChartHeader.displayName = 'ChartHeader';
