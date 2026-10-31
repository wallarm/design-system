import { type ImageCropperRect, type ImageCropperSize, validateOutputSize } from './geometry';

export interface ImageCropperExportOptions {
  /** Defaults to lossless PNG. Browser support determines WebP availability. */
  type?: 'image/png' | 'image/jpeg' | 'image/webp';
  /** Encoding quality for JPEG or WebP, between 0 and 1. */
  quality?: number;
}

/** Draw directly from the original bitmap, avoiding intermediate lossy encodings. */
export const exportCrop = async (
  image: HTMLImageElement,
  crop: ImageCropperRect,
  outputSize: ImageCropperSize,
  { type = 'image/png', quality = 0.92 }: ImageCropperExportOptions = {},
): Promise<Blob | null> => {
  validateOutputSize(outputSize);
  if (
    !image.complete ||
    !image.naturalWidth ||
    !image.naturalHeight ||
    crop.width <= 0 ||
    crop.height <= 0
  )
    return null;
  try {
    const canvas = image.ownerDocument.createElement('canvas');
    canvas.width = outputSize.width;
    canvas.height = outputSize.height;
    if (canvas.width !== outputSize.width || canvas.height !== outputSize.height) return null;
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      outputSize.width,
      outputSize.height,
    );
    return await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, quality));
  } catch {
    // A cross-origin image without CORS permission cannot be read back from canvas.
    return null;
  }
};
