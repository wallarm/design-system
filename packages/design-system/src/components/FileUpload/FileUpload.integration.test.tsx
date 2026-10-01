import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, FieldLabel } from '../Field';
import { FileUpload } from './FileUpload';
import { byTestId, hiddenInput, makeFile, pick } from './FileUpload.test.helpers';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadItem } from './FileUploadItem';
import { FileUploadItemDeleteTrigger } from './FileUploadItemDeleteTrigger';
import { FileUploadItemGroup } from './FileUploadItemGroup';
import { FileUploadTrigger } from './FileUploadTrigger';

afterEach(() => {
  rs.restoreAllMocks();
});

const Tree = ({ loading, withRow = true }: { loading?: boolean; withRow?: boolean }) => (
  <FileUpload data-testid='fu' maxFiles={3}>
    <FileUploadDropzone />
    <FileUploadTrigger />
    {withRow ? (
      <FileUploadItemGroup>
        <FileUploadItem file={{ name: 'up.wasm' }} loading={loading}>
          <FileUploadItemDeleteTrigger />
        </FileUploadItem>
      </FileUploadItemGroup>
    ) : null}
  </FileUpload>
);

const expectLocked = () => {
  expect(byTestId('fu--dropzone')).toHaveAttribute('aria-disabled', 'true');
  expect(byTestId('fu--dropzone')).toHaveAttribute('data-disabled');
  expect(byTestId('fu--trigger')).toBeDisabled();
};

const expectReleased = () => {
  expect(byTestId('fu--dropzone')).not.toHaveAttribute('aria-disabled');
  expect(byTestId('fu--dropzone')).not.toHaveAttribute('data-disabled');
  expect(byTestId('fu--trigger')).toBeEnabled();
};

describe('FileUpload — loading row locks the pickers (integration)', () => {
  it('locks the Dropzone and Trigger while Delete (Cancel) stays enabled', () => {
    render(<Tree loading />);
    expectLocked();
    expect(screen.getByRole('button', { name: 'Cancel upload' })).toBeEnabled();
  });

  it('a locked Dropzone click does not open the picker', async () => {
    const click = rs.spyOn(HTMLInputElement.prototype, 'click');
    render(<Tree loading />);
    await userEvent.click(byTestId('fu--dropzone'));
    // Ark opens the picker asynchronously: give it the same window the control test needs.
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(click).not.toHaveBeenCalled();
  });

  it('an unlocked Dropzone click opens the picker (control for the lock test)', async () => {
    const click = rs.spyOn(HTMLInputElement.prototype, 'click');
    render(<Tree loading={false} />);
    await userEvent.click(byTestId('fu--dropzone'));
    await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
  });

  it('unmounting the loading row releases the lock (review focus #5)', () => {
    const { rerender } = render(<Tree loading />);
    expectLocked();
    rerender(<Tree withRow={false} />);
    expectReleased();
  });

  it('toggling loading to false releases the lock', () => {
    const { rerender } = render(<Tree loading />);
    expectLocked();
    rerender(<Tree loading={false} />);
    expectReleased();
  });

  it('two loading rows hold the lock until both are gone', () => {
    const Two = ({ second }: { second: boolean }) => (
      <FileUpload data-testid='fu' maxFiles={3}>
        <FileUploadDropzone />
        <FileUploadTrigger />
        <FileUploadItemGroup>
          <FileUploadItem file={{ name: 'a.wasm' }} loading />
          {second ? <FileUploadItem file={{ name: 'b.wasm' }} loading /> : null}
        </FileUploadItemGroup>
      </FileUpload>
    );
    const { rerender } = render(<Two second />);
    rerender(<Two second={false} />);
    expectLocked();
  });

  it('a click on the Field label does not open the picker while a row is uploading (single mode)', async () => {
    const onValueChange = rs.fn();
    const { container } = render(
      <Field>
        <FieldLabel>WASM module</FieldLabel>
        <FileUpload data-testid='fu' onValueChange={onValueChange}>
          <FileUploadDropzone />
          <FileUploadItemGroup>
            {file => <FileUploadItem file={file} loading />}
          </FileUploadItemGroup>
        </FileUpload>
      </Field>,
    );
    pick(container, makeFile('a.wasm'));
    await waitFor(() => expect(byTestId('fu--dropzone')).toHaveAttribute('aria-disabled', 'true'));
    const clicks: Event[] = [];
    hiddenInput(container).addEventListener('click', event => clicks.push(event));
    await userEvent.click(screen.getByText('WASM module'));
    // The label does reach the input; the DS cancels the click, so no file dialog opens.
    expect(clicks).toHaveLength(1);
    expect(clicks[0]?.defaultPrevented).toBe(true);
    expect(byTestId('fu--item')).toHaveTextContent('a.wasm');
  });

  it('a click on the Field label opens the picker when nothing is uploading (control)', async () => {
    const { container } = render(
      <Field>
        <FieldLabel>WASM module</FieldLabel>
        <FileUpload data-testid='fu'>
          <FileUploadDropzone />
        </FileUpload>
      </Field>,
    );
    const clicks: Event[] = [];
    hiddenInput(container).addEventListener('click', event => clicks.push(event));
    await userEvent.click(screen.getByText('WASM module'));
    expect(clicks).toHaveLength(1);
    expect(clicks[0]?.defaultPrevented).toBe(false);
  });
});
