import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export type CodeSnippetHeaderProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>;
};

export const CodeSnippetHeader: FC<CodeSnippetHeaderProps> = ({ className, ref, ...props }) => {
  const testId = useTestId('header');

  return (
    <div
      ref={ref}
      data-slot='code-snippet-header'
      data-testid={testId}
      className={cn('flex h-32 relative border-b border-border-primary-light', className)}
      {...props}
    />
  );
};

CodeSnippetHeader.displayName = 'CodeSnippetHeader';
