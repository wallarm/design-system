import type { ComponentProps } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FileUpload } from './FileUpload';
import { byTestId, makeFile, pick, queryByTestId } from './FileUpload.test.helpers';
import { FileUploadItem } from './FileUploadItem';
import { FileUploadItemGroup } from './FileUploadItemGroup';

type UploaderProps = Partial<ComponentProps<typeof FileUpload>>;

const Uploader = ({ children, ...props }: UploaderProps) => (
  <FileUpload data-testid='fu' name='artifact' {...props}>
    {children ?? (
      <FileUploadItemGroup>{file => <FileUploadItem file={file} />}</FileUploadItemGroup>
    )}
  </FileUpload>
);

describe('FileUpload — rows', () => {
  it('lists accepted files as rows with name, testids and slots', async () => {
    const { container } = render(<Uploader maxFiles={3} />);
    pick(container, makeFile('a.wasm'), makeFile('b.wasm'));
    await waitFor(() => expect(screen.getAllByTestId('fu--item')).toHaveLength(2));
    const group = byTestId('fu--item-group');
    expect(group.tagName).toBe('UL');
    const rows = screen.getAllByTestId('fu--item');
    expect(rows[0]?.tagName).toBe('LI');
    expect(screen.getAllByTestId('fu--item-name').map(n => n.textContent)).toEqual([
      'a.wasm',
      'b.wasm',
    ]);
  });

  it('renders nothing for an empty list', () => {
    render(<Uploader />);
    expect(queryByTestId('fu--item-group')).toBeNull();
  });

  it('shows an optional description line', () => {
    render(
      <FileUpload data-testid='fu'>
        <FileUploadItemGroup>
          <FileUploadItem
            file={{ name: 'stored.wasm', size: 10 }}
            description='32 KB · uploads when you save'
          />
        </FileUploadItemGroup>
      </FileUpload>,
    );
    expect(byTestId('fu--item-description')).toHaveTextContent('32 KB · uploads when you save');
  });

  it('renders outside FileUpload for stored-file lists', () => {
    render(
      <FileUploadItemGroup data-testid='list'>
        <FileUploadItem data-testid='row' file={{ name: 'stored.so' }} />
      </FileUploadItemGroup>,
    );
    expect(byTestId('row')).toHaveTextContent('stored.so');
  });

  it('a loading row dims, is aria-busy and shows a spinner', () => {
    render(
      <FileUpload data-testid='fu' maxFiles={3}>
        <FileUploadItemGroup>
          <FileUploadItem file={{ name: 'up.wasm' }} loading />
        </FileUploadItemGroup>
      </FileUpload>,
    );
    const row = byTestId('fu--item');
    expect(row).toHaveAttribute('data-loading');
    expect(row).toHaveAttribute('aria-busy', 'true');
    expect(row.querySelector('[data-role="spinner"]')).not.toBeNull();
  });

  it('forwards consumer attributes and ref to the row li', () => {
    const ref = vi.fn();
    render(
      <FileUploadItem
        file={{ name: 'a' }}
        data-testid='row'
        data-analytics-id='FILE_ROW'
        ref={ref}
      />,
    );
    expect(byTestId('row')).toHaveAttribute('data-analytics-id', 'FILE_ROW');
    expect(ref).toHaveBeenCalledWith(byTestId('row'));
  });
});
