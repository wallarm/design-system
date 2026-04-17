import type { ComponentProps, FC, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { Badge } from '../../Badge';

export interface IpListOverflowBadgeProps
  extends Omit<ComponentProps<typeof Badge>, 'children' | 'type' | 'color' | 'size'> {
  ref?: Ref<HTMLDivElement>;
  count: number;
}

export const IpListOverflowBadge: FC<IpListOverflowBadgeProps> = ({
  count,
  className,
  ...props
}) => (
  <Badge
    {...props}
    type='secondary'
    color='slate'
    size='medium'
    className={cn('shrink-0', className)}
  >
    +{count}
  </Badge>
);

IpListOverflowBadge.displayName = 'IpListOverflowBadge';
