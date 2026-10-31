import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useContext,
  useLayoutEffect,
} from 'react';
import type { ImageCropperExportOptions } from './lib/exportCrop';
import type { ImageCropperSize } from './lib/geometry';

export interface ImageCropperApi {
  /** True once the current image has loaded and the crop has been measured. */
  ready: boolean;
  zoom: number;
  setZoom: (zoom: number) => void;
  reset: () => void;
  /** Returns a rectangular bitmap at outputSize, or null when unavailable or canvas export fails. */
  getCroppedImage: (options?: ImageCropperExportOptions) => Promise<Blob | null>;
}

export interface CropperSource extends ImageCropperSize {
  src: string;
  status: 'loading' | 'loaded' | 'error';
}

type Part = 'viewport' | 'image' | 'selection';
export interface ImageCropperInternalContext {
  api: ImageCropperApi;
  selection: { value: number; max: number; text: string };
  outputSize: ImageCropperSize;
  viewportSize: ImageCropperSize;
  source: CropperSource | null;
  setSource: Dispatch<SetStateAction<CropperSource | null>>;
  setFrameSize: Dispatch<SetStateAction<ImageCropperSize>>;
  setImage: Dispatch<SetStateAction<HTMLImageElement | null>>;
  setPartIds: Dispatch<SetStateAction<Partial<Record<Part, string>>>>;
}

export const ImageCropperProvider = createContext<ImageCropperInternalContext | null>(null);

export const useImageCropperInternal = () => {
  const context = useContext(ImageCropperProvider);
  if (!context) throw new Error('ImageCropper parts must be rendered inside ImageCropper.');
  return context;
};

/** Ark locates elements by id. Publish custom ids into its configuration before paint. */
export const useImageCropperPartId = (part: Part, id?: string) => {
  const { setPartIds } = useImageCropperInternal();
  useLayoutEffect(() => {
    setPartIds(current => {
      if (current[part] === id) return current;
      return { ...current, [part]: id };
    });
    return () => {
      setPartIds(current => (current[part] === id ? { ...current, [part]: undefined } : current));
    };
  }, [part, id, setPartIds]);
};
