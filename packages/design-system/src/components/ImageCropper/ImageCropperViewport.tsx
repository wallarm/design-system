import { type FC, type HTMLAttributes, type Ref, useLayoutEffect, useState } from 'react';
import { ImageCropper as ArkImageCropper } from '@ark-ui/react/image-cropper';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { useImageCropperInternal, useImageCropperPartId } from './ImageCropperProvider';

export interface ImageCropperViewportProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  /** Styles the visible crop frame. Set its width; height follows outputSize's aspect ratio. */
  className?: string;
  /** Ref and native event/analytics attributes target the actual interactive viewport. */
  ref?: Ref<HTMLDivElement>;
}

export const ImageCropperViewport: FC<ImageCropperViewportProps> = ({
  ref,
  id,
  className,
  children,
  style,
  'data-testid': testIdProp,
  ...props
}) => {
  const { outputSize, viewportSize, setFrameSize } = useImageCropperInternal();
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const testId = useTestId('viewport', testIdProp);
  const frameTestId = useTestId('frame');
  useImageCropperPartId('viewport', id);
  useLayoutEffect(() => {
    if (!frame) return;
    const measure = () => {
      const { width, height } = frame.getBoundingClientRect();
      setFrameSize(current =>
        current.width === width && current.height === height ? current : { width, height },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [frame, setFrameSize]);
  return (
    <div
      ref={setFrame}
      data-slot='image-cropper-frame'
      data-testid={frameTestId}
      className={cn(
        'relative w-[240px] max-w-full overflow-hidden rounded-12 bg-bg-surface-2',
        className,
      )}
      style={{ aspectRatio: outputSize.width / outputSize.height }}
    >
      <ArkImageCropper.Viewport
        {...props}
        ref={ref}
        data-slot='image-cropper-viewport'
        data-testid={testId}
        className='absolute! top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab data-panning:cursor-grabbing'
        style={{
          ...style,
          width: viewportSize.width,
          height: viewportSize.height,
        }}
      >
        {children}
      </ArkImageCropper.Viewport>
    </div>
  );
};

ImageCropperViewport.displayName = 'ImageCropperViewport';
