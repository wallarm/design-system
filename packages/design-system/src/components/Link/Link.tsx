import type { AnchorHTMLAttributes, FC, Ref } from 'react';

import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

import { linkVariants } from './classes';

type LinkNativeProps = AnchorHTMLAttributes<HTMLAnchorElement>;

type LinkVariantsProps = VariantProps<typeof linkVariants>;

export type LinkProps = LinkNativeProps &
  LinkVariantsProps & {
    ref?: Ref<HTMLAnchorElement>;
    asChild?: boolean;
  };

export const Link: FC<LinkProps> = ({
  asChild = false,
  type = 'default',
  size = 'lg',
  weight = 'regular',
  ...props
}) => {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp {...props} className={cn(linkVariants({ type, size, weight }))} />
  );
};
