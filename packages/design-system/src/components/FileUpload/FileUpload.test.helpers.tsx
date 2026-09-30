import type { ComponentProps } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { FileUpload } from './FileUpload';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadError } from './FileUploadError';
import { FileUploadItem } from './FileUploadItem';
import { FileUploadItemDeleteTrigger } from './FileUploadItemDeleteTrigger';
import { FileUploadItemGroup } from './FileUploadItemGroup';
import { FileUploadItemReplaceTrigger } from './FileUploadItemReplaceTrigger';

export const makeFile = (name = 'policy.wasm', size = 3, type = 'application/wasm') =>
  new File(['x'.repeat(size)], name, { type });

export const hiddenInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>(
    '[data-slot="file-upload-hidden-input"]',
  ) as HTMLInputElement;

// Ark listens to `input` (not `change`) on the hidden input — verified under jsdom.
export const pick = (container: HTMLElement, ...files: File[]) =>
  fireEvent.input(hiddenInput(container), { target: { files } });

export const byTestId = (id: string) => screen.getByTestId(id);
export const queryByTestId = (id: string) => screen.queryByTestId(id);

type UploaderProps = Partial<ComponentProps<typeof FileUpload>>;

/** Final-shape uploader: Dropzone, inline error and rows with Replace + Delete. */
export const Uploader = ({ children, ...props }: UploaderProps) => (
  <FileUpload data-testid='fu' name='artifact' {...props}>
    {children ?? (
      <>
        <FileUploadDropzone />
        <FileUploadError />
        <FileUploadItemGroup>
          {file => (
            <FileUploadItem file={file}>
              <FileUploadItemReplaceTrigger />
              <FileUploadItemDeleteTrigger />
            </FileUploadItem>
          )}
        </FileUploadItemGroup>
      </>
    )}
  </FileUpload>
);
