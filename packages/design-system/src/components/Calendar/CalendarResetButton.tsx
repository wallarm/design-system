import type { FC, Ref } from 'react';
import { DatePicker } from '@ark-ui/react';
import { Button, type ButtonProps } from '../Button';

export interface CalendarResetButtonProps extends Omit<ButtonProps, 'onClick'> {
  /** Callback fired after reset (in addition to clearing value) */
  onClick?: () => void;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Reset button for the calendar footer.
 * Clears the selected value when clicked, then calls onClick.
 */
export const CalendarResetButton: FC<CalendarResetButtonProps> = ({
  ref,
  onClick,
  children = 'Reset',
  variant = 'ghost',
  color = 'neutral',
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
          api.clearValue();
          onClick?.();
        }}
        {...props}
      >
        {children}
      </Button>
    )}
  </DatePicker.Context>
);

CalendarResetButton.displayName = 'CalendarResetButton';
