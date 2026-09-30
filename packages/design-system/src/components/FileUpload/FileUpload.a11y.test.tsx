import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FileUpload } from './FileUpload';
import { byTestId, makeFile, pick, Uploader } from './FileUpload.test.helpers';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadError } from './FileUploadError';
import { FileUploadItem } from './FileUploadItem';
import { FileUploadItemAction } from './FileUploadItemAction';
import { FileUploadItemDeleteTrigger } from './FileUploadItemDeleteTrigger';
import { FileUploadItemGroup } from './FileUploadItemGroup';
import { FileUploadItemReplaceTrigger } from './FileUploadItemReplaceTrigger';
import { FileUploadTrigger } from './FileUploadTrigger';

const reject = async (container: HTMLElement) => {
  pick(container, makeFile('policy.txt', 3, 'text/plain'));
  return screen.findByTestId('fu--rejections');
};

describe('FileUpload — consumer aria on the pickers', () => {
  it('Dropzone merges a consumer aria-describedby with the error link', async () => {
    const { container } = render(
      <FileUpload data-testid='fu' accept='.wasm'>
        <FileUploadDropzone aria-describedby='wasm-hint' />
        <FileUploadError />
      </FileUpload>,
    );
    expect(byTestId('fu--dropzone')).toHaveAttribute('aria-describedby', 'wasm-hint');
    const error = await reject(container);
    expect(byTestId('fu--dropzone')).toHaveAttribute('aria-describedby', `wasm-hint ${error.id}`);
  });

  it('Trigger merges a consumer aria-describedby with the error link', async () => {
    const { container } = render(
      <FileUpload data-testid='fu' accept='.wasm'>
        <FileUploadTrigger aria-describedby='wasm-hint' />
        <FileUploadError />
      </FileUpload>,
    );
    const error = await reject(container);
    expect(byTestId('fu--trigger')).toHaveAttribute('aria-describedby', `wasm-hint ${error.id}`);
  });

  it('a consumer aria-label names the Dropzone (the default aria-labelledby steps aside)', () => {
    render(
      <FileUpload data-testid='fu'>
        <FileUploadDropzone aria-label='Upload the policy module' />
      </FileUpload>,
    );
    expect(byTestId('fu--dropzone')).not.toHaveAttribute('aria-labelledby');
    expect(byTestId('fu--dropzone')).toHaveAccessibleName('Upload the policy module');
  });
});

describe('FileUpload — disabled row actions show no tooltip', () => {
  it.each([['fu--item-delete-trigger'], ['fu--item-replace-trigger'], ['fu--item-action']])(
    '%s',
    async testId => {
      render(
        <FileUpload data-testid='fu' disabled defaultValue={[makeFile('a.wasm')]}>
          <FileUploadItemGroup>
            {file => (
              <FileUploadItem file={file}>
                <FileUploadItemReplaceTrigger />
                <FileUploadItemAction aria-label='Download a.wasm'>
                  <span />
                </FileUploadItemAction>
                <FileUploadItemDeleteTrigger />
              </FileUploadItem>
            )}
          </FileUploadItemGroup>
        </FileUpload>,
      );
      const button = await screen.findByTestId(testId);
      expect(button).toBeDisabled();
      // Browsers still send pointer events to a disabled button; React does not block them.
      fireEvent.pointerMove(button, { pointerType: 'mouse' });
      fireEvent.pointerEnter(button, { pointerType: 'mouse' });
      await new Promise(resolve => setTimeout(resolve, 600));
      expect(screen.queryByRole('tooltip')).toBeNull();
    },
  );
});

describe('FileUpload — focus after Delete', () => {
  const rows = () => screen.queryAllByTestId('fu--item');

  it('moves focus to the next row’s Delete', async () => {
    const { container } = render(<Uploader maxFiles={3} />);
    pick(container, makeFile('a.wasm'), makeFile('b.wasm'), makeFile('c.wasm'));
    await waitFor(() => expect(rows()).toHaveLength(3));
    screen.getByRole('button', { name: 'Delete b.wasm' }).focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(rows()).toHaveLength(2));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Delete c.wasm' })).toHaveFocus(),
    );
  });

  it('moves focus to the previous row’s Delete when the last row goes', async () => {
    const { container } = render(<Uploader maxFiles={3} />);
    pick(container, makeFile('a.wasm'), makeFile('b.wasm'));
    await waitFor(() => expect(rows()).toHaveLength(2));
    screen.getByRole('button', { name: 'Delete b.wasm' }).focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Delete a.wasm' })).toHaveFocus(),
    );
  });

  it('moves focus back to the picker when no row is left', async () => {
    const { container } = render(<Uploader />);
    pick(container, makeFile('a.wasm'));
    await waitFor(() => expect(rows()).toHaveLength(1));
    screen.getByRole('button', { name: 'Delete a.wasm' }).focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(rows()).toHaveLength(0));
    await waitFor(() => expect(byTestId('fu--dropzone')).toHaveFocus());
  });
});
