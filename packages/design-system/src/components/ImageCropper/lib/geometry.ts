/** Pixel dimensions. Export sizes must be positive integers. */
export interface ImageCropperSize {
  width: number;
  height: number;
}

export interface ImageCropperRect extends ImageCropperSize {
  x: number;
  y: number;
}

export const validateOutputSize = ({ width, height }: ImageCropperSize): void => {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0) {
    throw new RangeError('ImageCropper outputSize must contain positive integer dimensions.');
  }
};

/** Ark's pan bounds assume the image fills its viewport; keep that viewport at the source aspect. */
export const getCropperGeometry = (source: ImageCropperSize, frame: ImageCropperSize) => {
  const scale = Math.max(frame.width / source.width, frame.height / source.height);
  const viewport = { width: source.width * scale, height: source.height * scale };
  return {
    viewport,
    crop: {
      x: (viewport.width - frame.width) / 2,
      y: (viewport.height - frame.height) / 2,
      ...frame,
    },
  };
};
