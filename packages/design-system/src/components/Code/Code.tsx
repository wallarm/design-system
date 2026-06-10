import type { FC, HTMLAttributes, PropsWithChildren, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';

const codeVariants = cva('font-mono', {
  variants: {
    size: {
      xs: 'text-2xs leading-2xs',
      s: 'text-xs leading-xs',
      m: 'text-sm leading-sm',
      l: 'text-base leading-sm',
    },
    weight: {
      light: 'font-light',
      regular: 'font-normal',
      medium: 'font-medium',
      bold: 'font-bold',
    },
    color: {
      primary: 'text-text-primary',
      secondary: 'text-text-secondary',
      destructive: 'text-text-danger',
    },
    italic: {
      true: 'italic',
      false: 'not-italic',
    },
    truncate: {
      true: 'truncate',
    },
  },
  defaultVariants: {
    italic: false,
  },
});

type CodeNativeProps = HTMLAttributes<HTMLParagraphElement>;

type CodeVariantProps = VariantProps<typeof codeVariants>;

interface CodeBaseProps {
  asChild?: boolean;
  lineClamp?: number;
  ref?: Ref<HTMLParagraphElement>;
}

export type CodeProps = CodeNativeProps & CodeVariantProps & CodeBaseProps & TestableProps;

export const Code: FC<PropsWithChildren<CodeProps>> = ({
  size = 'l',
  weight = 'regular',
  color = 'primary',
  italic = false,
  asChild = false,
  truncate = false,
  lineClamp,
  className,
  ...props
}) => {
  const Comp = asChild ? Slot : 'p';

  return (
    <Comp
      {...props}
      className={cn(
        codeVariants({ size, weight, color, italic, truncate }),
        lineClamp && `line-clamp-${lineClamp}`,
        className,
      )}
    />
  );
};

Code.displayName = 'Code';
