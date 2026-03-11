import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { Text } from '../Text';

export interface CardTitleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: Ref<HTMLDivElement>;
  icon?: ReactNode;
  children?: ReactNode;
}

export const CardTitle: FC<CardTitleProps> = ({ ref, icon, className, children, ...props }) => (
  <div
    {...props}
    ref={ref}
    data-slot='card-title'
    className={cn('flex items-center gap-8', className)}
  >
    {icon && <span className='shrink-0'>{icon}</span>}
    <Text size='md' weight='medium' color='primary'>
      {children}
    </Text>
  </div>
);

CardTitle.displayName = 'CardTitle';
