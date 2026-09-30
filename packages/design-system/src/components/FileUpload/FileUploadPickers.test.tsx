import type { ComponentProps } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Field, FieldLabel } from '../Field';
import { FileUpload } from './FileUpload';
import {
  byTestId,
  dragOver,
  drop,
  hiddenInput,
  makeFile,
  nextFrame,
  pick,
  queryByTestId,
} from './FileUpload.test.helpers';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadItem } from './FileUploadItem';
import { FileUploadItemGroup } from './FileUploadItemGroup';
import { FileUploadTrigger } from './FileUploadTrigger';

afterEach(() => {
  vi.restoreAllMocks();
});

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
  });

  it('keeps the pickers in single mode once a file is chosen, and a new pick replaces the file', async () => {
    const { container } = render(
      <FileUpload data-testid='fu'>
        <FileUploadDropzone />
        <FileUploadTrigger />
        <FileUploadItemGroup>{file => <FileUploadItem file={file} />}</FileUploadItemGroup>
      </FileUpload>,
    );
    pick(container, makeFile('first.wasm'));
    await waitFor(() => expect(screen.getAllByTestId('fu--item')).toHaveLength(1));
    expect(byTestId('fu--dropzone')).toBeInTheDocument();
    expect(byTestId('fu--dropzone')).not.toHaveAttribute('data-disabled');
    expect(byTestId('fu--trigger')).toBeEnabled();
    expect(byTestId('fu--item')).toHaveTextContent('first.wasm');
    pick(container, makeFile('second.wasm'));
    await waitFor(() => expect(byTestId('fu--item')).toHaveTextContent('second.wasm'));
    expect(screen.getAllByTestId('fu--item')).toHaveLength(1);
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
    await nextFrame();
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

describe('FileUpload — drag and drop', () => {
  // zag reads the drop through a promise chain; give it a few ticks before asserting absence.
  const settle = () => new Promise(resolve => setTimeout(resolve, 50));

  const DnD = (props: Partial<ComponentProps<typeof FileUpload>> & { loading?: boolean }) => {
    const { loading, ...rest } = props;
    return (
      <FileUpload data-testid='fu' {...rest}>
        <FileUploadDropzone />
        <FileUploadItemGroup>{file => <FileUploadItem file={file} />}</FileUploadItemGroup>
        {loading !== undefined ? (
          <FileUploadItemGroup>
            <FileUploadItem file={{ name: 'up.wasm' }} loading={loading} />
          </FileUploadItemGroup>
        ) : null}
      </FileUpload>
    );
  };

  it('marks the Area while dragging over it and lists the dropped file', async () => {
    const onValueChange = vi.fn();
    render(<DnD onValueChange={onValueChange} />);
    const dz = byTestId('fu--dropzone');
    expect(dragOver(dz, makeFile('dropped.wasm'))).toBe(false);
    await waitFor(() => expect(dz).toHaveAttribute('data-dragging'));
    expect(drop(dz, makeFile('dropped.wasm'))).toBe(false);
    await waitFor(() => expect(byTestId('fu--item')).toHaveTextContent('dropped.wasm'));
    expect(onValueChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: 'dropped.wasm' }),
    ]);
    expect(dz).not.toHaveAttribute('data-dragging');
  });

  it('while a row is uploading, a drop on the Area is swallowed: the browser does not open it and no file is added', async () => {
    const onValueChange = vi.fn();
    render(<DnD maxFiles={3} loading onValueChange={onValueChange} />);
    const dz = byTestId('fu--dropzone');
    expect(dragOver(dz, makeFile('late.wasm'))).toBe(false);
    expect(dz).not.toHaveAttribute('data-dragging');
    expect(drop(dz, makeFile('late.wasm'))).toBe(false);
    await settle();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('a drop on a row inside the component never reaches the browser', () => {
    render(<DnD loading={false} />);
    expect(drop(byTestId('fu--item'), makeFile('late.wasm'))).toBe(false);
  });

  it('after an upload that was running at mount ends, a drop that misses the Area does not navigate away', () => {
    const { rerender } = render(<DnD loading />);
    rerender(<DnD loading={false} />);
    expect(dragOver(document.body, makeFile('late.wasm'))).toBe(false);
    expect(drop(document.body, makeFile('late.wasm'))).toBe(false);
  });

  it('when disabled, a drop on the Area is swallowed and adds nothing', async () => {
    const onValueChange = vi.fn();
    render(<DnD disabled onValueChange={onValueChange} />);
    const dz = byTestId('fu--dropzone');
    expect(dragOver(dz, makeFile('x.wasm'))).toBe(false);
    expect(drop(dz, makeFile('x.wasm'))).toBe(false);
    await settle();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('with allowDrop={false}, the Area accepts no drop and the browser does not open the file', async () => {
    const onValueChange = vi.fn();
    render(<DnD allowDrop={false} onValueChange={onValueChange} />);
    const dz = byTestId('fu--dropzone');
    expect(dragOver(dz, makeFile('x.wasm'))).toBe(false);
    expect(dz).not.toHaveAttribute('data-dragging');
    expect(drop(dz, makeFile('x.wasm'))).toBe(false);
    await settle();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('in multiple mode at maxFiles, drop is off: no TOO_MANY_FILES rejection', async () => {
    const onFileReject = vi.fn();
    const { container } = render(<DnD maxFiles={1 + 1} onFileReject={onFileReject} />);
    pick(container, makeFile('a.wasm'), makeFile('b.wasm'));
    await waitFor(() => expect(byTestId('fu--dropzone')).toHaveAttribute('data-disabled'));
    const dz = byTestId('fu--dropzone');
    expect(dragOver(dz, makeFile('c.wasm'))).toBe(false);
    expect(dz).not.toHaveAttribute('data-dragging');
    expect(drop(dz, makeFile('c.wasm'))).toBe(false);
    await settle();
    expect(onFileReject).not.toHaveBeenCalled();
    expect(screen.getAllByTestId('fu--item')).toHaveLength(2);
  });
});

describe('FileUploadTrigger asChild', () => {
  it('makes the child the trigger: no Button, attributes merged, picker opens', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    const onClick = vi.fn();
    render(
      <FileUpload data-testid='fu'>
        <FileUploadTrigger asChild data-analytics-id='AVATAR_PICK' variant='secondary' size='small'>
          <button type='button' aria-label='Change avatar' onClick={onClick} />
        </FileUploadTrigger>
      </FileUpload>,
    );
    const trigger = screen.getByRole('button', { name: 'Change avatar' });
    expect(trigger).toHaveAttribute('data-testid', 'fu--trigger');
    expect(trigger).toHaveAttribute('data-slot', 'file-upload-trigger');
    expect(trigger).toHaveAttribute('data-analytics-id', 'AVATAR_PICK');
    expect(trigger).not.toHaveAttribute('variant');
    expect(trigger).not.toHaveAttribute('size');
    expect(trigger.className).not.toMatch(/bg-/);
    await userEvent.click(trigger);
    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(click).toHaveBeenCalled());
  });

  it('is blocked while a row is loading and when disabled', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    const { unmount } = render(
      <FileUpload data-testid='fu' maxFiles={3}>
        <FileUploadTrigger asChild>
          <button type='button' aria-label='Change avatar' />
        </FileUploadTrigger>
        <FileUploadItemGroup>
          <FileUploadItem file={{ name: 'up.png' }} loading />
        </FileUploadItemGroup>
      </FileUpload>,
    );
    expect(byTestId('fu--trigger')).toBeDisabled();
    unmount();
    render(
      <FileUpload data-testid='fu'>
        <FileUploadTrigger asChild disabled>
          <button type='button' aria-label='Change avatar' />
        </FileUploadTrigger>
      </FileUpload>,
    );
    expect(byTestId('fu--trigger')).toBeDisabled();
    await userEvent.click(byTestId('fu--trigger'));
    await nextFrame();
    expect(click).not.toHaveBeenCalled();
  });

  it('renders nothing when read-only', () => {
    render(
      <FileUpload data-testid='fu' readOnly>
        <FileUploadTrigger asChild>
          <button type='button' aria-label='Change avatar' />
        </FileUploadTrigger>
      </FileUpload>,
    );
    expect(queryByTestId('fu--trigger')).toBeNull();
  });

  it('renders exactly as before without asChild', () => {
    render(
      <FileUpload data-testid='fu'>
        <FileUploadTrigger />
      </FileUpload>,
    );
    const trigger = screen.getByRole('button', { name: 'Select file' });
    expect(trigger).toHaveAttribute('data-slot', 'file-upload-trigger');
    expect(trigger.querySelector('svg')).not.toBeNull();
  });
});
