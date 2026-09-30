import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Field, FieldLabel } from '../Field';
import { FileUpload } from './FileUpload';
import { byTestId, hiddenInput, makeFile, pick, queryByTestId } from './FileUpload.test.helpers';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadTrigger } from './FileUploadTrigger';

describe('FileUpload — pickers', () => {
  it('renders the default Area with a role=button named by its text', () => {
    render(
      <FileUpload data-testid='fu'>
        <FileUploadDropzone />
      </FileUpload>,
    );
    const dz = byTestId('fu--dropzone');
    expect(dz).toHaveAttribute('data-slot', 'file-upload-dropzone');
    expect(dz).toHaveAttribute('role', 'button');
    expect(dz).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('button', { name: 'Drag and drop files or click to select' })).toBe(dz);
  });

  it('is named by the Field label plus its text', () => {
    render(
      <Field>
        <FieldLabel>WASM module</FieldLabel>
        <FileUpload>
          <FileUploadDropzone />
        </FileUpload>
      </Field>,
    );
    expect(
      screen.getByRole('button', { name: 'WASM module Drag and drop files or click to select' }),
    ).toBeInTheDocument();
  });

  it('is named by its own text inside a Field with no label', () => {
    render(
      <Field>
        <FileUpload>
          <FileUploadDropzone />
        </FileUpload>
      </Field>,
    );
    expect(
      screen.getByRole('button', { name: 'Drag and drop files or click to select' }),
    ).toBeInTheDocument();
  });

  it('opens the native picker on click and on Enter', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    render(
      <FileUpload data-testid='fu'>
        <FileUploadDropzone />
      </FileUpload>,
    );
    await userEvent.click(byTestId('fu--dropzone'));
    await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
    byTestId('fu--dropzone').focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(click).toHaveBeenCalledTimes(2));
    click.mockRestore();
  });

  it('renders the Button trigger with default content and opens the picker', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    render(
      <FileUpload data-testid='fu'>
        <FileUploadTrigger />
      </FileUpload>,
    );
    const trigger = screen.getByRole('button', { name: 'Select file' });
    expect(trigger).toHaveAttribute('data-testid', 'fu--trigger');
    await userEvent.click(trigger);
    await waitFor(() => expect(click).toHaveBeenCalled());
    click.mockRestore();
  });

  it('hides the pickers in single mode once a file is chosen', async () => {
    const { container } = render(
      <FileUpload data-testid='fu'>
        <FileUploadDropzone />
        <FileUploadTrigger />
      </FileUpload>,
    );
    pick(container, makeFile());
    await waitFor(() => expect(queryByTestId('fu--dropzone')).toBeNull());
    expect(queryByTestId('fu--trigger')).toBeNull();
    expect(hiddenInput(container)).toBeInTheDocument();
  });

  it('keeps the Area in multiple mode and blocks it at maxFiles', async () => {
    const { container } = render(
      <FileUpload data-testid='fu' maxFiles={2}>
        <FileUploadDropzone />
      </FileUpload>,
    );
    pick(container, makeFile('a.wasm'));
    await waitFor(() => expect(byTestId('fu--dropzone')).not.toHaveAttribute('data-disabled'));
    pick(container, makeFile('b.wasm'));
    await waitFor(() => expect(byTestId('fu--dropzone')).toHaveAttribute('data-disabled'));
    expect(byTestId('fu--dropzone')).toHaveAttribute('aria-disabled', 'true');
  });

  it('is inert when disabled and hidden when read-only (also via Field)', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    const { unmount } = render(
      <Field disabled>
        <FileUpload data-testid='fu'>
          <FileUploadDropzone />
          <FileUploadTrigger />
        </FileUpload>
      </Field>,
    );
    expect(byTestId('fu--dropzone')).toHaveAttribute('data-disabled');
    expect(byTestId('fu--trigger')).toBeDisabled();
    await userEvent.click(byTestId('fu--dropzone'));
    expect(click).not.toHaveBeenCalled();
    unmount();
    render(
      <Field readOnly>
        <FileUpload data-testid='fu'>
          <FileUploadDropzone />
          <FileUploadTrigger />
        </FileUpload>
      </Field>,
    );
    expect(queryByTestId('fu--dropzone')).toBeNull();
    expect(queryByTestId('fu--trigger')).toBeNull();
    click.mockRestore();
  });

  it('marks the Area invalid from Field', () => {
    render(
      <Field invalid>
        <FileUpload data-testid='fu'>
          <FileUploadDropzone />
        </FileUpload>
      </Field>,
    );
    expect(byTestId('fu--dropzone')).toHaveAttribute('data-invalid');
  });

  it('accepts custom text and icon', () => {
    render(
      <FileUpload data-testid='fu'>
        <FileUploadDropzone icon={<span data-testid='icon' />}>
          Choose a .wasm module or drop it here
        </FileUploadDropzone>
      </FileUpload>,
    );
    expect(
      screen.getByRole('button', { name: 'Choose a .wasm module or drop it here' }),
    ).toBeInTheDocument();
    expect(byTestId('icon')).toBeInTheDocument();
  });
});
