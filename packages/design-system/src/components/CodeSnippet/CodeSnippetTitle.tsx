import type { FC, HTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export type CodeSnippetTitleProps = HTMLAttributes<HTMLSpanElement> & {
  ref?: Ref<HTMLSpanElement>;
};

export const CodeSnippetTitle: FC<CodeSnippetTitleProps> = ({ className, ref, ...props }) => {
  const testId = useTestId('title');

  return (
    <span
      ref={ref}
      data-slot='code-snippet-title'
      data-testid={testId}
      className={cn(
        'inline-flex items-center px-12 font-sans text-xs font-medium text-text-primary',
        className,
      )}
      {...props}
    />
  );
};

CodeSnippetTitle.displayName = 'CodeSnippetTitle';
