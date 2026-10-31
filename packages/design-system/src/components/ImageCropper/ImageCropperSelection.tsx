import type { FC, HTMLAttributes, Ref } from 'react';
import { ImageCropper as ArkImageCropper } from '@ark-ui/react/image-cropper';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { useImageCropperInternal, useImageCropperPartId } from './ImageCropperProvider';

export interface ImageCropperSelectionProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
}

/** The keyboard/pointer target representing the fixed crop frame. */
export const ImageCropperSelection: FC<ImageCropperSelectionProps> = ({
  ref,
  id,
  className,
  onPointerDownCapture,
  'data-testid': testIdProp,
  ...props
}) => {
  const { api, selection } = useImageCropperInternal();
  const testId = useTestId('selection', testIdProp);
  useImageCropperPartId('selection', id);
  return (
    <ArkImageCropper.Selection
      {...props}
      ref={ref}
      tabIndex={api.ready ? 0 : -1}
      aria-disabled={!api.ready || undefined}
      aria-label={props['aria-label'] ?? 'Position image'}
      aria-valuenow={selection.value}
      aria-valuemax={selection.max}
      aria-valuetext={props['aria-valuetext'] ?? selection.text}
      onPointerDownCapture={event => {
        onPointerDownCapture?.(event);
        if (
          api.ready &&
          !event.defaultPrevented &&
          event.button === 0 &&
          event.isPrimary !== false
        ) {
          event.currentTarget.focus({ preventScroll: true });
        }
      }}
      data-slot='image-cropper-selection'
      data-testid={testId}
      className={cn(
        'outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-focus-primary',
        className,
      )}
    />
  );
};

ImageCropperSelection.displayName = 'ImageCropperSelection';
