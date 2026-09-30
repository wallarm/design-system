import { type ChangeEvent, type FC, type MouseEvent, useRef } from 'react';
import { RefreshCcw } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useFileUploadRootContext } from './FileUploadContext';
import { useRequiredFileUploadItemContext } from './FileUploadItemContext';
import { checkFile, isSameFile } from './lib';

export type FileUploadItemReplaceTriggerProps = ButtonProps;

/**
 * Refresh — swap this file for another. Single mode reopens the picker (the new file
 * replaces the old). Multiple mode replaces just this row, in place; an invalid
 * replacement — or a copy of another listed file ("Already added") — keeps the original
 * and shows the rejection. An edited file with the same name, size and type is taken.
 *
 * Needs a `FileUpload` and renders nothing without one (a standalone stored-file row).
 * In multiple mode it also renders nothing on a stored `{ name }` row, which is not in the
 * accepted list and so has nothing to swap. Hidden while read-only or while the row is loading.
 */
export const FileUploadItemReplaceTrigger: FC<FileUploadItemReplaceTriggerProps> = ({
  children,
  onClick,
  disabled,
  'aria-label': ariaLabel,
  'data-testid': testIdProp,
  ...props
}) => {
  const root = useFileUploadRootContext();
  const item = useRequiredFileUploadItemContext('FileUploadItemReplaceTrigger');
  const inputRef = useRef<HTMLInputElement>(null);
  const testId = useTestId('item-replace-trigger', testIdProp);

  if (!root || root.readOnly || item.loading) return null;
  const current = item.file;
  if (!root.single && !(current instanceof File)) return null;
  const isDisabled = Boolean(disabled || root.disabled);

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
    if (!picked || !(current instanceof File)) return;
    // The very same file again: nothing to swap.
    if (isSameFile(picked, current) && picked.lastModified === current.lastModified) return;
    const errors = checkFile(picked, {
      acceptList: root.limits.acceptList,
      maxFileSize: root.limits.maxFileSize,
      minFileSize: root.limits.minFileSize,
      validate: root.validate,
    });
    // zag would drop one of two equal files from the list — the original with it.
    if (root.api.acceptedFiles.some(file => file !== current && isSameFile(file, picked)))
      errors.push('FILE_EXISTS');
    if (errors.length) {
      root.reportRejections([{ file: picked, errors }]);
      return;
    }
    root.commitFiles(root.api.acceptedFiles.map(file => (file === current ? picked : file)));
  };

  return (
    <>
      <Tooltip positioning={{ placement: 'top' }} disabled={isDisabled}>
        <TooltipTrigger asChild data-testid={testId}>
          <Button
            variant='ghost'
            color='neutral'
            size='small'
            aria-label={ariaLabel ?? `Replace ${item.file.name}`}
            {...props}
            data-slot='file-upload-item-replace-trigger'
            data-testid={testId}
            disabled={isDisabled}
            onClick={handleClick}
          >
            {children ?? <RefreshCcw />}
          </Button>
        </TooltipTrigger>
        <TooltipContent data-testid={testId ? `${testId}--tooltip` : undefined}>
          Replace
        </TooltipContent>
      </Tooltip>
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
