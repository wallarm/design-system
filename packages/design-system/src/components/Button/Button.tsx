import type { ElementType, FC } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { ButtonBase, type ButtonBaseProps } from '../ButtonBase';

const buttonVariants = cva('', {
  variants: {
    variant: {
      primary: 'not-focus:shadow-xs',
      outline: 'not-focus:shadow-xs',
      ghost: '',
      secondary: '',
    },
    color: {
      brand:
        'focus-visible:ring-focus-brand data-[focus=true]:ring-focus-brand',
      neutral:
        'text-text-primary disabled:opacity-50 focus-visible:ring-focus-primary data-[focus=true]:ring-focus-primary',
      'neutral-alt':
        'text-text-primary-alt disabled:opacity-50 focus-visible:ring-focus-primary data-[focus=true]:ring-focus-primary',
      destructive:
        'focus-visible:ring-focus-destructive data-[focus=true]:ring-focus-destructive',
    },
  },
  compoundVariants: [
    // region --- Brand
    {
      color: 'brand',
      variant: 'primary',
      className:
        'bg-bg-fill-brand text-text-primary-alt overlay hover:not-disabled:overlay-states-on-fill-hover active:not-disabled:overlay-states-on-fill-pressed disabled:overlay-states-on-fill-disabled',
    },
    {
      color: 'brand',
      variant: 'ghost',
      className:
        'bg-transparent text-text-brand hover:not-disabled:bg-states-brand-hover active:not-disabled:bg-states-brand-pressed disabled:bg-states-brand-default-alt disabled:opacity-50',
    },
    {
      color: 'brand',
      variant: 'secondary',
      className:
        'bg-states-brand-default-alt text-text-brand hover:not-disabled:bg-states-brand-hover active:not-disabled:bg-states-brand-pressed disabled:bg-states-brand-default-alt disabled:opacity-50',
    },
    // endregion

    // region --- Neutral

    {
      color: 'neutral',
      variant: 'outline',
      className:
        'border-1 border-border-primary bg-component-outline-button-bg overlay hover:not-disabled:overlay-states-primary-hover active:not-disabled:overlay-states-primary-pressed',
    },
    {
      color: 'neutral',
      variant: 'ghost',
      className:
        'bg-transparent border-1 border-transparent hover:not-disabled:bg-states-primary-hover active:not-disabled:bg-states-primary-pressed focus-visible:border-border-primary data-[focus=true]:border-border-primary',
    },
    {
      color: 'neutral',
      variant: 'secondary',
      className:
        'bg-states-primary-default-alt hover:not-disabled:bg-states-primary-hover active:not-disabled:bg-states-primary-pressed',
    },
    // endregion

    // region --- Neutral Alt
    {
      color: 'neutral-alt',
      variant: 'outline',
      className:
        'border-1 border-border-primary bg-component-outline-button-bg overlay hover:overlay-states-primary-alt-hover active:overlay-states-primary-alt-pressed',
    },
    {
      color: 'neutral-alt',
      variant: 'ghost',
      className:
        'bg-transparent border-1 border-transparent hover:bg-states-primary-alt-hover active:bg-states-primary-alt-pressed focus-visible:border-border-primary data-[focus=true]:border-border-primary',
    },
    {
      color: 'neutral-alt',
      variant: 'secondary',
      className:
        'bg-states-primary-alt-default-alt hover:bg-states-primary-alt-hover active:bg-states-primary-alt-pressed',
    },
    // endregion

    // region --- Destructive
    {
      color: 'destructive',
      variant: 'primary',
      className:
        'bg-bg-fill-danger text-text-primary-alt overlay hover:not-disabled:overlay-states-on-fill-hover active:not-disabled:overlay-states-on-fill-pressed disabled:overlay-states-on-fill-disabled',
    },
    {
      color: 'destructive',
      variant: 'outline',
      className:
        'border-1 border-border-danger bg-component-outline-button-bg text-text-danger overlay hover:not-disabled:overlay-states-danger-hover active:not-disabled:overlay-states-danger-pressed disabled:opacity-50',
    },
    {
      color: 'destructive',
      variant: 'ghost',
      className:
        'bg-transparent text-text-danger hover:not-disabled:bg-states-danger-hover active:not-disabled:bg-states-danger-pressed disabled:bg-states-danger-default-alt disabled:opacity-50',
    },
    {
      color: 'destructive',
      variant: 'secondary',
      className:
        'bg-states-danger-default-alt text-text-danger hover:not-disabled:bg-states-danger-hover active:not-disabled:bg-states-danger-pressed disabled:opacity-50',
    },
    // endregion
  ],
});

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export type ButtonProps<C extends ElementType = 'button'> = ButtonBaseProps<C> &
  ButtonVariantProps;

export const Button: FC<ButtonProps<ElementType>> = ({
  variant = 'primary',
  color = 'brand',
  size = 'large',
  loading = false,
  disabled = false,
  asChild = false,
  as,
  ref,
  className,
  ...props
}) => {
  const isDisabled = loading || disabled;

  return (
    <ButtonBase
      {...props}
      ref={ref}
      as={as}
      className={cn(buttonVariants({ variant, color }), className)}
      size={size}
      loading={loading}
      disabled={isDisabled}
      asChild={asChild}
    />
  );
};

Button.displayName = 'Button';
