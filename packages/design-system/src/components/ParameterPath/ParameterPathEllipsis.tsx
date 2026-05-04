import type { FC } from 'react';
import { Ellipsis } from '../../icons';
import { cn } from '../../utils/cn';
import { ellipsisVariants } from './classes';

interface ParameterPathEllipsisProps {
  className?: string;
}

export const ParameterPathEllipsis: FC<ParameterPathEllipsisProps> = ({ className }) => (
  <span
    data-slot='parameter-path-ellipsis'
    aria-label='Collapsed segments'
    className={cn(ellipsisVariants(), className)}
  >
    <Ellipsis size='sm' />
  </span>
);

ParameterPathEllipsis.displayName = 'ParameterPathEllipsis';
