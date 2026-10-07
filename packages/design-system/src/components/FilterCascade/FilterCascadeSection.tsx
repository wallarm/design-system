import type {
  ButtonHTMLAttributes,
  FC,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  Ref,
} from 'react';
import { Check } from '../../icons';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { dropdownMenuItemVariants } from '../DropdownMenu';
import { dropdownMenuItemIndicatorClassName } from '../DropdownMenu/classes';

export interface FilterCascadeSectionProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
}

/**
 * Rows at the bottom of the top-level panel that are not part of the path — «Show organization
 * policies» — under a divider.
 */
export const FilterCascadeSection: FC<FilterCascadeSectionProps> = ({
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('section', testIdProp);
  return (
    <div
      role='group'
      {...props}
      data-slot='filter-cascade-section'
      data-testid={testId}
      className={cn(
        // The divider is the `DropdownMenuSeparator` line.
        'flex flex-col gap-1 before:mx-8 before:my-4 before:h-px before:bg-border-primary',
        className,
      )}
    />
  );
};

FilterCascadeSection.displayName = 'FilterCascadeSection';

export interface FilterCascadeCheckboxItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>,
    TestableProps {
  ref?: Ref<HTMLButtonElement>;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Before the label, in the options' 16px icon slot — a status dot. */
  icon?: ReactNode;
}

/** A toggle row in a `FilterCascadeSection`. The menu stays open; ✓ at the end when on. */
export const FilterCascadeCheckboxItem: FC<FilterCascadeCheckboxItemProps> = ({
  checked,
  onCheckedChange,
  onClick,
  onKeyDown,
  icon,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('checkbox-item', testIdProp);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) onCheckedChange?.(!checked);
  };

  // Enter and Space toggle this row; they must not reach the cascade, which would pick the
  // highlighted option.
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.key === 'Enter' || event.key === ' ') event.stopPropagation();
  };

  return (
    <button
      type='button'
      role='menuitemcheckbox'
      aria-checked={checked}
      {...props}
      data-slot='filter-cascade-checkbox-item'
      data-testid={testId}
      data-state={checked ? 'checked' : 'unchecked'}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        dropdownMenuItemVariants({ variant: 'default' }),
        'w-full text-left focus-visible:bg-states-primary-hover',
        // Figma: a row that is on reads as picked.
        'data-[state=checked]:bg-states-primary-active',
        className,
      )}
    >
      {icon && <span className='flex h-20 w-16 shrink-0 items-center justify-center'>{icon}</span>}
      <span className='min-w-0 flex-1 truncate'>{children}</span>
      <span className={dropdownMenuItemIndicatorClassName}>{checked && <Check />}</span>
    </button>
  );
};

FilterCascadeCheckboxItem.displayName = 'FilterCascadeCheckboxItem';
