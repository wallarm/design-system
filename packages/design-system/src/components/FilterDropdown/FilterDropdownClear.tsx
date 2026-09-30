import type { ButtonHTMLAttributes, FC, MouseEvent, Ref } from 'react';
import { X } from '../../icons';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { filterDropdownClearClassName } from './classes';
import { useFilterDropdownContext } from './FilterDropdownContext';

export interface FilterDropdownClearProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    TestableProps {
  ref?: Ref<HTMLButtonElement>;
}

/**
 * The ✕ that clears a multi filter. `FilterDropdownTrigger` renders one on its own; pass a
 * `FilterDropdownClear` as the trigger's child to replace it (for example to add attributes).
 * Renders only in multi mode while something is picked, and hands focus back to the trigger
 * before it disappears.
 */
export const FilterDropdownClear: FC<FilterDropdownClearProps> = ({
  ref,
  className,
  children,
  disabled,
  onClick,
  'aria-label': ariaLabel,
  'data-testid': testIdProp,
  ...props
}) => {
  const {
    multiple,
    value,
    label,
    clear,
    triggerRef,
    disabled: rootDisabled,
  } = useFilterDropdownContext();
  const testId = useTestId('clear', testIdProp);

  if (!multiple || value.length === 0) return null;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    // The ✕ unmounts once the value is empty; move focus first so it is not dropped on <body>.
    triggerRef.current?.focus();
    clear();
  };

  return (
    <button
      type='button'
      {...props}
      ref={ref}
      data-slot='filter-dropdown-clear'
      data-testid={testId}
      aria-label={ariaLabel ?? `Clear ${label}`}
      // A disabled root always wins; the ✕ can still be disabled on its own.
      disabled={rootDisabled || disabled}
      onClick={handleClick}
      className={cn(filterDropdownClearClassName, className)}
    >
      {children ?? <X size='md' />}
    </button>
  );
};

FilterDropdownClear.displayName = 'FilterDropdownClear';
