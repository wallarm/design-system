import type { FC, ReactNode, Ref } from 'react';
import { Check, Pencil } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Loader } from '../Loader';
import { useInlineEdit } from './InlineEditContext';

export interface InlineEditPreviewIconProps {
  ref?: Ref<HTMLSpanElement>;
  /** Idle-state icon shown on hover/focus while the value is editable. Defaults to a pencil. */
  children?: ReactNode;
}

/**
 * Trailing icon area of `InlineEditPreview`: while a commit is in flight it
 * shows a spinner, right after a successful commit a success check, and
 * otherwise the idle icon (only while the field is actually editable).
 */
export const InlineEditPreviewIcon: FC<InlineEditPreviewIconProps> = ({
  ref,
  children = <Pencil size='md' />,
}) => {
  const testId = useTestId('preview-icon');
  const { status, disabled, readOnly, activationMode } = useInlineEdit();

  const isLoading = status === 'loading';
  // Mirrors InlineEditPreview's own `activatable` computation — duplicated
  // intentionally (one boolean expression) to avoid a circular import
  // between the root and this part.
  const activatable = !disabled && !readOnly && !isLoading && activationMode !== 'none';

  if (isLoading) {
    return (
      <span ref={ref} data-testid={testId} data-slot='inline-edit-preview-icon'>
        <Loader type='circle' size='md' />
      </span>
    );
  }
  if (status === 'saved') {
    return (
      <span ref={ref} data-testid={testId} data-slot='inline-edit-preview-icon'>
        <Check size='md' className='text-icon-success' />
      </span>
    );
  }
  if (!activatable) return null;

  return (
    <span
      ref={ref}
      data-testid={testId}
      data-slot='inline-edit-preview-icon'
      className='text-icon-secondary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'
    >
      {children}
    </span>
  );
};

InlineEditPreviewIcon.displayName = 'InlineEditPreviewIcon';
