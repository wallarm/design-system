import type { FC, HTMLAttributes, PropsWithChildren, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const textVariants = cva('font-sans-display break-words', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-md',
      lg: 'text-base',
      xl: 'text-lg leading-xl',
    },
    weight: {
      light: 'font-light',
      regular: 'font-normal',
      medium: 'font-medium',
      bold: 'font-bold',
    },
    color: {
      primary: 'text-text-primary',
      'primary-alt': 'text-text-primary-alt',
      secondary: 'text-text-secondary',
      'secondary-alt': 'text-text-secondary-alt',
      danger: 'text-text-danger',
      inherit: 'text-inherit',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    grow: {
      true: 'flex-1 w-full',
    },
    truncate: {
      true: 'truncate',
      false: 'whitespace-pre-wrap',
    },
  },
});

type TextNativeProps = Omit<HTMLAttributes<HTMLParagraphElement>, 'className' | 'color'>;

type TextVariantProps = VariantProps<typeof textVariants>;

interface TextBaseProps {
  asChild?: boolean;
  lineClamp?: number;
  ref?: Ref<HTMLHeadingElement>;
}

export type TextProps = TextNativeProps & TextVariantProps & TextBaseProps;

export const Text: FC<PropsWithChildren<TextProps>> = ({
  size = 'lg',
  weight = 'regular',
  color = 'inherit',
  truncate = false,
  asChild = false,
  grow = false,
  align,
  lineClamp,
  ...props
}) => {
  const Comp = asChild ? Slot : 'p';
  const lineClampClass = lineClamp ? `line-clamp-${lineClamp}` : '';

  return (
    <Comp
      {...props}
      className={cn(textVariants({ size, weight, color, truncate, align, grow }), lineClampClass)}
    />
  );
};

Text.displayName = 'Text';
