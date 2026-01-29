import type { FC, HTMLAttributes, PropsWithChildren, Ref } from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const codeVariants = cva('font-mono leading-sm', {
  variants: {
    size: {
      s: 'text-xs',
      m: 'text-sm',
      l: 'text-base',
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

type CodeNativeProps = Omit<HTMLAttributes<HTMLParagraphElement>, 'className'>;

type CodeVariantProps = VariantProps<typeof codeVariants>;

interface CodeBaseProps {
  asChild?: boolean;
  lineClamp?: number;
  ref?: Ref<HTMLParagraphElement>;
}

export type CodeProps = CodeNativeProps & CodeVariantProps & CodeBaseProps;

export const Code: FC<PropsWithChildren<CodeProps>> = ({
  size = 'l',
  weight = 'regular',
  color = 'primary',
  italic = false,
  asChild = false,
  truncate = false,
  lineClamp,
  ...props
}) => {
  const Comp = asChild ? Slot : 'p';

  return (
    <Comp
      {...props}
      className={cn(
        codeVariants({ size, weight, color, italic, truncate }),
        lineClamp && `line-clamp-${lineClamp}`,
      )}
    />
  );
};

Code.displayName = 'Code';
