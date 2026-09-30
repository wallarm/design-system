import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { useFileUploadRootContext } from './FileUploadContext';

export type FileUploadItemActionProps = ButtonProps;

/**
 * A small ghost icon action for a row with no built-in behaviour — e.g. Download
 * (`<FileUploadItemAction aria-label='Download policy.wasm' onClick={download}><Download /></FileUploadItemAction>`).
 * Disabled with the root; stays available when read-only.
 */
export const FileUploadItemAction: FC<FileUploadItemActionProps> = ({
  disabled,
  'data-testid': testIdProp,
  ...props
}) => {
  const root = useFileUploadRootContext();
  const testId = useTestId('item-action', testIdProp);

  return (
    <Button
      variant='ghost'
      color='neutral'
      size='small'
      {...props}
      data-slot='file-upload-item-action'
      data-testid={testId}
      disabled={disabled || root?.disabled}
    />
  );
};

FileUploadItemAction.displayName = 'FileUploadItemAction';
