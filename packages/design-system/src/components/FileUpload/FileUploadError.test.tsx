import type { ComponentProps } from 'react';
import { describe, expect, it, rs } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FileUpload } from './FileUpload';
import { byTestId, makeFile, pick, queryByTestId, Uploader } from './FileUpload.test.helpers';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadError } from './FileUploadError';

describe('FileUpload — rejections', () => {
  const Rejecting = (props: Partial<ComponentProps<typeof FileUpload>>) => (
    <Uploader accept='.so,.dylib' maxFileSize={32 * 1024 ** 2} {...props} />
  );

  it('renders nothing until a file is rejected', () => {
    render(<Rejecting />);
    expect(queryByTestId('fu--rejections')).toBeNull();
  });

  it('names the file and the type rule, marks the Area invalid, and describes it', async () => {
    const onFileReject = rs.fn();
    const { container } = render(<Rejecting onFileReject={onFileReject} />);
    pick(container, makeFile('policy.txt', 3, 'text/plain'));
    const error = await screen.findByTestId('fu--rejections');
    expect(error).toHaveAttribute('role', 'alert');
    expect(error).toHaveTextContent('policy.txt — Not a .so / .dylib file');
    expect(byTestId('fu--dropzone')).toHaveAttribute('data-invalid');
    expect(byTestId('fu--dropzone')).toHaveAttribute('aria-describedby', error.id);
    expect(onFileReject).toHaveBeenCalledWith([
      expect.objectContaining({ errors: ['FILE_INVALID_TYPE'] }),
    ]);
  });

  it('states size and limit for an oversized file', async () => {
    const { container } = render(<Rejecting maxFileSize={10} />);
    pick(container, makeFile('big.so', 20));
    expect(await screen.findByTestId('fu--rejections')).toHaveTextContent(
      'big.so — Too large: 20 B; the limit is 10 B',
    );
  });

  it('keeps the existing file when a replacement is rejected, and clears on the next good pick', async () => {
    const { container } = render(<Rejecting />);
    pick(container, makeFile('good.so'));
    await screen.findByTestId('fu--item');
    pick(container, makeFile('bad.txt'));
    await screen.findByTestId('fu--rejections');
    expect(byTestId('fu--item')).toHaveTextContent('good.so');
    // single mode: the picker stays, and a re-pick goes through the hidden input
    pick(container, makeFile('better.so'));
    await waitFor(() => expect(queryByTestId('fu--rejections')).toBeNull());
    await waitFor(() => expect(byTestId('fu--item')).toHaveTextContent('better.so'));
  });

  it('ignores re-picking the identical file in single mode', async () => {
    const onFileReject = rs.fn();
    const { container } = render(<Rejecting onFileReject={onFileReject} />);
    const file = makeFile('same.so');
    pick(container, file);
    await screen.findByTestId('fu--item');
    pick(container, file);
    // let any async Ark reporting flush before asserting absence
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(queryByTestId('fu--rejections')).toBeNull();
    expect(onFileReject).not.toHaveBeenCalled();
  });

  it('reports duplicates and TOO_MANY_FILES in multiple mode', async () => {
    const { container } = render(<Rejecting maxFiles={2} />);
    const file = makeFile('a.so');
    pick(container, file);
    await screen.findByTestId('fu--item');
    pick(container, file);
    await waitFor(() =>
      expect(byTestId('fu--rejections')).toHaveTextContent('a.so — Already added'),
    );
    pick(container, makeFile('b.so'), makeFile('c.so'));
    await waitFor(() =>
      expect(byTestId('fu--rejections')).toHaveTextContent('Too many files; the limit is 2'),
    );
  });

  it('shows custom validate() messages verbatim and allows a message override', async () => {
    const { container } = render(
      <Uploader validate={f => (f.name.startsWith('x') ? ['Missing spe_init export'] : null)}>
        <FileUploadDropzone />
        <FileUploadError>{(r, code) => `${code}: ${r.file.name}`}</FileUploadError>
      </Uploader>,
    );
    pick(container, makeFile('x.wasm'));
    expect(await screen.findByTestId('fu--rejections')).toHaveTextContent(
      'Missing spe_init export: x.wasm',
    );
  });

  it('Delete clears a showing rejection (review focus #4)', async () => {
    const { container } = render(<Uploader accept='.wasm' maxFiles={3} />);
    pick(container, makeFile('a.wasm'));
    await screen.findByTestId('fu--item');
    pick(container, makeFile('bad.txt'));
    await screen.findByTestId('fu--rejections');
    await userEvent.click(screen.getByRole('button', { name: 'Delete a.wasm' }));
    await waitFor(() => expect(queryByTestId('fu--rejections')).toBeNull());
  });

  it('an invalid multi-mode replacement names the new file inline (review focus #2)', async () => {
    const { container } = render(<Uploader maxFiles={3} accept='.wasm' />);
    pick(container, makeFile('a.wasm'), makeFile('b.wasm'));
    await waitFor(() => expect(screen.getAllByTestId('fu--item')).toHaveLength(2));
    const replaceInputs = container.querySelectorAll<HTMLInputElement>(
      '[data-slot="file-upload-item-replace-input"]',
    );
    fireEvent.change(replaceInputs[0] as HTMLInputElement, {
      target: { files: [makeFile('evil.txt')] },
    });
    expect(await screen.findByTestId('fu--rejections')).toHaveTextContent(
      'evil.txt — Not a .wasm file',
    );
    expect(screen.getAllByTestId('fu--item-name').map(n => n.textContent)).toEqual([
      'a.wasm',
      'b.wasm',
    ]);
  });
});
