import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  asChild?: boolean;
  children?: ReactNode;
}

export const CardFooter: FC<CardFooterProps> = ({
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
      data-slot='card-footer'
      className={cn('mt-auto flex items-center justify-end gap-8 px-16', className)}
    >
      {children}
    </Comp>
  );
};

CardFooter.displayName = 'CardFooter';
