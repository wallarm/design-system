import type { FC, HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../../utils/cn';

export type CodeContentProps = HTMLAttributes<HTMLPreElement> & {
  wrapLines: boolean;
  children: ReactNode;
};

/** Renders the code container */
export const CodeContent: FC<CodeContentProps> = ({ wrapLines, className, children, ...props }) => (
  <pre
    data-slot='code-snippet-code'
    className={cn('min-w-0 flex-1', wrapLines && 'break-all whitespace-pre-wrap', className)}
    {...props}
  >
    <code>{children}</code>
  </pre>
);
