import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';

export type CodeSnippetActionsProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>;
};

export const CodeSnippetActions: FC<CodeSnippetActionsProps> = ({ className, ref, ...props }) => (
  <div
    ref={ref}
    data-slot='code-snippet-actions'
    className={cn('flex items-center gap-4', className)}
    {...props}
  />
);

CodeSnippetActions.displayName = 'CodeSnippetActions';
