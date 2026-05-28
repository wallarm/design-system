import type { FC, Ref, SVGProps } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { logoVariants } from './classes';
import { LogoIconPath } from './IconPath';
import type { LogoStyle, LogoType } from './types';
import { LogoWordmarkPath } from './WordmarkPath';

type LogoVariantProps = VariantProps<typeof logoVariants>;

export interface LogoProps extends Omit<SVGProps<SVGSVGElement>, 'type'>, LogoVariantProps {
  ref?: Ref<SVGSVGElement>;
  type?: LogoType;
  color?: LogoStyle;
}

const VIEW_BOXES: Record<LogoType, string> = {
  icon: '0 0 34 20',
  wordmark: '0 0 75 20',
  full: '0 0 118 20',
};

const MARK_COLOR: Record<LogoStyle, string> = {
  default: 'text-[var(--color-component-logo-ic)]',
  white: 'text-[var(--color-component-logo-ic)]',
  'full-white': 'text-white',
};

const WORDMARK_COLOR: Record<LogoStyle, string> = {
  default: 'text-[var(--color-component-logo-wordmark)]',
  white: 'text-white',
  'full-white': 'text-white',
};

export const Logo: FC<LogoProps> = ({
  ref,
  type = 'full',
  color = 'default',
  size = 'lg',
  className,
  ...props
}) => (
  <svg
    {...props}
    ref={ref}
    data-slot='logo'
    viewBox={VIEW_BOXES[type]}
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={cn(logoVariants({ size }), 'w-auto', className)}
  >
    {(type === 'icon' || type === 'full') && (
      <g className={MARK_COLOR[color]}>
        <LogoIconPath />
      </g>
    )}

    {(type === 'wordmark' || type === 'full') && (
      <g
        className={WORDMARK_COLOR[color]}
        transform={type === 'full' ? 'translate(44, 0)' : undefined}
      >
        <LogoWordmarkPath />
      </g>
    )}
  </svg>
);

Logo.displayName = 'Logo';
