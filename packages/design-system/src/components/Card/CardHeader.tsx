import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  asChild?: boolean;
  children?: ReactNode;
}

export const CardHeader: FC<CardHeaderProps> = ({
  ref,
  asChild = false,
  className,
  children,
  ...props
}) => {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      {...props}
      ref={ref}
      data-slot='card-header'
      className={cn('flex items-center justify-between gap-8 px-16', className)}
    >
      {children}
    </Comp>
  );
};

CardHeader.displayName = 'CardHeader';
