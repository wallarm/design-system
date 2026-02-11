import type { FC, ReactNode } from 'react';
import { Tabs as ArkUiTabs } from '@ark-ui/react/tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import { useControlled } from '../../hooks';
import { cn } from '../../utils/cn';

const segmentedControlVariants = cva('', {
  variants: {
    fullWidth: {
      true: 'w-full [&_[data-part=trigger]]:w-full',
      false: '',
    },
  },
  defaultVariants: {
    fullWidth: false,
  },
});

type SegmentedTabsVariantProps = VariantProps<typeof segmentedControlVariants>;

interface SegmentedTabsBaseProps {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  lazyMount?: boolean;
  unmountOnExit?: boolean;
  fullWidth?: boolean;
  onChange?: (value: string) => void;
}

type SegmentedTabsProps = SegmentedTabsVariantProps & SegmentedTabsBaseProps;

export const SegmentedTabs: FC<SegmentedTabsProps> = ({
  children,
  value: valueProp,
  defaultValue,
  onChange,
  lazyMount = true,
  unmountOnExit = true,
  fullWidth = false,
}) => {
  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValue,
  });

  const handleValueChange = ({ value }: ArkUiTabs.ValueChangeDetails) => {
    setValue(value);
    onChange?.(value);
  };

  return (
    <ArkUiTabs.Root
      className={cn(segmentedControlVariants({ fullWidth }))}
      value={value}
      defaultValue={defaultValue}
      lazyMount={lazyMount}
      unmountOnExit={unmountOnExit}
      onValueChange={handleValueChange}
    >
      {children}
    </ArkUiTabs.Root>
  );
};
