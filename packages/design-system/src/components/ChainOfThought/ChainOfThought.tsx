import type { FC, OlHTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import { chainOfThoughtVariants } from './classes';

export interface ChainOfThoughtProps extends OlHTMLAttributes<HTMLOListElement>, TestableProps {
  ref?: Ref<HTMLOListElement>;
}

/**
 * Read-only log of an agent's steps. Children must be `ChainOfThoughtStep`s —
 * each `<li>` a direct child, so the last step drops its connector.
 */
export const ChainOfThought: FC<ChainOfThoughtProps> = ({
  ref,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('chain-of-thought', testIdProp);

  return (
    <ol
      {...props}
      ref={ref}
      data-slot='chain-of-thought'
      data-testid={testId}
      role='list'
      className={cn(chainOfThoughtVariants(), className)}
    >
      <TestIdProvider value={testId}>{children}</TestIdProvider>
    </ol>
  );
};

ChainOfThought.displayName = 'ChainOfThought';
