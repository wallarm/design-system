import type { FC, HTMLAttributes, MouseEvent, PropsWithChildren, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { isIconOnly } from '../../utils/isIconOnly';
import { badgeVariants } from './classes';

type BadgeNativeProps = HTMLAttributes<HTMLDivElement>;

type BadgeVariantProps = VariantProps<typeof badgeVariants>;

interface BadgeBaseProps {
  ref?: Ref<HTMLDivElement>;
  asChild?: boolean;
}

export type BadgeProps = BadgeNativeProps & BadgeVariantProps & BadgeBaseProps & PropsWithChildren;

export const Badge: FC<BadgeProps> = ({
  ref,
  className,
  variant = 'default',
  size = 'medium',
  type = 'solid',
  color = 'slate',
  muted = false,
  textVariant = 'default',
  asChild = false,
  children,
  onClick,
  ...props
}) => {
  const badgeClasses = cn(
    badgeVariants({
      variant,
      size,
      type,
      color,
      muted,
      textVariant,
      isIconOnly: isIconOnly(children),
    }),
    className,
  );

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onClick?.(event);
  };

  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      {...props}
      ref={ref}
      className={badgeClasses}
      data-slot='badge'
      data-type={type}
      onClick={handleClick}
    >
      {children}
    </Comp>
  );
};

Badge.displayName = 'Badge';
