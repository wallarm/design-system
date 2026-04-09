import type { FC, ReactNode, Ref, SVGProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const iconVariants = cva('', {
  variants: {
    size: {
      inherit: 'icon-inherit',
      xs: 'icon-xs',
      sm: 'icon-sm',
      md: 'icon-md',
      lg: 'icon-lg',
      xl: 'icon-xl',
      '2xl': 'icon-2xl',
    },
  },
  defaultVariants: {
    size: 'inherit',
  },
});

type SvgIconNativeProps = SVGProps<SVGSVGElement>;

type SvgIconVariantProps = VariantProps<typeof iconVariants>;

interface SvgIconBaseProps {
  title?: string;
  children?: ReactNode;
  ref?: Ref<SVGSVGElement>;
}

export type SvgIconSize = NonNullable<SvgIconVariantProps['size']>;

export type SvgIconProps = SvgIconNativeProps & SvgIconVariantProps & SvgIconBaseProps;

export const SvgIcon: FC<SvgIconProps> = ({
  children,
  title,
  size = 'inherit',
  className,
  ref,
  ...props
}) => {
  const isDecorative = !title;

  return (
    <svg
      ref={ref}
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden={isDecorative}
      focusable={false}
      {...(title && { role: 'img' })}
      {...props}
      className={cn(iconVariants({ size }), className)}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
};

SvgIcon.displayName = 'SvgIcon';
