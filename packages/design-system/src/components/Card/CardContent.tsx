import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  asChild?: boolean;
  children?: ReactNode;
}

export const CardContent: FC<CardContentProps> = ({
  ref,
  asChild = false,
  className,
  children,
  ...props
}) => {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp {...props} ref={ref} data-slot='card-content' className={cn('px-16 text-md', className)}>
      {children}
    </Comp>
  );
};

CardContent.displayName = 'CardContent';
