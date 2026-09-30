import type { ComponentProps } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FileUpload } from './FileUpload';
import { byTestId, makeFile, pick, queryByTestId } from './FileUpload.test.helpers';
import { FileUploadItem } from './FileUploadItem';
import { FileUploadItemAction } from './FileUploadItemAction';
import { FileUploadItemDeleteTrigger } from './FileUploadItemDeleteTrigger';
import { FileUploadItemGroup } from './FileUploadItemGroup';
import { FileUploadItemReplaceTrigger } from './FileUploadItemReplaceTrigger';

type UploaderProps = Partial<ComponentProps<typeof FileUpload>>;

const Uploader = ({ children, ...props }: UploaderProps) => (
  <FileUpload data-testid='fu' name='artifact' {...props}>
    {children ?? (
      <FileUploadItemGroup>
        {file => (
          <FileUploadItem file={file}>
            <FileUploadItemReplaceTrigger />
            <FileUploadItemDeleteTrigger />
          </FileUploadItem>
        )}
      </FileUploadItemGroup>
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

const names = () => screen.getAllByTestId('fu--item-name').map(n => n.textContent);
const waitForRows = (count: number) =>
  waitFor(() => expect(screen.queryAllByTestId('fu--item')).toHaveLength(count));

describe('FileUpload — row actions', () => {
  it('Delete removes a picked file, with a default aria-label', async () => {
    const onValueChange = vi.fn();
    const { container } = render(<Uploader maxFiles={3} onValueChange={onValueChange} />);
    pick(container, makeFile('a.wasm'), makeFile('b.wasm'));
    await waitForRows(2);
    await userEvent.click(screen.getByRole('button', { name: 'Delete a.wasm' }));
    await waitFor(() => expect(names()).toEqual(['b.wasm']));
    expect(onValueChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'b.wasm' })]);
  });

  it('Delete composes the consumer onClick and honours preventDefault', async () => {
    const onClick = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    const { container } = render(
      <Uploader>
        <FileUploadItemGroup>
          {file => (
            <FileUploadItem file={file}>
              <FileUploadItemDeleteTrigger onClick={onClick} />
            </FileUploadItem>
          )}
        </FileUploadItemGroup>
      </Uploader>,
    );
    pick(container, makeFile('keep.wasm'));
    await waitForRows(1);
    await userEvent.click(byTestId('fu--item-delete-trigger'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(byTestId('fu--item-name')).toHaveTextContent('keep.wasm');
  });

  it('Delete on a loading row is "Cancel upload" and stays enabled', async () => {
    const onCancel = vi.fn();
    render(
      <FileUpload data-testid='fu'>
        <FileUploadItemGroup>
          <FileUploadItem file={{ name: 'up.wasm' }} loading>
            <FileUploadItemReplaceTrigger />
            <FileUploadItemDeleteTrigger onClick={onCancel} />
          </FileUploadItem>
        </FileUploadItemGroup>
      </FileUpload>,
    );
    const cancel = screen.getByRole('button', { name: 'Cancel upload' });
    expect(cancel).toBeEnabled();
    expect(queryByTestId('fu--item-replace-trigger')).toBeNull();
    await userEvent.click(cancel);
    expect(onCancel).toHaveBeenCalled();
  });

  it('Delete for a stored file only runs the consumer handler', async () => {
    const onDetach = vi.fn();
    render(
      <FileUploadItem file={{ name: 'stored.so' }}>
        <FileUploadItemDeleteTrigger aria-label='Detach artifact' onClick={onDetach} />
      </FileUploadItem>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Detach artifact' }));
    expect(onDetach).toHaveBeenCalled();
  });

  it('Replace in single mode opens the picker and the new file replaces the old one', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    const { container } = render(<Uploader />);
    pick(container, makeFile('old.wasm'));
    await waitForRows(1);
    await userEvent.click(screen.getByRole('button', { name: 'Replace old.wasm' }));
    await waitFor(() => expect(click).toHaveBeenCalled());
    pick(container, makeFile('new.wasm'));
    await waitFor(() => expect(names()).toEqual(['new.wasm']));
    click.mockRestore();
  });

  it('Replace in multiple mode swaps only that file, in place', async () => {
    const { container } = render(<Uploader maxFiles={3} accept='.wasm' />);
    pick(container, makeFile('a.wasm'), makeFile('b.wasm'));
    await waitForRows(2);
    const replaceInputs = container.querySelectorAll<HTMLInputElement>(
      '[data-slot="file-upload-item-replace-input"]',
    );
    fireEvent.change(replaceInputs[0] as HTMLInputElement, {
      target: { files: [makeFile('c.wasm')] },
    });
    await waitFor(() => expect(names()).toEqual(['c.wasm', 'b.wasm']));
  });

  it('an invalid multi-mode replacement keeps the original', async () => {
    const onFileReject = vi.fn();
    const { container } = render(
      <Uploader maxFiles={3} accept='.wasm' onFileReject={onFileReject} />,
    );
    pick(container, makeFile('a.wasm'), makeFile('b.wasm'));
    await waitForRows(2);
    const replaceInputs = container.querySelectorAll<HTMLInputElement>(
      '[data-slot="file-upload-item-replace-input"]',
    );
    fireEvent.change(replaceInputs[0] as HTMLInputElement, {
      target: { files: [makeFile('evil.txt')] },
    });
    expect(names()).toEqual(['a.wasm', 'b.wasm']);
    await waitFor(() =>
      expect(onFileReject).toHaveBeenLastCalledWith([
        expect.objectContaining({ errors: ['FILE_INVALID_TYPE'] }),
      ]),
    );
  });

  it('read-only hides Delete and Replace but keeps FileUploadItemAction (Download)', async () => {
    const onDownload = vi.fn();
    render(
      <FileUpload data-testid='fu' readOnly defaultValue={[makeFile('a.wasm')]}>
        <FileUploadItemGroup>
          {file => (
            <FileUploadItem file={file}>
              <FileUploadItemReplaceTrigger />
              <FileUploadItemAction aria-label='Download a.wasm' onClick={onDownload}>
                <span />
              </FileUploadItemAction>
              <FileUploadItemDeleteTrigger />
            </FileUploadItem>
          )}
        </FileUploadItemGroup>
      </FileUpload>,
    );
    await waitForRows(1);
    expect(queryByTestId('fu--item-delete-trigger')).toBeNull();
    expect(queryByTestId('fu--item-replace-trigger')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Download a.wasm' }));
    expect(onDownload).toHaveBeenCalled();
  });

  it('disabled disables every row action', async () => {
    render(
      <FileUpload data-testid='fu' disabled defaultValue={[makeFile('a.wasm')]}>
        <FileUploadItemGroup>
          {file => (
            <FileUploadItem file={file}>
              <FileUploadItemReplaceTrigger />
              <FileUploadItemAction aria-label='Download'>
                <span />
              </FileUploadItemAction>
              <FileUploadItemDeleteTrigger />
            </FileUploadItem>
          )}
        </FileUploadItemGroup>
      </FileUpload>,
    );
    await waitForRows(1);
    expect(byTestId('fu--item-delete-trigger')).toBeDisabled();
    expect(byTestId('fu--item-replace-trigger')).toBeDisabled();
    expect(byTestId('fu--item-action')).toBeDisabled();
  });
});

describe('FileUpload — row action tooltips', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows "Replace" and "Delete" tooltips on hover, keeping the button test ids', async () => {
    const { container } = render(<Uploader />);
    pick(container, makeFile('a.wasm'));
    await waitForRows(1);

    const replace = byTestId('fu--item-replace-trigger');
    expect(replace.tagName).toBe('BUTTON');
    expect(replace).toHaveAccessibleName('Replace a.wasm');
    await userEvent.hover(replace);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Replace');
    await userEvent.unhover(replace);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());

    const remove = byTestId('fu--item-delete-trigger');
    expect(remove.tagName).toBe('BUTTON');
    expect(remove).toHaveAccessibleName('Delete a.wasm');
    await userEvent.hover(remove);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(/^Delete$/);
  });

  it('a loading row Delete tooltip reads "Cancel upload"', async () => {
    render(
      <FileUpload data-testid='fu'>
        <FileUploadItemGroup>
          <FileUploadItem file={{ name: 'up.wasm' }} loading>
            <FileUploadItemDeleteTrigger />
          </FileUploadItem>
        </FileUploadItemGroup>
      </FileUpload>,
    );
    await userEvent.hover(byTestId('fu--item-delete-trigger'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Cancel upload');
  });

  it('Action shows its string aria-label as a tooltip', async () => {
    render(
      <FileUploadItem file={{ name: 'p.wasm' }}>
        <FileUploadItemAction aria-label='Download p.wasm'>
          <span />
        </FileUploadItemAction>
      </FileUploadItem>,
    );
    const action = screen.getByRole('button', { name: 'Download p.wasm' });
    await userEvent.hover(action);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Download p.wasm');
  });

  it('Action without a string aria-label renders no tooltip', async () => {
    render(
      <FileUploadItem file={{ name: 'p.wasm' }}>
        <FileUploadItemAction data-testid='bare'>
          <span />
        </FileUploadItemAction>
      </FileUploadItem>,
    );
    await userEvent.hover(byTestId('bare'));
    await new Promise(resolve => setTimeout(resolve, 600));
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
