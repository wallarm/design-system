import type { FC, HTMLAttributes, Ref } from 'react';
import { Fragment, useMemo } from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

import { getValidChildren } from './utils';

const stackVariants = cva('flex flex-1 w-full', {
  variants: {
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
    spacing: {
      0: '',
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
  },
});

type StackNativeProps = Omit<HTMLAttributes<HTMLDivElement>, 'className'>;

type StackVariantProps = VariantProps<typeof stackVariants>;

export type StackProps = StackNativeProps &
  StackVariantProps & {
    ref?: Ref<HTMLDivElement>;
    asChild?: boolean;
  };

export const Stack: FC<StackProps> = ({
  direction = 'column',
  align = 'stretch',
  justify = 'start',
  wrap = 'nowrap',
  spacing = 4,
  asChild = false,
  children,
  ...props
}) => {
  const clones = useMemo(
    () =>
      getValidChildren(children).map((child, index) => {
        const key = typeof child.key !== 'undefined' ? child.key : index;

        return <Fragment key={key}>{child}</Fragment>;
      }),
    [children],
  );

  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      {...props}
      className={cn(
        stackVariants({
          direction,
          align,
          justify,
          wrap,
          spacing,
        }),
      )}
    >
      {clones}
    </Comp>
  );
};

Stack.displayName = 'Stack';
