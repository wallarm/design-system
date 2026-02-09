import type { FC } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { LoaderCircle } from './LoaderCircle';
import { LoaderSonner } from './LoaderSonner';

const loaderVariants = cva('animate-spin', {
  variants: {
    size: {
      sm: 'size-12',
      md: 'size-16',
      lg: 'size-20',
      xl: 'size-24',
      '2xl': 'size-32',
      '3xl': 'size-48',
    },
    color: {
      primary: 'text-icon-primary',
      'primary-alt': 'text-icon-primary-alt',
      'primary-alt-fixed': 'text-icon-primary-alt-fixed',
      brand: 'text-icon-brand',
      danger: 'text-icon-danger',
    },
  },
});

type LoaderType = 'circle' | 'sonner';

type LoaderVariantsProps = VariantProps<typeof loaderVariants>;

interface LoaderBaseProps {
  type?: LoaderType;
  background?: boolean;
}

export type LoaderProps = LoaderBaseProps & LoaderVariantsProps;

export const Loader: FC<LoaderProps> = ({
  type = 'circle',
  size = 'xl',
  color,
  background = true,
}) => {
  const className = cn(loaderVariants({ size, color }));

  if (type === 'sonner') {
    return <LoaderSonner className={className} data-role='spinner' />;
  }

  return <LoaderCircle className={className} background={background} data-role='spinner' />;
};

Loader.displayName = 'Loader';
