import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';

export interface CardTitleProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  asChild?: boolean;
  children?: ReactNode;
}

export const CardTitle: FC<CardTitleProps> = ({
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
      data-slot='card-title'
      className={cn('flex items-center gap-8 text-md font-medium text-text-primary', className)}
    >
      {children}
    </Comp>
  );
};

CardTitle.displayName = 'CardTitle';
