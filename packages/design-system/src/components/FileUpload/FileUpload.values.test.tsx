import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FileUpload } from './FileUpload';
import {
  byTestId,
  hiddenInput,
  installDataTransfer,
  makeFile,
  pick,
  queryByTestId,
  Uploader,
} from './FileUpload.test.helpers';
import { FileUploadItem } from './FileUploadItem';
import { FileUploadItemGroup } from './FileUploadItemGroup';
import { FileUploadItemReplaceTrigger } from './FileUploadItemReplaceTrigger';

let uninstall: () => void;
beforeEach(() => {
  uninstall = installDataTransfer();
});
afterEach(() => {
  uninstall();
  rs.restoreAllMocks();
});

/** `toHaveBeenCalledWith` compares Files structurally (equal name/size/type pass) — check identity. */
const lastFiles = (spy: ReturnType<typeof rs.fn>) => spy.mock.lastCall?.[0] as File[] | undefined;

const names = () => screen.getAllByTestId('fu--item-name').map(n => n.textContent);
const replaceInput = (container: HTMLElement, index: number) =>
  container.querySelectorAll<HTMLInputElement>('[data-slot="file-upload-item-replace-input"]')[
    index
  ] as HTMLInputElement;
const replaceWith = (container: HTMLElement, index: number, file: File) =>
  fireEvent.change(replaceInput(container, index), { target: { files: [file] } });

describe('FileUpload — initial files go with the form', () => {
  it.each(['defaultValue', 'value'] as const)(
    '%s files reach the hidden input, so native FormData includes them',
    async prop => {
      const file = makeFile('draft.wasm');
      const { container } = render(
        <form data-testid='form'>
          <FileUpload name='artifact' {...{ [prop]: [file] }} />
        </form>,
      );
      await waitFor(() => expect(hiddenInput(container).files?.[0]).toBe(file));
      expect(hiddenInput(container).files).toHaveLength(1);
      const data = new FormData(byTestId('form') as HTMLFormElement);
      expect(data.get('artifact')).toBe(file);
    },
  );

  it('leaves the hidden input empty when nothing is held', async () => {
    const { container } = render(<FileUpload name='artifact' />);
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(hiddenInput(container).files).toHaveLength(0);
  });
});

describe('FileUpload — re-picking an edited file with the same name, size and type', () => {
  it('single mode takes the edited file (newer lastModified) instead of ignoring it', async () => {
    const onValueChange = rs.fn();
    const { container } = render(<Uploader onValueChange={onValueChange} />);
    const original = makeFile('rules.lua', 5, 'text/x-lua', 1_000);
    const edited = makeFile('rules.lua', 5, 'text/x-lua', 2_000);
    pick(container, original);
    await waitFor(() => expect(lastFiles(onValueChange)?.[0]).toBe(original));
    pick(container, edited);
    await waitFor(() => expect(lastFiles(onValueChange)?.[0]).toBe(edited));
    expect(lastFiles(onValueChange)).toHaveLength(1);
    expect(queryByTestId('fu--rejections')).toBeNull();
  });

  it('single mode still ignores the very same file (same lastModified)', async () => {
    const onValueChange = rs.fn();
    const { container } = render(<Uploader onValueChange={onValueChange} />);
    const file = makeFile('rules.lua', 5, 'text/x-lua', 1_000);
    pick(container, file);
    await waitFor(() => expect(onValueChange).toHaveBeenCalledTimes(1));
    pick(container, makeFile('rules.lua', 5, 'text/x-lua', 1_000));
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(queryByTestId('fu--rejections')).toBeNull();
  });

  it('multi-mode Replace with an edited copy of the same row takes it and reports it', async () => {
    const onValueChange = rs.fn();
    const { container } = render(<Uploader maxFiles={3} onValueChange={onValueChange} />);
    const a = makeFile('a.wasm', 3, 'application/wasm', 1_000);
    const b = makeFile('b.wasm', 3, 'application/wasm', 1_000);
    pick(container, a, b);
    await waitFor(() => expect(names()).toEqual(['a.wasm', 'b.wasm']));
    const edited = makeFile('a.wasm', 3, 'application/wasm', 2_000);
    replaceWith(container, 0, edited);
    await waitFor(() => expect(lastFiles(onValueChange)?.[0]).toBe(edited));
    expect(lastFiles(onValueChange)?.[1]).toBe(b);
    await waitFor(() => expect(hiddenInput(container).files?.[0]).toBe(edited));
  });
});

describe('FileUpload — multi-mode Replace with a copy of another listed file', () => {
  it('keeps every original and reports "Already added"', async () => {
    const onFileReject = rs.fn();
    const { container } = render(<Uploader maxFiles={3} onFileReject={onFileReject} />);
    const a = makeFile('a.wasm');
    const b = makeFile('b.wasm');
    pick(container, a, b);
    await waitFor(() => expect(names()).toEqual(['a.wasm', 'b.wasm']));
    const copyOfB = makeFile('b.wasm');
    replaceWith(container, 0, copyOfB);
    expect(await screen.findByTestId('fu--rejections')).toHaveTextContent('b.wasm — Already added');
    expect(names()).toEqual(['a.wasm', 'b.wasm']);
    expect(onFileReject).toHaveBeenLastCalledWith([{ file: copyOfB, errors: ['FILE_EXISTS'] }]);
  });
});

describe('FileUpload — Replace outside a picked File', () => {
  it('renders nothing in a standalone (stored-file) row instead of throwing', () => {
    render(
      <FileUploadItemGroup>
        <FileUploadItem data-testid='row' file={{ name: 'stored.wasm' }}>
          <FileUploadItemReplaceTrigger data-testid='replace' />
        </FileUploadItem>
      </FileUploadItemGroup>,
    );
    expect(byTestId('row')).toHaveTextContent('stored.wasm');
    expect(queryByTestId('replace')).toBeNull();
  });

  it('is hidden on a stored { name } row in multiple mode (a pick there would be discarded)', () => {
    render(
      <FileUpload data-testid='fu' maxFiles={3}>
        <FileUploadItemGroup>
          <FileUploadItem file={{ name: 'stored.wasm' }}>
            <FileUploadItemReplaceTrigger />
          </FileUploadItem>
        </FileUploadItemGroup>
      </FileUpload>,
    );
    expect(queryByTestId('fu--item-replace-trigger')).toBeNull();
  });

  it('stays on a stored { name } row in single mode (a new pick replaces the held file)', () => {
    render(
      <FileUpload data-testid='fu'>
        <FileUploadItemGroup>
          <FileUploadItem file={{ name: 'stored.wasm' }}>
            <FileUploadItemReplaceTrigger />
          </FileUploadItem>
        </FileUploadItemGroup>
      </FileUpload>,
    );
    expect(byTestId('fu--item-replace-trigger')).toBeInTheDocument();
  });
});
