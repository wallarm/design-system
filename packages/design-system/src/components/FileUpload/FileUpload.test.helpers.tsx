import type { ComponentProps } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { FileUpload } from './FileUpload';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadError } from './FileUploadError';
import { FileUploadItem } from './FileUploadItem';
import { FileUploadItemDeleteTrigger } from './FileUploadItemDeleteTrigger';
import { FileUploadItemGroup } from './FileUploadItemGroup';
import { FileUploadItemReplaceTrigger } from './FileUploadItemReplaceTrigger';

export const makeFile = (
  name = 'policy.wasm',
  size = 3,
  type = 'application/wasm',
  lastModified?: number,
) => new File(['x'.repeat(size)], name, { type, lastModified });

/** jsdom keeps each wrapper's implementation under an own `Symbol(impl)`. */
const implOf = (wrapper: object): unknown => {
  const symbol = Object.getOwnPropertySymbols(wrapper).find(s => s.description === 'impl');
  return symbol ? (wrapper as Record<symbol, unknown>)[symbol] : undefined;
};

/**
 * jsdom has no `DataTransfer`, so nothing can write `input.files` the way a browser (and zag's
 * `setInputFiles`) does. This stand-in builds a REAL jsdom `FileList` — `input.files` and
 * `new FormData(form)` then see the files. Returns the cleanup.
 */
export const installDataTransfer = () => {
  class TestDataTransfer {
    private readonly list: File[] = [];
    readonly items = {
      add: (file: File) => {
        this.list.push(file);
      },
    };
    get files(): FileList {
      const input = document.createElement('input');
      input.type = 'file';
      const files = input.files as FileList;
      (implOf(files) as unknown[]).push(...this.list.map(implOf));
      return files;
    }
  }
  const win = document.defaultView as unknown as Record<string, unknown>;
  const targets = [win, globalThis as unknown as Record<string, unknown>];
  const previous = targets.map(target => target.DataTransfer);
  for (const target of targets) target.DataTransfer = TestDataTransfer;
  return () =>
    targets.forEach((target, i) => {
      if (previous[i] === undefined) delete target.DataTransfer;
      else target.DataTransfer = previous[i];
    });
};

export const hiddenInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>(
    '[data-slot="file-upload-hidden-input"]',
  ) as HTMLInputElement;

// Ark listens to `input` (not `change`) on the hidden input — verified under jsdom.
export const pick = (container: HTMLElement, ...files: File[]) =>
  fireEvent.input(hiddenInput(container), { target: { files } });

/**
 * jsdom has no DataTransfer: a minimal stand-in with what zag reads on drag/drop
 * (`types` with "Files", file items whose entry is a file, and `getAsFile`).
 */
export const fileTransfer = (...files: File[]) => ({
  types: ['Files'],
  dropEffect: 'none',
  items: files.map(file => ({
    kind: 'file',
    type: file.type,
    getAsFile: () => file,
    webkitGetAsEntry: () => ({ isFile: true, isDirectory: false, name: file.name }),
  })),
  files,
});

/** Drag files over `el`; returns whether the dragover's default was left alone. */
export const dragOver = (el: HTMLElement, ...files: File[]) =>
  fireEvent.dragOver(el, { dataTransfer: fileTransfer(...files) });

/** Drop files on `el`; returns `false` when the default (the browser opening the file) was prevented. */
export const drop = (el: HTMLElement, ...files: File[]) =>
  fireEvent.drop(el, { dataTransfer: fileTransfer(...files) });

/**
 * zag opens the picker in a later animation frame (`raf(() => input.click())`); await this
 * before asserting the picker did NOT open, or the assertion runs before the click could happen.
 */
export const nextFrame = () => new Promise(resolve => requestAnimationFrame(() => resolve(null)));

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
