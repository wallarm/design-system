import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { FileUpload } from './FileUpload';
import { byTestId, hiddenInput, makeFile, pick, Uploader } from './FileUpload.test.helpers';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadItem } from './FileUploadItem';
import { FileUploadItemAction } from './FileUploadItemAction';
import { FileUploadItemDeleteTrigger } from './FileUploadItemDeleteTrigger';
import { FileUploadItemGroup } from './FileUploadItemGroup';
import { FileUploadItemReplaceTrigger } from './FileUploadItemReplaceTrigger';
import { FileUploadTrigger } from './FileUploadTrigger';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('FileUpload — analytics & test ids (docs/metrics/contract.md)', () => {
  const PROPS = '{"surface":"flow-policy","kind":"wasm"}';

  it('lands data-analytics-* on the real Dropzone node, verbatim, and captures clicks', async () => {
    const spy = captureAnalyticsClicks();
    render(
      <FileUpload data-testid='fu'>
        <FileUploadDropzone data-analytics-id='ARTIFACT_DROPZONE' data-analytics-props={PROPS} />
      </FileUpload>,
    );
    const dz = byTestId('fu--dropzone');
    expect(dz.tagName).toBe('DIV');
    expect(dz).toHaveAttribute('role', 'button');
    expect(dz.getAttribute('data-analytics-props')).toBe(PROPS);
    await userEvent.click(dz);
    expect(spy).toHaveBeenCalledWith('ARTIFACT_DROPZONE');
  });

  it('never puts the analytics id on the hidden input', () => {
    const { container } = render(
      <FileUpload>
        <FileUploadDropzone data-analytics-id='ARTIFACT_DROPZONE' />
        <FileUploadTrigger data-analytics-id='ARTIFACT_PICK' />
      </FileUpload>,
    );
    expect(hiddenInput(container)).not.toHaveAttribute('data-analytics-id');
  });

  it('lands data-analytics-* on the Trigger button and every row action button', async () => {
    const { container } = render(
      <Uploader maxFiles={2}>
        <FileUploadTrigger data-analytics-id='ARTIFACT_PICK' />
        <FileUploadItemGroup>
          {file => (
            <FileUploadItem file={file}>
              <FileUploadItemReplaceTrigger data-analytics-id='ARTIFACT_REPLACE' />
              <FileUploadItemAction data-analytics-id='ARTIFACT_DOWNLOAD' aria-label='Download'>
                <span />
              </FileUploadItemAction>
              <FileUploadItemDeleteTrigger
                data-analytics-id='ARTIFACT_DELETE'
                data-analytics-props={PROPS}
              />
            </FileUploadItem>
          )}
        </FileUploadItemGroup>
      </Uploader>,
    );
    pick(container, makeFile());
    await screen.findByTestId('fu--item');
    for (const id of [
      'ARTIFACT_PICK',
      'ARTIFACT_REPLACE',
      'ARTIFACT_DOWNLOAD',
      'ARTIFACT_DELETE',
    ]) {
      const node = container.querySelector(`[data-analytics-id="${id}"]`);
      expect(node?.tagName).toBe('BUTTON');
    }
    expect(byTestId('fu--item-delete-trigger').getAttribute('data-analytics-props')).toBe(PROPS);
  });

  it('keeps the Dropzone analytics id after a file is added (multiple mode)', async () => {
    const { container } = render(
      <FileUpload data-testid='fu' maxFiles={3}>
        <FileUploadDropzone data-analytics-id='ARTIFACT_DROPZONE' />
        <FileUploadItemGroup>{file => <FileUploadItem file={file} />}</FileUploadItemGroup>
      </FileUpload>,
    );
    pick(container, makeFile());
    await screen.findByTestId('fu--item');
    expect(byTestId('fu--dropzone')).toHaveAttribute('data-analytics-id', 'ARTIFACT_DROPZONE');
  });

  it('composes consumer handlers on the Dropzone and respects preventDefault', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    const onClick = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <FileUpload data-testid='fu'>
        <FileUploadDropzone onClick={onClick} />
      </FileUpload>,
    );
    await userEvent.click(byTestId('fu--dropzone'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(click).not.toHaveBeenCalled();
  });

  it('a consumer data-testid on a part wins over the cascade', () => {
    render(
      <FileUpload data-testid='fu'>
        <FileUploadTrigger data-testid='artifact-pick' />
      </FileUpload>,
    );
    expect(byTestId('artifact-pick')).toHaveAttribute('data-slot', 'file-upload-trigger');
  });

  it('leaves the DOM free of data-testid when none is passed', () => {
    const { container } = render(<Uploader data-testid={undefined} />);
    expect(container.querySelector('[data-testid]')).toBeNull();
  });
});
