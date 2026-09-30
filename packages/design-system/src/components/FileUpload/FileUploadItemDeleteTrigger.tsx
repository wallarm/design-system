import type { FC, MouseEvent } from 'react';
import { X } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useFileUploadRootContext } from './FileUploadContext';
import { useRequiredFileUploadItemContext } from './FileUploadItemContext';

export type FileUploadItemDeleteTriggerProps = ButtonProps;

/**
 * X — removes a picked file (and clears any showing rejection). While the row is loading
 * it is the Cancel: your `onClick` aborts the request. For a stored `{ name }` file only
 * your `onClick` runs (e.g. detach). Call `event.preventDefault()` to skip the removal.
 */
export const FileUploadItemDeleteTrigger: FC<FileUploadItemDeleteTriggerProps> = ({
  children,
  onClick,
  disabled,
  'aria-label': ariaLabel,
  'data-testid': testIdProp,
  ...props
}) => {
  const root = useFileUploadRootContext();
  const item = useRequiredFileUploadItemContext('FileUploadItemDeleteTrigger');
  const testId = useTestId('item-delete-trigger', testIdProp);

  if (root?.readOnly) return null;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (root && item.file instanceof File) {
      root.api.deleteFile(item.file);
      root.clearRejections();
    }
  };

  return (
    <Tooltip positioning={{ placement: 'top' }}>
      <TooltipTrigger asChild data-testid={testId}>
        <Button
          variant='ghost'
          color='neutral'
          size='small'
          aria-label={ariaLabel ?? (item.loading ? 'Cancel upload' : `Delete ${item.file.name}`)}
          {...props}
          data-slot='file-upload-item-delete-trigger'
          data-testid={testId}
          disabled={disabled || root?.disabled}
          onClick={handleClick}
        >
          {children ?? <X />}
        </Button>
      </TooltipTrigger>
      <TooltipContent data-testid={testId ? `${testId}--tooltip` : undefined}>
        {item.loading ? 'Cancel upload' : 'Delete'}
      </TooltipContent>
    </Tooltip>
  );
};

FileUploadItemDeleteTrigger.displayName = 'FileUploadItemDeleteTrigger';
