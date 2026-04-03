import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Children } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

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
  const testId = useTestId('footer');
  const childCount = Children.count(children);
  const justifyClass = childCount > 1 ? 'justify-between' : 'justify-end';

  return (
    <Comp
      {...props}
      ref={ref}
      data-slot='card-footer'
      data-testid={testId}
      className={cn('mt-auto flex items-center gap-12 px-16', justifyClass, className)}
    >
      {children}
    </Comp>
  );
};

CardFooter.displayName = 'CardFooter';
