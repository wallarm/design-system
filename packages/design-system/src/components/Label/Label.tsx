import type { ComponentPropsWithoutRef, FC, Ref } from 'react';

import { Root } from '@radix-ui/react-label';
import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed',
);

export type LabelProps = ComponentPropsWithoutRef<typeof Root> & {
  ref?: Ref<HTMLLabelElement>;
};

export const Label: FC<LabelProps> = ({ className, ...props }) => (
  <Root className={cn(labelVariants(), className)} {...props} />
);
