import type { FC, Ref, SVGProps } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { CirclePaths } from './CirclePaths';
import { wallyIconVariants } from './classes';
import { SimplePaths } from './SimplePaths';
import type { WallyIconStyle } from './types';

type WallyIconVariantProps = VariantProps<typeof wallyIconVariants>;

export interface WallyIconProps
  extends Omit<SVGProps<SVGSVGElement>, 'style'>,
    WallyIconVariantProps {
  ref?: Ref<SVGSVGElement>;
  variant?: WallyIconStyle;
}

export const WallyIcon: FC<WallyIconProps> = ({
  ref,
  variant = 'simple',
  size = 'md',
  className,
  ...props
}) => (
  <svg
    {...props}
    ref={ref}
    data-slot='wally-icon'
    viewBox='0 0 64 64'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={cn(wallyIconVariants({ size }), 'w-auto', className)}
  >
    {variant === 'simple' && <SimplePaths />}
    {variant === 'circle' && <CirclePaths />}
  </svg>
);

WallyIcon.displayName = 'WallyIcon';
