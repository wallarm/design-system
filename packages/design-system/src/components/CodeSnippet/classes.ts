import { cva } from 'class-variance-authority';

export const codeSnippetRootVariants = cva(
  [
    'relative',
    'code-snippet-bg',
    'rounded-6',
    'font-mono',
    'text-syntax-no-syntax',
    'overflow-hidden',
    'flex flex-col',
    '[&::selection]:bg-[var(--color-syntax-highlight-selected-highlight)]',
    '[&::selection]:text-[var(--color-syntax-highlight-selected-code)]',
    '[&_*::selection]:bg-[var(--color-syntax-highlight-selected-highlight)]',
    '[&_*::selection]:text-[var(--color-syntax-highlight-selected-code)]',
    '[&>[data-slot=code-snippet-actions]]:absolute [&>[data-slot=code-snippet-actions]]:right-0 [&>[data-slot=code-snippet-actions]]:top-0 [&>[data-slot=code-snippet-actions]]:z-30 [&>[data-slot=code-snippet-actions]]:p-6 [&>[data-slot=code-snippet-actions]]:rounded-br-6 [&>[data-slot=code-snippet-actions]]:rounded-tl-6',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'text-xs leading-sm',
        md: 'text-sm',
        lg: 'text-base leading-sm',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
);
