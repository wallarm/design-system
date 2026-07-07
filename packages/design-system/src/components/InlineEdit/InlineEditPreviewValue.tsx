import type { FC, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useInlineEdit } from './InlineEditContext';

// Literal classes so Tailwind can statically detect them.
const LINE_CLAMP_CLASS: Record<number, string> = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
  5: 'line-clamp-5',
  6: 'line-clamp-6',
};

export interface InlineEditPreviewValueProps {
  ref?: Ref<HTMLSpanElement>;
  /**
   * Clamp the read-mode value to this many lines (with an ellipsis) instead of
   * the default single-line truncation. Use for multi-line values (textarea).
   */
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6;
  children?: ReactNode;
}

export const InlineEditPreviewValue: FC<InlineEditPreviewValueProps> = ({
  ref,
  lineClamp,
  children,
}) => {
  const testId = useTestId('preview-value');
  const { status } = useInlineEdit();

  return (
    <span
      ref={ref}
      data-testid={testId}
      data-slot='inline-edit-preview-value'
      className={cn(
        'min-w-0 flex-1',
        lineClamp ? LINE_CLAMP_CLASS[lineClamp] : 'truncate',
        status === 'loading' && 'opacity-50',
      )}
    >
      {children}
    </span>
  );
};

InlineEditPreviewValue.displayName = 'InlineEditPreviewValue';
