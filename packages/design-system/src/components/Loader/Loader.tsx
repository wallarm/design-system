import type { FC } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
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

export type LoaderProps = LoaderBaseProps & LoaderVariantsProps & TestableProps;

export const Loader: FC<LoaderProps> = ({
  type = 'circle',
  size = 'xl',
  color,
  background = true,
  'data-testid': testId,
}) => {
  const className = cn(loaderVariants({ size, color }));

  if (type === 'sonner') {
    return <LoaderSonner className={className} data-role='spinner' data-testid={testId} />;
  }

  return (
    <LoaderCircle
      className={className}
      background={background}
      data-role='spinner'
      data-testid={testId}
    />
  );
};

Loader.displayName = 'Loader';
