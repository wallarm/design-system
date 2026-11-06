import type { FC, HTMLAttributes } from 'react';
import { Ellipsis } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { ellipsisVariants } from './classes';

type ParameterPathEllipsisProps = HTMLAttributes<HTMLSpanElement>;

export const ParameterPathEllipsis: FC<ParameterPathEllipsisProps> = ({ className, ...rest }) => {
  const testId = useTestId('ellipsis');
  return (
    <span
      data-testid={testId}
      {...rest}
      data-slot='parameter-path-ellipsis'
      aria-label='Collapsed segments'
      className={cn(ellipsisVariants(), className)}
    >
      <Ellipsis size='sm' />
    </span>
  );
};

ParameterPathEllipsis.displayName = 'ParameterPathEllipsis';
