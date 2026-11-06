import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { listIconVariants } from './classes';

export interface ListIconProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  children: ReactNode;
}

export const ListIcon: FC<ListIconProps> = ({ ref, className, children, ...props }) => {
  const testId = useTestId('icon');

  return (
    <span
      data-testid={testId}
      {...props}
      ref={ref}
      data-slot='list-icon'
      className={cn(listIconVariants(), className)}
    >
      {children}
    </span>
  );
};

ListIcon.displayName = 'ListIcon';
