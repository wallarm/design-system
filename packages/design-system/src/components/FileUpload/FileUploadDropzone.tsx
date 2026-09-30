import { type ComponentPropsWithoutRef, type FC, type ReactNode, type Ref, useId } from 'react';
import { useFieldContext } from '@ark-ui/react/field';
import { FileUpload as ArkFileUpload } from '@ark-ui/react/file-upload';
import { Share } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { fileUploadDropzoneVariants } from './classes';
import { useRequiredFileUploadRootContext } from './FileUploadContext';

export interface FileUploadDropzoneProps extends ComponentPropsWithoutRef<'div'> {
  /** Replaces the default upload icon. */
  icon?: ReactNode;
  /** Replaces the default text ("Drag and drop files or click to select"). */
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

const DEFAULT_TEXT = 'Drag and drop files or click to select';

/**
 * Dashed drop Area — drop files on it, or click / Enter / Space to open the picker.
 * Stays visible once a file is chosen; hidden only when read-only; inert while disabled,
 * while a row is uploading, and at `maxFiles`.
 */
export const FileUploadDropzone: FC<FileUploadDropzoneProps> = ({
  icon,
  children,
  className,
  ref,
  ...props
}) => {
  const ctx = useRequiredFileUploadRootContext('FileUploadDropzone');
  const field = useFieldContext();
  const testId = useTestId('dropzone');
  const textId = useId();

  if (ctx.pickerHidden) return null;

  const blocked = ctx.pickerBlocked;
  const hasRejections = ctx.rejections.length > 0;
  // Ark names the zone "dropzone"; name it by the Field label + the visible text instead.
  const labelledBy = [field?.ids.label, textId].filter(Boolean).join(' ');

  return (
    <ArkFileUpload.Dropzone
      aria-labelledby={labelledBy}
      aria-describedby={hasRejections ? ctx.errorId : undefined}
      {...props}
      ref={ref}
      disableClick={blocked}
      // Keep the button role while blocked (Ark switches to "application" with disableClick).
      role='button'
      aria-disabled={blocked || undefined}
      data-disabled={blocked ? '' : undefined}
      data-invalid={ctx.invalid || hasRejections ? '' : undefined}
      data-slot='file-upload-dropzone'
      data-testid={testId}
      className={cn(fileUploadDropzoneVariants(), className)}
    >
      {icon ?? <Share size='md' />}
      <span id={textId}>{children ?? DEFAULT_TEXT}</span>
    </ArkFileUpload.Dropzone>
  );
};

FileUploadDropzone.displayName = 'FileUploadDropzone';
