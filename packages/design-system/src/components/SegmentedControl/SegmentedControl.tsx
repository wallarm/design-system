import type { FC, HTMLAttributes, Ref } from 'react';
import { SegmentGroup } from '@ark-ui/react/segment-group';
import type { VariantProps } from 'class-variance-authority';
import { useControlled } from '../../hooks';
import { cn } from '../../utils/cn';
import { segmentedControlIndicatorClassNames, segmentedControlVariants } from './classes';

type SegmentedControlVariantProps = VariantProps<typeof segmentedControlVariants>;

type SegmentedControlNativeProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
>;

/**
 * SegmentedControl component for switching between different views or options.
 *
 * Built on Ark UI's SegmentGroup with radio input behavior and accessibility.
 * This is a controlled component - selection state is managed by the parent.
 */
export interface SegmentedControlBaseProps {
  /** The currently selected value */
  value?: string;
  /** The default selected value */
  defaultValue?: string;
  /** Callback function called when the selection changes */
  onChange?: (value: string) => void;
  /** Whether the segmented control should take full width and stretch items equally */
  fullWidth?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export type SegmentedControlProps = SegmentedControlNativeProps &
  SegmentedControlVariantProps &
  SegmentedControlBaseProps;

/**
 * SegmentedControl component for switching between different views or options.
 *
 * Built on Ark UI's SegmentGroup with radio input behavior and accessibility.
 * This is a controlled component - selection state is managed by the parent.
 */
export const SegmentedControl: FC<SegmentedControlProps> = ({
  className,
  fullWidth = false,
  value: valueProp,
  defaultValue,
  onChange,
  children,
  ref,
  ...props
}) => {
  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValue,
  });

  // Handle Ark UI's onValueChange and call our onChange
  const handleValueChange = ({ value }: SegmentGroup.ValueChangeDetails) => {
    if (value) {
      setValue(value);
      onChange?.(value);
    }
  };

  return (
    <SegmentGroup.Root
      ref={ref}
      value={value}
      onValueChange={handleValueChange}
      className={cn(segmentedControlVariants({ fullWidth }), className)}
      {...props}
    >
      <SegmentGroup.Indicator className={segmentedControlIndicatorClassNames} />

      {children}
    </SegmentGroup.Root>
  );
};

SegmentedControl.displayName = 'SegmentedControl';
