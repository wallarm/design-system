import type { FC, MouseEvent } from 'react';
import { X } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useFileUploadRootContext } from './FileUploadContext';
import { useRequiredFileUploadItemContext } from './FileUploadItemContext';

export type FileUploadItemDeleteTriggerProps = ButtonProps;

const ROW = '[data-slot="file-upload-item"]';
const PICKER = '[data-slot="file-upload-dropzone"], [data-slot="file-upload-trigger"]';

/**
 * Removing a row unmounts the focused button, and focus would fall to `<body>`. Returns a
 * callback that, once the row is gone, moves focus to the row now at the same position
 * (else the previous one) — its Delete, else its first action — or else back to the picker.
 */
const keepFocusInside = (button: HTMLButtonElement) => {
  const row = button.closest(ROW);
  const root = button.closest('[data-slot="file-upload"]');
  const index = row && root ? [...root.querySelectorAll(ROW)].indexOf(row) : -1;
  return () => {
    if (!root || index < 0) return;
    requestAnimationFrame(() => {
      const active = button.ownerDocument.activeElement;
      // Focus moved on its own (or the consumer moved it): leave it.
      if (active && active !== button.ownerDocument.body && active.isConnected) return;
      const rows = root.querySelectorAll(ROW);
      const next = rows[index] ?? rows[index - 1];
      const target =
        next?.querySelector<HTMLElement>('[data-slot="file-upload-item-delete-trigger"]') ??
        next?.querySelector<HTMLElement>('button:not(:disabled)') ??
        root.querySelector<HTMLElement>(PICKER);
      target?.focus();
    });
  };
};

/**
 * X — removes a picked file (and clears any showing rejection). While the row is loading
 * it is the Cancel: your `onClick` aborts the request. For a stored `{ name }` file only
 * your `onClick` runs (e.g. detach). Call `event.preventDefault()` to skip the removal.
 * After a removal, focus moves to the next row (else the previous one), or back to the picker.
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
  const isDisabled = Boolean(disabled || root?.disabled);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (root && item.file instanceof File) {
      const restoreFocus = keepFocusInside(event.currentTarget);
      root.api.deleteFile(item.file);
      root.clearRejections();
      restoreFocus();
    }
  };

  return (
    <Tooltip positioning={{ placement: 'top' }} disabled={isDisabled}>
      <TooltipTrigger asChild data-testid={testId}>
        <Button
          variant='ghost'
          color='neutral'
          size='small'
          aria-label={ariaLabel ?? (item.loading ? 'Cancel upload' : `Delete ${item.file.name}`)}
          {...props}
          data-slot='file-upload-item-delete-trigger'
          data-testid={testId}
          disabled={isDisabled}
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
