import type { FC } from 'react';
import { FileUpload as ArkFileUpload } from '@ark-ui/react/file-upload';
import { Share } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { useRequiredFileUploadRootContext } from './FileUploadContext';

export type FileUploadTriggerProps = ButtonProps;

/**
 * "Select file" button — the compact picker for when space is tight. Takes every
 * `Button` prop (defaults: primary / brand / large). Hidden and blocked like the Area.
 */
export const FileUploadTrigger: FC<FileUploadTriggerProps> = ({
  children,
  disabled,
  'data-testid': testIdProp,
  ...props
}) => {
  const ctx = useRequiredFileUploadRootContext('FileUploadTrigger');
  const testId = useTestId('trigger', testIdProp);

  if (ctx.pickerHidden) return null;

  return (
    <ArkFileUpload.Trigger asChild>
      <Button
        variant='primary'
        color='brand'
        size='large'
        aria-describedby={ctx.rejections.length ? ctx.errorId : undefined}
        {...props}
        data-slot='file-upload-trigger'
        data-testid={testId}
        disabled={disabled || ctx.pickerBlocked}
      >
        {children ?? (
          <>
            <Share />
            Select file
          </>
        )}
      </Button>
    </ArkFileUpload.Trigger>
  );
};

FileUploadTrigger.displayName = 'FileUploadTrigger';
