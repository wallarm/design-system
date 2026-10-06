import type { ButtonHTMLAttributes, FC, MouseEvent, Ref } from 'react';
import { X } from '../../icons';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { filterDropdownClearClassName } from '../FilterDropdown/classes';
import { useFilterCascadeContext } from './FilterCascadeContext';

export interface FilterCascadeClearProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    TestableProps {
  ref?: Ref<HTMLButtonElement>;
}

/**
 * The ✕ that clears the path. `FilterCascadeTrigger` renders one on its own; pass a
 * `FilterCascadeClear` as the trigger's child to replace it (for example to add attributes).
 * Renders only while a path is picked, and hands focus back to the trigger before it disappears.
 */
export const FilterCascadeClear: FC<FilterCascadeClearProps> = ({
  ref,
  className,
  children,
  disabled,
  onClick,
  'aria-label': ariaLabel,
  'data-testid': testIdProp,
  ...props
}) => {
  const { path, label, clear, triggerRef, disabled: rootDisabled } = useFilterCascadeContext();
  const testId = useTestId('clear', testIdProp);

  if (path.length === 0) return null;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    event.stopPropagation();
    // The ✕ unmounts once the path is empty; move focus first so it is not dropped on <body>.
    triggerRef.current?.focus();
    clear();
  };

  return (
    <button
      type='button'
      {...props}
      ref={ref}
      data-slot='filter-cascade-clear'
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

FilterCascadeClear.displayName = 'FilterCascadeClear';
