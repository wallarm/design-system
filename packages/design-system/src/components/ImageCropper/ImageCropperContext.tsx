import type { FC, ReactNode } from 'react';
import { type ImageCropperApi, useImageCropperInternal } from './ImageCropperProvider';

export interface ImageCropperContextProps {
  children: (api: ImageCropperApi) => ReactNode;
}

/** Compose Slider/FileUpload/Button controls using the current cropper state. */
export const ImageCropperContext: FC<ImageCropperContextProps> = ({ children }) =>
  children(useImageCropperInternal().api);
ImageCropperContext.displayName = 'ImageCropperContext';
