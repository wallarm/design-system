import type { FC, Ref } from 'react';

import { DatePicker } from '@ark-ui/react';

import { Button, type ButtonProps } from '../Button';

export interface CalendarApplyButtonProps extends Omit<ButtonProps, 'onClick'> {
  /** Callback fired before closing calendar */
  onClick?: () => void;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Apply button for the calendar footer.
 * Calls onClick, then closes the calendar.
 */
export const CalendarApplyButton: FC<CalendarApplyButtonProps> = ({
  ref,
  onClick,
  children = 'Apply',
  variant = 'primary',
  color = 'brand',
  size = 'small',
  ...props
}) => (
  <DatePicker.Context>
    {api => (
      <Button
        ref={ref}
        variant={variant}
        color={color}
        size={size}
        onClick={() => {
          onClick?.();
          api.setOpen(false);
        }}
        {...props}
      >
        {children}
      </Button>
    )}
  </DatePicker.Context>
);

CalendarApplyButton.displayName = 'CalendarApplyButton';
