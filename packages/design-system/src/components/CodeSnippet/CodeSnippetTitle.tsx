import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';

export type CodeSnippetTitleProps = HTMLAttributes<HTMLSpanElement> & {
  ref?: Ref<HTMLSpanElement>;
};

export const CodeSnippetTitle: FC<CodeSnippetTitleProps> = ({ className, ref, ...props }) => (
  <span
    ref={ref}
    data-slot='code-snippet-title'
    className={cn(
      'inline-flex items-center text-xs font-medium font-sans text-text-primary px-24',
      className,
    )}
    {...props}
  />
);

CodeSnippetTitle.displayName = 'CodeSnippetTitle';
