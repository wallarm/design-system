import type { AnchorHTMLAttributes, FC, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { linkVariants } from './classes';

type LinkNativeProps = AnchorHTMLAttributes<HTMLAnchorElement>;

type LinkVariantsProps = VariantProps<typeof linkVariants>;

export type LinkProps = LinkNativeProps &
  LinkVariantsProps & {
    ref?: Ref<HTMLAnchorElement>;
    asChild?: boolean;
    disabled?: boolean;
  };

export const Link: FC<LinkProps> = ({
  asChild = false,
  type = 'default',
  size = 'lg',
  weight = 'regular',
  disabled = false,
  onClick,
  ...props
}) => {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      {...props}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : props.tabIndex}
      onClick={disabled ? undefined : onClick}
      className={cn(linkVariants({ type, size, weight, disabled }))}
    />
  );
};
