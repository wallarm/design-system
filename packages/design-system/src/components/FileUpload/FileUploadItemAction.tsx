import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useFileUploadRootContext } from './FileUploadContext';

export type FileUploadItemActionProps = ButtonProps;

/**
 * A small ghost icon action for a row with no built-in behaviour — e.g. Download
 * (`<FileUploadItemAction aria-label='Download policy.wasm' onClick={download}><Download /></FileUploadItemAction>`).
 * Disabled with the root; stays available when read-only. Shows a tooltip with its
 * `aria-label` when that is a string.
 */
export const FileUploadItemAction: FC<FileUploadItemActionProps> = ({
  disabled,
  'data-testid': testIdProp,
  ...props
}) => {
  const root = useFileUploadRootContext();
  const testId = useTestId('item-action', testIdProp);
  const label = props['aria-label'];
  const isDisabled = Boolean(disabled || root?.disabled);

  const button = (
    <Button
      variant='ghost'
      color='neutral'
      size='small'
      {...props}
      data-slot='file-upload-item-action'
      data-testid={testId}
      disabled={isDisabled}
    />
  );

  if (typeof label !== 'string') return button;

  return (
    <Tooltip positioning={{ placement: 'top' }} disabled={isDisabled}>
      <TooltipTrigger asChild data-testid={testId}>
        {button}
      </TooltipTrigger>
      <TooltipContent data-testid={testId ? `${testId}--tooltip` : undefined}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

FileUploadItemAction.displayName = 'FileUploadItemAction';
