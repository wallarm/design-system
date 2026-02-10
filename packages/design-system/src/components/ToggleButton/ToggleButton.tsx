import type { FC, MouseEvent, Ref } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useControlled } from '../../hooks';
import { ButtonBase, type ButtonBaseProps } from '../ButtonBase';

const toggleButtonVariants = cva('disabled:opacity-50', {
  variants: {
    variant: {
      outline: 'border-1 disabled:opacity-50 not-focus:shadow-xs',
      ghost: 'bg-transparent border-1 border-transparent',
    },
    color: {
      brand: '',
      neutral: 'focus-visible:ring-focus-primary data-[focus=true]:ring-focus-primary',
    },
    active: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    // region --- Neutral
    {
      color: 'neutral',
      variant: 'outline',
      active: false,
      className:
        'border-1 border-border-primary bg-component-outline-button-bg overlay hover:overlay-states-primary-hover active:overlay-states-primary-pressed',
    },
    {
      color: 'neutral',
      variant: 'outline',
      active: true,
      className:
        'border-border-primary bg-component-outline-button-bg overlay overlay-states-primary-active text-text-primary hover:overlay-states-primary-hover active:overlay-states-primary-pressed',
    },
    {
      color: 'neutral',
      variant: 'ghost',
      active: false,
      className:
        'bg-transparent border-1 border-transparent hover:bg-states-primary-hover active:bg-states-primary-pressed focus-visible:border-border-primary focus-visible:bg-component-outline-button-bg data-[focus=true]:border-border-primary data-[focus=true]:bg-component-outline-button-bg',
    },
    {
      color: 'neutral',
      variant: 'ghost',
      active: true,
      className:
        'overlay bg-states-primary-active text-text-primary hover:bg-states-primary-hover active:bg-states-primary-pressed',
    },
    // endregion

    // region --- Brand
    {
      color: 'brand',
      variant: 'outline',
      active: false,
      className:
        'border-border-primary bg-component-outline-button-bg overlay text-text-primary hover:overlay-states-primary-hover active:overlay-states-primary-pressed focus-visible:ring-focus-primary data-[focus=true]:ring-focus-primary',
    },
    {
      color: 'brand',
      variant: 'outline',
      active: true,
      className:
        'border-border-brand bg-component-outline-button-bg overlay overlay-states-brand-active text-text-brand hover:overlay-states-brand-hover active:overlay-states-brand-pressed focus-visible:ring-focus-brand data-[focus=true]:ring-focus-brand',
    },
    {
      color: 'brand',
      variant: 'ghost',
      active: false,
      className:
        'hover:bg-states-primary-hover active:bg-states-primary-pressed focus-visible:border-border-primary focus-visible:ring-focus-primary focus-visible:bg-component-outline-button-bg data-[focus=true]:border-border-primary data-[focus=true]:ring-focus-primary data-[focus=true]:bg-component-outline-button-bg',
    },
    {
      color: 'brand',
      variant: 'ghost',
      active: true,
      className:
        'bg-states-brand-active overlay text-text-brand hover:bg-states-brand-hover active:bg-states-brand-pressed disabled:bg-states-brand-default-alt focus-visible:ring-focus-brand data-[focus=true]:ring-focus-brand',
    },
    // endregion
  ],
});

type ToggleButtonVariantProps = VariantProps<typeof toggleButtonVariants>;

export type ToggleButtonProps = Omit<Omit<ButtonBaseProps, 'onToggle'>, 'onClick'> &
  ToggleButtonVariantProps & {
    ref?: Ref<HTMLButtonElement>;
    defaultValue?: boolean;
    onToggle?: (active: boolean, event: MouseEvent<HTMLButtonElement>) => void;
  };

export const ToggleButton: FC<ToggleButtonProps> = ({
  variant = 'outline',
  color = 'brand',
  size = 'large',
  active: activeProp,
  defaultValue = false,
  loading = false,
  disabled = false,
  asChild = false,
  onToggle,
  ...props
}) => {
  const isDisabled = loading || disabled;

  const [active, setActiveUncontrolled] = useControlled({
    controlled: activeProp,
    default: defaultValue,
  });

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    const nextValue = !active;
    setActiveUncontrolled(nextValue);
    onToggle?.(nextValue, event);
  };

  return (
    <ButtonBase
      {...props}
      className={toggleButtonVariants({ variant, color, active })}
      size={size}
      loading={loading}
      disabled={isDisabled}
      asChild={asChild}
      onClick={handleToggle}
    />
  );
};

ToggleButton.displayName = 'ToggleButton';
