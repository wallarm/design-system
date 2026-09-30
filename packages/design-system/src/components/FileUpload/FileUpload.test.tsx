import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Field } from '../Field';
import { FileUpload } from './FileUpload';
import { byTestId, hiddenInput, makeFile, pick } from './FileUpload.test.helpers';

describe('FileUpload — root', () => {
  it('renders a div root with slot + testid and a named hidden file input', () => {
    const { container } = render(<FileUpload data-testid='fu' name='artifact' accept='.wasm' />);
    const root = byTestId('fu');
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveAttribute('data-slot', 'file-upload');
    const input = hiddenInput(container);
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('name', 'artifact');
    expect(input).toHaveAttribute('accept', '.wasm');
    expect(input).toHaveAttribute('data-testid', 'fu--hidden-input');
    expect(input).not.toHaveAttribute('multiple');
  });

  it('sets `multiple` on the hidden input when maxFiles > 1', () => {
    const { container } = render(<FileUpload maxFiles={3} />);
    expect(hiddenInput(container)).toHaveAttribute('multiple');
  });

  it('holds a picked file in the hidden input (nothing is uploaded) and reports it', async () => {
    const onValueChange = vi.fn();
    const { container } = render(<FileUpload name='artifact' onValueChange={onValueChange} />);
    const file = makeFile();
    pick(container, file);
    // Ark reports the accepted list asynchronously after the input event.
    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith([file]));
    expect(hiddenInput(container).files?.[0]?.name).toBe('policy.wasm');
  });

  it('works controlled, and a re-render with an equal new array does not re-fire onValueChange', () => {
    const onValueChange = vi.fn();
    const file = makeFile();
    const { rerender } = render(<FileUpload value={[file]} onValueChange={onValueChange} />);
    rerender(<FileUpload value={[makeFile()]} onValueChange={onValueChange} />);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('forwards consumer attributes and ref to the root div', () => {
    const ref = vi.fn();
    render(<FileUpload data-testid='fu' id='x' aria-label='Artifact' ref={ref} />);
    expect(byTestId('fu')).toHaveAttribute('id', 'x');
    expect(byTestId('fu')).toHaveAttribute('aria-label', 'Artifact');
    expect(ref).toHaveBeenCalledWith(byTestId('fu'));
  });

  it('reads required / disabled from Field', () => {
    const { container } = render(
      <Field required disabled>
        <FileUpload name='a' />
      </Field>,
    );
    expect(hiddenInput(container)).toBeRequired();
    expect(hiddenInput(container)).toBeDisabled();
  });

  it('inherits the Field test-id cascade when it has no data-testid of its own', () => {
    const { container } = render(
      <Field data-testid='field'>
        <FileUpload name='a' />
      </Field>,
    );
    expect(hiddenInput(container)).toHaveAttribute('data-testid', 'field--hidden-input');
    // no duplicate: only the Field root carries `field`
    expect(container.querySelectorAll('[data-testid="field"]')).toHaveLength(1);
  });
});
