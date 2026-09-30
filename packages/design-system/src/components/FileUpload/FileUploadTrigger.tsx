import type { FC, Ref } from 'react';
import { FileUpload as ArkFileUpload } from '@ark-ui/react/file-upload';
import { Share } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { useRequiredFileUploadRootContext } from './FileUploadContext';

export type FileUploadTriggerProps = ButtonProps;

/**
 * "Select file" button — the compact picker for when space is tight. Takes every
 * `Button` prop (defaults: primary / brand / large). Hidden (read-only) and blocked like the Area.
 *
 * `asChild`: no Button is rendered. The single child element (e.g. `<Avatar asChild><button/></Avatar>`)
 * becomes the trigger and receives `data-slot`, `data-testid`, `aria-describedby`, `disabled` and the
 * Ark trigger props. Button-only props (`variant`, `color`, `size`, `loading`, `fullWidth`, `as`) are
 * ignored. Pass `disabled` / `aria-describedby` here, not on the child — a child value wins the merge.
 */
export const FileUploadTrigger: FC<FileUploadTriggerProps> = ({
  children,
  disabled,
  asChild = false,
  'data-testid': testIdProp,
  'aria-describedby': describedByProp,
  ...props
}) => {
  const ctx = useRequiredFileUploadRootContext('FileUploadTrigger');
  const testId = useTestId('trigger', testIdProp);

  if (ctx.pickerHidden) return null;

  // A consumer hint is kept; the error link is added to it, never replaced.
  const describedBy =
    [describedByProp, ctx.rejections.length ? ctx.errorId : undefined].filter(Boolean).join(' ') ||
    undefined;

  const shared = {
    'aria-describedby': describedBy,
    'data-slot': 'file-upload-trigger',
    'data-testid': testId,
    disabled: disabled || ctx.pickerBlocked,
  };

  if (asChild) {
    // Button-only props must not reach the DOM.
    const { variant, color, size, loading, fullWidth, as, ref, ...rest } = props;
    return (
      <ArkFileUpload.Trigger {...rest} {...shared} ref={ref as Ref<HTMLButtonElement>} asChild>
        {children}
      </ArkFileUpload.Trigger>
    );
  }

  return (
    <ArkFileUpload.Trigger asChild>
      <Button variant='primary' color='brand' size='large' {...props} {...shared}>
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
