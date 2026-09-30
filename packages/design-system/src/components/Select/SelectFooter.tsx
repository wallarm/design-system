import type { FC, HTMLAttributes, Ref } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { selectFooterVariants } from './classes';

export type SelectFooterProps = Omit<HTMLAttributes<HTMLDivElement>, 'className'> &
  VariantProps<typeof selectFooterVariants> &
  TestableProps & {
    ref?: Ref<HTMLDivElement>;
  };

export const SelectFooter: FC<SelectFooterProps> = ({
  variant = 'default',
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('footer', testIdProp);

  return <div {...props} data-testid={testId} className={cn(selectFooterVariants({ variant }))} />;
};

SelectFooter.displayName = 'SelectFooter';
