import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export type CodeSnippetActionsProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>;
};

export const CodeSnippetActions: FC<CodeSnippetActionsProps> = ({ className, ref, ...props }) => {
  const testId = useTestId('actions');

  return (
    <div
      ref={ref}
      data-slot='code-snippet-actions'
      data-testid={testId}
      className={cn('flex items-center gap-4 ml-auto px-6 rounded-tr-6 code-snippet-bg', className)}
      {...props}
    />
  );
};

CodeSnippetActions.displayName = 'CodeSnippetActions';
