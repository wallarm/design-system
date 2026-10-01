import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { Field, FieldError, FieldLabel } from '../Field';
import { FileUpload } from './FileUpload';
import { byTestId, makeFile, pick, queryByTestId } from './FileUpload.test.helpers';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadError } from './FileUploadError';
import { FileUploadItem } from './FileUploadItem';
import { FileUploadItemAction } from './FileUploadItemAction';
import { FileUploadItemDeleteTrigger } from './FileUploadItemDeleteTrigger';
import { FileUploadItemGroup } from './FileUploadItemGroup';
import { FileUploadItemReplaceTrigger } from './FileUploadItemReplaceTrigger';

const allTestIds = (container: HTMLElement) =>
  [...container.querySelectorAll('[data-testid]')].map(el => el.getAttribute('data-testid'));

describe('FileUpload — test ids', () => {
  it('FileUploadError uses the `rejections` slot, so it never collides with FieldError', async () => {
    const { container } = render(
      <Field data-testid='artifact' invalid>
        <FieldLabel>Artifact</FieldLabel>
        <FileUpload name='a' accept='.wasm'>
          <FileUploadDropzone />
          <FileUploadError />
        </FileUpload>
        <FieldError>Attach a file</FieldError>
      </Field>,
    );
    pick(container, makeFile('policy.txt', 3, 'text/plain'));
    expect(await screen.findByTestId('artifact--rejections')).toHaveTextContent(
      'policy.txt — Not a .wasm file',
    );
    expect(byTestId('artifact--error')).toHaveTextContent('Attach a file');
    const ids = allTestIds(container);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('Dropzone and Error honour a consumer data-testid', async () => {
    const { container } = render(
      <FileUpload accept='.wasm'>
        <FileUploadDropzone data-testid='policy-drop' />
        <FileUploadError data-testid='policy-error' />
      </FileUpload>,
    );
    expect(byTestId('policy-drop')).toHaveAttribute('data-slot', 'file-upload-dropzone');
    pick(container, makeFile('policy.txt', 3, 'text/plain'));
    expect(await screen.findByTestId('policy-error')).toHaveAttribute(
      'data-slot',
      'file-upload-error',
    );
  });

  it('a consumer data-testid on Dropzone wins over the cascade', () => {
    render(
      <FileUpload data-testid='fu'>
        <FileUploadDropzone data-testid='policy-drop' />
      </FileUpload>,
    );
    expect(byTestId('policy-drop')).toBeInTheDocument();
    expect(queryByTestId('fu--dropzone')).toBeNull();
  });

  it('a standalone stored-file group re-provides the cascade to its rows and actions', () => {
    render(
      <FileUploadItemGroup data-testid='stored'>
        <FileUploadItem file={{ name: 'policy.wasm' }} description='48 KB · attached'>
          <FileUploadItemAction aria-label='Download policy.wasm'>
            <span />
          </FileUploadItemAction>
          <FileUploadItemDeleteTrigger aria-label='Detach artifact' />
        </FileUploadItem>
      </FileUploadItemGroup>,
    );
    expect(byTestId('stored')).toHaveAttribute('data-slot', 'file-upload-item-group');
    expect(byTestId('stored--item')).toHaveTextContent('policy.wasm');
    expect(byTestId('stored--item-name')).toHaveTextContent('policy.wasm');
    expect(byTestId('stored--item-description')).toHaveTextContent('48 KB · attached');
    expect(byTestId('stored--item-action')).toHaveAccessibleName('Download policy.wasm');
    expect(byTestId('stored--item-delete-trigger')).toHaveAccessibleName('Detach artifact');
  });

  it('an own data-testid on one row names that row’s parts', async () => {
    const { container } = render(
      <FileUpload data-testid='fu' maxFiles={3}>
        <FileUploadItemGroup>
          {file => (
            <FileUploadItem file={file} data-testid={`row-${file.name}`}>
              <FileUploadItemReplaceTrigger />
              <FileUploadItemDeleteTrigger />
            </FileUploadItem>
          )}
        </FileUploadItemGroup>
      </FileUpload>,
    );
    pick(container, makeFile('a.wasm'), makeFile('b.wasm'));
    expect(await screen.findByTestId('row-a.wasm')).toHaveAttribute(
      'data-slot',
      'file-upload-item',
    );
    expect(byTestId('row-a.wasm--item-name')).toHaveTextContent('a.wasm');
    expect(byTestId('row-b.wasm--item-delete-trigger')).toHaveAccessibleName('Delete b.wasm');
    expect(byTestId('row-b.wasm--item-replace-trigger')).toHaveAccessibleName('Replace b.wasm');
    // the group keeps the root cascade
    expect(byTestId('fu--item-group')).toBeInTheDocument();
  });
});
