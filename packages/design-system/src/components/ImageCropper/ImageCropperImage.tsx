import { type FC, type ImgHTMLAttributes, type Ref, useLayoutEffect, useState } from 'react';
import { ImageCropper as ArkImageCropper } from '@ark-ui/react/image-cropper';
import { useComposedRefs } from '@radix-ui/react-compose-refs';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { useImageCropperInternal, useImageCropperPartId } from './ImageCropperProvider';

export interface ImageCropperImageProps extends ImgHTMLAttributes<HTMLImageElement>, TestableProps {
  ref?: Ref<HTMLImageElement>;
}

export const ImageCropperImage: FC<ImageCropperImageProps> = ({
  ref,
  id,
  src,
  alt = '',
  className,
  onLoad,
  onError,
  'data-testid': testIdProp,
  ...props
}) => {
  const { source, setSource, setImage } = useImageCropperInternal();
  const [node, setNode] = useState<HTMLImageElement | null>(null);
  const composedRef = useComposedRefs(ref, setNode, setImage);
  const testId = useTestId('image', testIdProp);
  useImageCropperPartId('image', id);
  useLayoutEffect(() => {
    setSource({ src: src ?? '', status: 'loading', width: 0, height: 0 });
    // Cached images need no new load event; only use their pixels when the URL still matches.
    if (
      node?.complete &&
      node.naturalWidth &&
      node.naturalHeight &&
      node.currentSrc &&
      node.currentSrc === node.src
    ) {
      setSource({
        src: src ?? '',
        status: 'loaded',
        width: node.naturalWidth,
        height: node.naturalHeight,
      });
    }
    return () => setSource(null);
  }, [src, node, setSource]);
  const state = source && source.src === src ? source.status : 'loading';
  return (
    <ArkImageCropper.Image
      {...props}
      ref={composedRef}
      src={src}
      alt={alt}
      data-slot='image-cropper-image'
      data-testid={testId}
      data-state={state}
      className={cn(
        'block size-full select-none data-[state=loading]:invisible data-[state=error]:invisible',
        className,
      )}
      onLoad={event => {
        const image = event.currentTarget;
        setSource({
          src: src ?? '',
          status: 'loaded',
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
        onLoad?.(event);
      }}
      onError={event => {
        setSource({ src: src ?? '', status: 'error', width: 0, height: 0 });
        onError?.(event);
      }}
    />
  );
};

ImageCropperImage.displayName = 'ImageCropperImage';
