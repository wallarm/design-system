import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type FieldLegendNativeProps = HTMLAttributes<HTMLLegendElement>;

interface FieldLegendBaseProps {
  variant?: 'legend' | 'label';
}

type FieldLegendProps = FieldLegendNativeProps & FieldLegendBaseProps;

export const FieldLegend: FC<FieldLegendProps> = ({ variant = 'legend', ...props }) => (
  <legend
    {...props}
    data-slot='field-legend'
    data-variant={variant}
    className={cn(
      'font-medium text-text-primary',
      'data-[variant=legend]:text-lg',
      'data-[variant=label]:text-sm',
      '[&+[data-slot=field-group]]:mt-16',
    )}
  />
);

FieldLegend.displayName = 'FieldLegend';
