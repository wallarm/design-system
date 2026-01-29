import type {
  FC,
  HTMLAttributes,
  MouseEvent,
  PropsWithChildren,
  Ref,
} from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { type BadgeProps, badgeVariants } from '../Badge';

const tagVariants = cva(
  cn(
    'inline-flex items-center',
    'rounded-8 border border-border-primary overlay',
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
    'transition-colors cursor-pointer select-none',

    // TagClose
    '[&_[data-slot=tag-close]]:cursor-pointer',
  ),
  {
    variants: {
      disabled: {
        true: 'opacity-50 cursor-not-allowed pointer-events-none',
        false:
          'hover:overlay-states-primary-hover active:overlay-states-primary-pressed focus-visible:overlay-states-primary-hover',
      },
    },
  },
);

type TagNativeProps = Omit<HTMLAttributes<HTMLDivElement>, 'className'>;

type TagVariantProps = VariantProps<typeof tagVariants>;

interface TagBaseProps {
  size?: BadgeProps['size'];
  disabled?: boolean;
  asChild?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export type TagProps = TagNativeProps &
  TagVariantProps &
  TagBaseProps &
  PropsWithChildren;

export const Tag: FC<TagProps> = ({
  size = 'medium',
  disabled = false,
  asChild = false,
  children,
  onClick,
  ...props
}) => {
  const Comp = asChild ? Slot : 'div';

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onClick?.(event);
  };
  return (
    <Comp
      {...props}
      className={cn(
        tagVariants({ disabled }),
        badgeVariants({
          color: 'slate',
          type: 'secondary',
          textVariant: 'default',
          muted: false,
          size,
        }),
      )}
      data-slot="tag"
      data-disabled={disabled ? 'true' : undefined}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
    >
      {children}
    </Comp>
  );
};

Tag.displayName = 'Tag';
