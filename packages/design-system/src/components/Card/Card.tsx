import type { FC, HTMLAttributes, MouseEvent, MouseEventHandler, ReactNode, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { TestIdProvider } from '../../utils/testId';
import { cardVariants } from './classes';

const INTERACTIVE_SELECTORS = 'a[href],button,input,select,textarea,[tabindex]';

type CardVariantProps = Omit<VariantProps<typeof cardVariants>, 'interactive' | 'disabled'>;

export interface CardProps extends CardVariantProps, Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  ref?: Ref<HTMLDivElement>;
  asChild?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  children?: ReactNode;
}

export const Card: FC<CardProps> = ({
  ref,
  color = 'primary',
  asChild = false,
  disabled = false,
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  const Comp = asChild ? Slot : 'div';
  const interactive = Object.keys(props).some(
    key => key.startsWith('on') && typeof props[key as keyof typeof props] === 'function',
  );

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!props.onClick) return;

    const target = e.target as HTMLElement;
    const card = e.currentTarget;

    if (target !== card && target.closest(INTERACTIVE_SELECTORS) !== card) {
      return;
    }

    props.onClick(e);
  };

  return (
    <TestIdProvider value={testId}>
      <Comp
        {...props}
        ref={ref}
        data-slot='card'
        data-testid={testId}
        tabIndex={interactive && !disabled ? 0 : undefined}
        aria-disabled={disabled || undefined}
        onClick={disabled ? undefined : handleClick}
        className={cn(cardVariants({ color, interactive, disabled }), className)}
      >
        {children}
      </Comp>
    </TestIdProvider>
  );
};

Card.displayName = 'Card';
