import type { FC, KeyboardEvent, LabelHTMLAttributes, PropsWithChildren, Ref } from 'react';
import { SegmentGroup } from '@ark-ui/react/segment-group';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { segmentedControlItemClassNamesBase } from './classes';

type SegmentedControlItemNativeProps = Omit<
  LabelHTMLAttributes<HTMLLabelElement>,
  'children' | 'onKeyDown'
>;

/**
 * Individual item within a SegmentedControl.
 *
 * Built on Ark UI's SegmentGroup.Item with radio input behavior and accessibility.
 * Selection state is managed by the parent SegmentedControl.
 */
export interface SegmentedControlItemProps extends SegmentedControlItemNativeProps, TestableProps {
  /** Unique value that identifies this item */
  value: string;
  /** Whether this item is disabled */
  disabled?: boolean;
  ref?: Ref<HTMLLabelElement>;
  onKeyDown?: (event: KeyboardEvent<HTMLLabelElement>) => void;
}

export const SegmentedControlItem: FC<PropsWithChildren<SegmentedControlItemProps>> = ({
  className,
  value,
  disabled,
  children,
  ref,
  onKeyDown,
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('item', testIdProp);

  const handleKeyDown = (event: KeyboardEvent<HTMLLabelElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if ((event.key === ' ' || event.key === 'Enter') && !disabled) {
      // Forward to hidden input by clicking the wrapper (which triggers Ark UI selection)
      event.currentTarget.click();
    }
  };

  return (
    <SegmentGroup.Item
      {...rest}
      ref={ref}
      value={value}
      disabled={disabled}
      data-testid={testId}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      className={cn(
        segmentedControlItemClassNamesBase,
        // Hover state, unselected
        'hover:data-[state=unchecked]:not-data-disabled:text-text-primary',
        // Selected state
        'data-[state=checked]:text-text-primary',
        className,
      )}
    >
      {children}

      <SegmentGroup.ItemControl className='absolute inset-0 opacity-0 pointer-events-none' />
      <SegmentGroup.ItemHiddenInput className='absolute inset-0 opacity-0' tabIndex={-1} />
    </SegmentGroup.Item>
  );
};

SegmentedControlItem.displayName = 'SegmentedControlItem';
