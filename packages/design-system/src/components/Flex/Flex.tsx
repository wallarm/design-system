import type { FC, HTMLAttributes, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const flexVariants = cva('', {
  variants: {
    inline: {
      true: 'inline-flex',
      false: 'flex',
    },
    direction: {
      row: 'flex-row',
      column: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'column-reverse': 'flex-col-reverse',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    wrap: {
      wrap: 'flex-wrap',
      nowrap: 'flex-nowrap',
      reverse: 'flex-wrap-reverse',
    },
    gap: {
      1: 'gap-1',
      2: 'gap-2',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8',
      12: 'gap-12',
      16: 'gap-16',
      20: 'gap-20',
      24: 'gap-24',
      28: 'gap-28',
      32: 'gap-32',
      36: 'gap-36',
      40: 'gap-40',
      44: 'gap-44',
      48: 'gap-48',
      56: 'gap-56',
      64: 'gap-64',
      80: 'gap-80',
      96: 'gap-96',
      112: 'gap-112',
      128: 'gap-128',
      144: 'gap-144',
    },
    grow: {
      true: 'flex-grow',
      false: 'flex-grow-0',
    },
    shrink: {
      true: 'flex-shrink',
      false: 'flex-shrink-0',
    },
    fullWidth: {
      true: 'w-full',
    },
    basis: {
      auto: 'basis-auto',
      full: 'basis-full',
      '1/2': 'basis-1/2',
      '1/3': 'basis-1/3',
      '2/3': 'basis-2/3',
      '1/4': 'basis-1/4',
      '2/4': 'basis-2/4',
      '3/4': 'basis-3/4',
      '1/5': 'basis-1/5',
      '2/5': 'basis-2/5',
      '3/5': 'basis-3/5',
      '4/5': 'basis-4/5',
      '1/6': 'basis-1/6',
      '2/6': 'basis-2/6',
      '3/6': 'basis-3/6',
      '4/6': 'basis-4/6',
      '5/6': 'basis-5/6',
      '1/12': 'basis-1/12',
      '2/12': 'basis-2/12',
      '3/12': 'basis-3/12',
      '4/12': 'basis-4/12',
      '5/12': 'basis-5/12',
      '6/12': 'basis-6/12',
      '7/12': 'basis-7/12',
      '8/12': 'basis-8/12',
      '9/12': 'basis-9/12',
      '10/12': 'basis-10/12',
      '11/12': 'basis-11/12',
      0: 'basis-0',
    },
  },
});

type FlexNativeProps = Omit<HTMLAttributes<HTMLDivElement>, 'className'>;

type FlexVariantProps = VariantProps<typeof flexVariants>;

export type FlexProps = FlexNativeProps &
  FlexVariantProps & {
    ref?: Ref<HTMLDivElement>;
    asChild?: boolean;
  };

export const Flex: FC<FlexProps> = ({
  inline = false,
  direction = 'row',
  align = 'stretch',
  justify = 'start',
  wrap = 'nowrap',
  gap,
  grow,
  shrink,
  basis,
  fullWidth,
  asChild = false,
  children,
  ...props
}) => {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      className={cn(
        flexVariants({
          inline,
          direction,
          align,
          justify,
          wrap,
          gap,
          grow,
          shrink,
          basis,
          fullWidth,
        }),
      )}
      {...props}
    >
      {children}
    </Comp>
  );
};

Flex.displayName = 'Flex';
