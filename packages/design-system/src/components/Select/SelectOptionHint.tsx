import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';

export interface SelectOptionHintProps extends HTMLAttributes<HTMLSpanElement>, TestableProps {
  ref?: Ref<HTMLSpanElement>;
}

/**
 * Secondary text at the right end of an option, such as a count. It sits before the indicator
 * rather than under it: the option stops wrapping while a hint is present, so the label wraps
 * inside its own box and the hint keeps its place on the first line.
 */
export const SelectOptionHint: FC<SelectOptionHintProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('option-hint', testIdProp);

  return (
    <span
      {...props}
      ref={ref}
      data-slot='select-option-hint'
      data-testid={testId}
      className={cn(
        'ml-auto shrink-0 self-start font-sans text-sm text-text-secondary tabular-nums',
        className,
      )}
    />
  );
};

SelectOptionHint.displayName = 'SelectOptionHint';
