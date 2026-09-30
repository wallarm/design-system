import { type ChangeEvent, type FC, type MouseEvent, useRef } from 'react';
import { RefreshCcw } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { useRequiredFileUploadRootContext } from './FileUploadContext';
import { useRequiredFileUploadItemContext } from './FileUploadItemContext';
import { checkFile } from './lib';

export type FileUploadItemReplaceTriggerProps = ButtonProps;

/**
 * Refresh — swap this file for another. Single mode reopens the picker (the new file
 * replaces the old). Multiple mode replaces just this row, in place; an invalid
 * replacement keeps the original and shows the rejection. Hidden while read-only or
 * while the row is loading.
 */
export const FileUploadItemReplaceTrigger: FC<FileUploadItemReplaceTriggerProps> = ({
  children,
  onClick,
  disabled,
  'aria-label': ariaLabel,
  'data-testid': testIdProp,
  ...props
}) => {
  const root = useRequiredFileUploadRootContext('FileUploadItemReplaceTrigger');
  const item = useRequiredFileUploadItemContext('FileUploadItemReplaceTrigger');
  const inputRef = useRef<HTMLInputElement>(null);
  const testId = useTestId('item-replace-trigger', testIdProp);

  if (root.readOnly || item.loading) return null;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (root.single) root.api.openFilePicker();
    else inputRef.current?.click();
  };

  // Multiple mode: validate first — `setFiles` re-validates the whole list and would drop
  // the original if the replacement failed.
  const handleReplace = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!picked) return;
    const errors = checkFile(picked, {
      acceptList: root.limits.acceptList,
      maxFileSize: root.limits.maxFileSize,
      minFileSize: root.limits.minFileSize,
      validate: root.validate,
    });
    if (errors.length) {
      root.reportRejections([{ file: picked, errors }]);
      return;
    }
    root.api.setFiles(root.api.acceptedFiles.map(file => (file === item.file ? picked : file)));
  };

  return (
    <>
      <Button
        variant='ghost'
        color='neutral'
        size='small'
        aria-label={ariaLabel ?? `Replace ${item.file.name}`}
        {...props}
        data-slot='file-upload-item-replace-trigger'
        data-testid={testId}
        disabled={disabled || root.disabled}
        onClick={handleClick}
      >
        {children ?? <RefreshCcw />}
      </Button>
      {root.single ? null : (
        <input
          ref={inputRef}
          type='file'
          accept={root.accept}
          hidden
          tabIndex={-1}
          aria-hidden
          data-slot='file-upload-item-replace-input'
          onChange={handleReplace}
        />
      )}
    </>
  );
};

FileUploadItemReplaceTrigger.displayName = 'FileUploadItemReplaceTrigger';
