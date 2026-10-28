import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';

import { CircleDashed } from '../../icons';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { chainOfThoughtIconVariants, chainOfThoughtLabelVariants } from '../ChainOfThought/classes';
import { assistantMessageLoaderVariants } from './classes';

export interface AssistantMessageLoaderProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Default 'Working...'. */
  children?: ReactNode;
}

/**
 * The "Working..." row shown before the first output: a dashed circle and a shimmering label
 * (static under reduced motion), announced as `role='status'`. Inside a cascade its test id is
 * `<base>--loader`.
 */
export const AssistantMessageLoader: FC<AssistantMessageLoaderProps> = ({
  ref,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('loader', testIdProp);

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- This live progress announcement preserves the public div ref and is not a form calculation output.
      role='status'
      {...props}
      ref={ref}
      data-slot='assistant-message-loader'
      data-testid={testId}
      className={cn(assistantMessageLoaderVariants(), className)}
    >
      <span aria-hidden className={chainOfThoughtIconVariants()}>
        <CircleDashed />
      </span>
      <span className={chainOfThoughtLabelVariants({ status: 'running' })}>
        {children ?? 'Working...'}
      </span>
    </div>
  );
};

AssistantMessageLoader.displayName = 'AssistantMessageLoader';
