import type { ComponentRef, FC, Ref } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Separator, type SeparatorProps } from '../Separator';

const segmentedControlSeparatorVariants = cva('flex h-16', {
  variants: {
    mx: {
      1: 'mx-1',
      2: 'mx-2',
      4: 'mx-4',
      6: 'mx-6',
      8: 'mx-8',
      12: 'mx-12',
      16: 'mx-16',
      20: 'mx-20',
      24: 'mx-24',
      28: 'mx-28',
      32: 'mx-32',
      36: 'mx-36',
      40: 'mx-40',
      44: 'mx-44',
      48: 'mx-48',
      56: 'mx-56',
      64: 'mx-64',
      80: 'mx-80',
      96: 'mx-96',
      112: 'mx-112',
      128: 'mx-128',
      144: 'mx-144',
    },
  },
});

type SegmentedControlSeparatorVariants = VariantProps<typeof segmentedControlSeparatorVariants>;

/**
 * Visual separator component for SegmentedControl.
 *
 * Used to create visual separation between groups of items,
 * typically before a "More" button or to group related items.
 */
interface SegmentedControlSeparatorBaseProps extends SeparatorProps {
  className?: string;
  ref?: Ref<ComponentRef<typeof Separator>>;
}

export type SegmentedControlSeparatorProps = SegmentedControlSeparatorBaseProps &
  SegmentedControlSeparatorVariants;

export const SegmentedControlSeparator: FC<SegmentedControlSeparatorProps> = ({
  className,
  mx = 2,
  ref,
  ...props
}) => {
  return (
    <div className={cn('flex items-center content-stretch relative shrink-0', className)}>
      <div className={cn(segmentedControlSeparatorVariants({ mx }))}>
        <Separator ref={ref} orientation='vertical' {...props} />
      </div>
    </div>
  );
};

SegmentedControlSeparator.displayName = 'SegmentedControlSeparator';
