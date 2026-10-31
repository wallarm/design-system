import { type FC, type HTMLAttributes, type Ref, useLayoutEffect, useRef, useState } from 'react';
import { ImageCropper as ArkImageCropper } from '@ark-ui/react/image-cropper';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { type CropperSource, ImageCropperProvider } from './ImageCropperProvider';
import { exportCrop } from './lib/exportCrop';
import { getCropperGeometry, type ImageCropperSize, validateOutputSize } from './lib/geometry';
import { useCropperMachine } from './useCropperMachine';

export interface ImageCropperProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  /** Exact exported pixel dimensions; also determines the visible frame's aspect ratio. */
  outputSize: ImageCropperSize;
  zoom?: number;
  defaultZoom?: number;
  /** The minimum scale, relative to the image covering the frame. Must be at least 1. */
  minZoom?: number;
  maxZoom?: number;
  onZoomChange?: (zoom: number) => void;
  ref?: Ref<HTMLDivElement>;
}

/** Client-side image crop and resize. Compose a viewport, image, selection and external controls. */
export const ImageCropper: FC<ImageCropperProps> = ({
  outputSize,
  zoom,
  defaultZoom = 1,
  minZoom = 1,
  maxZoom = 5,
  onZoomChange,
  ref,
  id,
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  validateOutputSize(outputSize);
  if (!Number.isFinite(minZoom) || !Number.isFinite(maxZoom) || minZoom < 1 || maxZoom < minZoom) {
    throw new RangeError('ImageCropper requires 1 <= minZoom <= maxZoom.');
  }
  const [frameSize, setFrameSize] = useState<ImageCropperSize>({ width: 0, height: 0 });
  const [source, setSource] = useState<CropperSource | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [partIds, setPartIds] = useState<
    Partial<Record<'viewport' | 'image' | 'selection', string>>
  >({});
  const sourceSize = source?.width && source.height ? source : outputSize;
  const geometry = getCropperGeometry(sourceSize, frameSize);
  const controlledZoom =
    zoom === undefined ? undefined : Math.min(maxZoom, Math.max(minZoom, zoom));
  if (controlledZoom !== undefined && !Number.isFinite(controlledZoom)) {
    throw new RangeError('ImageCropper zoom must be finite.');
  }
  const ark = useCropperMachine({
    ids: { ...partIds, root: id },
    fixedCropArea: true,
    aspectRatio: outputSize.width / outputSize.height,
    minWidth: frameSize.width,
    maxWidth: frameSize.width,
    minHeight: frameSize.height,
    maxHeight: frameSize.height,
    minZoom,
    maxZoom,
    zoom: controlledZoom,
    defaultZoom: Math.min(maxZoom, Math.max(minZoom, defaultZoom)),
    onZoomChange: details => onZoomChange?.(details.zoom),
    translations: {
      selectionInstructions:
        'Use arrow keys to position the image. Hold Shift for larger steps. Press plus or minus to zoom.',
    },
  });

  // Source loading and DOM measurement are external events. Re-center when their geometry changes.
  const measured =
    frameSize.width > 0 &&
    frameSize.height > 0 &&
    Math.abs(ark.viewportRect.width - geometry.viewport.width) < 0.5 &&
    Math.abs(ark.viewportRect.height - geometry.viewport.height) < 0.5;
  const resetKey = `${source?.src}:${source?.width}:${source?.height}:${frameSize.width}:${frameSize.height}:${outputSize.width / outputSize.height}`;
  const lastReset = useRef('');
  const lastSource = useRef<string | undefined>(undefined);
  useLayoutEffect(() => {
    const sourceChanged = lastSource.current !== source?.src;
    lastSource.current = source?.src;
    if (!sourceChanged && (!measured || lastReset.current === resetKey)) return;
    // Reset editing state immediately on replacement, then center the crop once layout settles.
    lastReset.current = measured ? resetKey : '';
    ark.reset();
  }, [ark, measured, resetKey, source?.src]);

  const ready =
    source?.status === 'loaded' &&
    source.width > 0 &&
    source.height > 0 &&
    ark.naturalSize.width === source.width &&
    ark.naturalSize.height === source.height &&
    measured &&
    Math.abs(ark.crop.x - geometry.crop.x) < 0.5 &&
    Math.abs(ark.crop.y - geometry.crop.y) < 0.5 &&
    Math.abs(ark.crop.width - frameSize.width) < 0.5 &&
    Math.abs(ark.crop.height - frameSize.height) < 0.5;

  const sourceScale = geometry.viewport.width > 0 ? sourceSize.width / geometry.viewport.width : 1;
  const cropWidth = (frameSize.width * sourceScale) / ark.zoom;
  const cropHeight = (frameSize.height * sourceScale) / ark.zoom;
  const sourceX =
    ((ark.crop.x - ark.offset.x - geometry.viewport.width / 2) / ark.zoom +
      geometry.viewport.width / 2) *
    sourceScale;
  const sourceY =
    ((ark.crop.y - ark.offset.y - geometry.viewport.height / 2) / ark.zoom +
      geometry.viewport.height / 2) *
    sourceScale;
  const horizontalRange = Math.max(0, sourceSize.width - cropWidth);
  const verticalRange = Math.max(0, sourceSize.height - cropHeight);

  return (
    <ArkImageCropper.RootProvider
      {...props}
      value={ark}
      ref={ref}
      aria-busy={!ready || undefined}
      data-slot='image-cropper'
      data-testid={testId}
      data-state={source?.status ?? 'loading'}
      className={cn('flex min-w-0 flex-col items-center gap-24', className)}
    >
      <TestIdProvider value={testId}>
        <ImageCropperProvider
          value={{
            outputSize,
            viewportSize: geometry.viewport,
            source,
            setSource,
            setFrameSize,
            setImage,
            setPartIds,
            selection: {
              value: Math.max(0, Math.round(horizontalRange >= verticalRange ? sourceX : sourceY)),
              max: Math.round(Math.max(horizontalRange, verticalRange)),
              text: `Image position X ${Math.max(0, Math.round(sourceX))}, Y ${Math.max(0, Math.round(sourceY))} pixels. Zoom ${Math.round(ark.zoom * 100)}%.`,
            },
            api: {
              ready,
              zoom: ark.zoom,
              setZoom: value => {
                if (Number.isFinite(value))
                  ark.setZoom(Math.min(maxZoom, Math.max(minZoom, value)));
              },
              reset: ark.reset,
              getCroppedImage: async options => {
                if (!ready || !image || image.getAttribute('src') !== source?.src) return null;
                const src = image.currentSrc || image.src;
                const { topLeft, topRight, bottomLeft } = ark.getCropData().corners;
                const blob = await exportCrop(
                  image,
                  {
                    x: topLeft.x,
                    y: topLeft.y,
                    width: topRight.x - topLeft.x,
                    height: bottomLeft.y - topLeft.y,
                  },
                  outputSize,
                  options,
                );
                return image.isConnected && (image.currentSrc || image.src) === src ? blob : null;
              },
            },
          }}
        >
          {children}
        </ImageCropperProvider>
      </TestIdProvider>
    </ArkImageCropper.RootProvider>
  );
};

ImageCropper.displayName = 'ImageCropper';
