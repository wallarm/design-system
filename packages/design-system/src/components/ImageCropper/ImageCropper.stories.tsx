import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Button } from '../Button';
import { FileUpload, FileUploadError, FileUploadTrigger, useFilePreviewUrl } from '../FileUpload';
import { Slider, SliderControl, SliderThumb } from '../Slider';
import {
  ImageCropper,
  ImageCropperContext,
  ImageCropperGrid,
  ImageCropperImage,
  type ImageCropperProps,
  ImageCropperSelection,
  ImageCropperViewport,
} from '.';
import { LANDSCAPE, PORTRAIT, TALL_BANDS, WIDE_BANDS } from './stories/fixtures';

const meta = {
  title: 'Inputs/ImageCropper',
  component: ImageCropper,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Select part of an image by moving and zooming it inside a fixed frame, then export a Blob at the exact outputSize. The frame follows the output aspect ratio and preserves the source proportions. Compose Slider for zoom, FileUpload for choosing a file, and your own Save action through ImageCropperContext. All processing runs in the browser; the consumer owns uploading. Preview rounding is visual only: the saved image is rectangular. Remote images need crossOrigin="anonymous" on ImageCropperImage and server CORS permission for canvas export; local file/object URLs also work. Size the preview with width classes; CSS scale transforms on ancestors are not supported by the underlying crop geometry. Arrow keys pan, Shift accelerates, and +/− zoom.',
      },
      source: {
        code: `<ImageCropper outputSize={{ width: 256, height: 256 }}>
  <ImageCropperViewport className="w-[100px] rounded-[32px]">
    <ImageCropperImage src={imageUrl} alt="Image to crop" />
    <ImageCropperSelection aria-label="Position image">
      <ImageCropperGrid />
    </ImageCropperSelection>
  </ImageCropperViewport>
  <ImageCropperContext>
    {api => (
      <>
        <Slider value={[api.zoom]} min={1} max={5} step={0.1}
          onValueChange={([zoom]) => { if (zoom !== undefined) api.setZoom(zoom); }}>
          <SliderControl><SliderThumb aria-label="Zoom image" /></SliderControl>
        </Slider>
        <Button disabled={!api.ready} onClick={async () => {
          const blob = await api.getCroppedImage();
          if (blob) saveImage(blob);
        }}>Save</Button>
      </>
    )}
  </ImageCropperContext>
</ImageCropper>`,
      },
    },
  },
  args: { outputSize: { width: 256, height: 256 }, minZoom: 1, maxZoom: 4 },
  argTypes: {
    outputSize: { control: 'object' },
    minZoom: { control: 'number' },
    maxZoom: { control: 'number' },
    defaultZoom: { control: 'number' },
    zoom: { control: false },
    onZoomChange: { control: false },
    children: { control: false },
    ref: { control: false },
  },
} satisfies Meta<typeof ImageCropper>;

export default meta;

interface ExampleProps extends ImageCropperProps {
  source?: string;
  compact?: boolean;
  upload?: boolean;
  geometry?: boolean;
}

const Example = ({
  source = PORTRAIT,
  compact = false,
  upload = false,
  geometry = false,
  ...args
}: ExampleProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [alternate, setAlternate] = useState(false);
  const src = useFilePreviewUrl(files[0]);
  const resultUrl = useFilePreviewUrl(result);

  return (
    <div className='flex w-[304px] max-w-[calc(100vw-32px)] flex-col gap-24'>
      <ImageCropper {...args} data-testid='cropper' className='flex flex-col items-center gap-24'>
        <ImageCropperViewport
          className={compact || geometry ? 'w-[100px] rounded-[32px]' : 'w-[280px] rounded-12'}
        >
          <ImageCropperImage
            src={alternate ? TALL_BANDS : (src ?? source)}
            alt='Image to crop'
            onLoad={() => setError('')}
            onError={() => setError('This image could not be opened. Choose another file.')}
          />
          <ImageCropperSelection aria-label='Crop image'>
            <ImageCropperGrid />
          </ImageCropperSelection>
        </ImageCropperViewport>
        <ImageCropperContext>
          {api => (
            <>
              <Slider
                data-testid='cropper-zoom'
                className='w-full'
                value={[api.zoom]}
                min={args.minZoom ?? 1}
                max={args.maxZoom ?? 4}
                step={0.1}
                disabled={!api.ready}
                onValueChange={([value]) => {
                  if (value !== undefined) api.setZoom(value);
                }}
              >
                <SliderControl>
                  <SliderThumb aria-label='Zoom image' />
                </SliderControl>
              </Slider>
              <div className='flex items-center gap-8'>
                <Button
                  data-testid='cropper-save'
                  disabled={!api.ready}
                  onClick={async () => {
                    try {
                      const blob = await api.getCroppedImage();
                      if (blob) {
                        setResult(new File([blob], 'cropped-image.png', { type: blob.type }));
                        setError('');
                      } else {
                        setError('The image could not be exported. Try a local image file.');
                      }
                    } catch {
                      setError('The image could not be exported. Try a local image file.');
                    }
                  }}
                >
                  Save image
                </Button>
                <Button variant='secondary' color='neutral' onClick={() => api.reset()}>
                  Reset
                </Button>
              </div>
            </>
          )}
        </ImageCropperContext>
      </ImageCropper>
      {upload && (
        <FileUpload
          value={files}
          onValueChange={next => {
            setFiles(next);
            setResult(null);
          }}
          accept='image/png,image/jpeg,image/webp'
          maxFileSize={10 * 1024 * 1024}
          data-testid='cropper-upload'
        >
          <FileUploadTrigger variant='secondary' color='neutral'>
            Select file
          </FileUploadTrigger>
          <FileUploadError />
        </FileUpload>
      )}
      {geometry && (
        <Button data-testid='cropper-replace' onClick={() => setAlternate(value => !value)}>
          Switch source orientation
        </Button>
      )}
      {error && (
        <p role='alert' className='text-sm text-text-danger'>
          {error}
        </p>
      )}
      {resultUrl && (
        <div className='flex flex-col items-center gap-8'>
          <img
            data-testid='cropper-result'
            src={resultUrl}
            alt='Saved crop'
            className='max-h-[200px] max-w-full object-contain'
          />
          <a
            href={resultUrl}
            download='cropped-image.png'
            className='text-sm text-text-link-default'
          >
            Download {args.outputSize.width} × {args.outputSize.height}
          </a>
        </div>
      )}
    </div>
  );
};

/** A small rounded preview like the avatar design; the saved square is 256 × 256 pixels. */
export const Avatar: StoryFn<ImageCropperProps> = args => <Example {...args} compact />;

/** Wide source and output: a 600 × 300 image is cropped to a 320 × 180 result. */
export const Landscape: StoryFn<ImageCropperProps> = args => (
  <Example {...args} source={LANDSCAPE} outputSize={{ width: 320, height: 180 }} />
);

/** FileUpload owns picking and validation; useFilePreviewUrl releases the local object URL. */
export const WithFileUpload: StoryFn<ImageCropperProps> = args => <Example {...args} upload />;

/** The parent can accept or reject zoom changes; the image and external slider follow its value. */
export const Controlled: StoryFn<ImageCropperProps> = args => {
  const [zoom, setZoom] = useState(1.5);
  const [locked, setLocked] = useState(false);
  return (
    <div className='flex flex-col items-center gap-16'>
      <Example
        {...args}
        zoom={zoom}
        onZoomChange={value => {
          if (!locked) setZoom(value);
        }}
      />
      <Button
        variant='secondary'
        color='neutral'
        data-testid='cropper-lock-zoom'
        onClick={() => setLocked(value => !value)}
      >
        {locked ? 'Unlock zoom' : 'Lock zoom'}
      </Button>
    </div>
  );
};

/** Color bands make source proportions and the exact exported selection easy to verify. */
export const Geometry: StoryFn<ImageCropperProps> = args => (
  <Example {...args} source={WIDE_BANDS} outputSize={{ width: 64, height: 64 }} geometry />
);
