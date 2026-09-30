import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FileUpload, FileUploadError, FileUploadTrigger, useFilePreviewUrl } from '../FileUpload';
import { byTestId, makeFile, nextFrame, pick } from '../FileUpload/FileUpload.test.helpers';
import { Avatar, AvatarFallback, AvatarImage, AvatarOverlay } from '.';

const ClickToUpload = ({ disabled = false, stored }: { disabled?: boolean; stored?: string }) => {
  const [file, setFile] = useState<File>();
  const preview = useFilePreviewUrl(file);
  return (
    <FileUpload
      data-testid='fu'
      accept='image/png,image/jpeg,image/webp'
      maxFileSize={512 * 1024}
      onValueChange={files => setFile(files[0])}
    >
      <FileUploadTrigger asChild disabled={disabled}>
        <Avatar as='button' aria-label='Change avatar'>
          <AvatarImage src={preview ?? stored} />
          <AvatarFallback name='Ada Lovelace' />
          <AvatarOverlay />
        </Avatar>
      </FileUploadTrigger>
      <FileUploadError />
    </FileUpload>
  );
};

describe('Avatar as a FileUpload trigger', () => {
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });

  it('keeps both slot layers: trigger attributes on the real button, avatar parts cascaded', () => {
    render(<ClickToUpload />);
    const button = screen.getByRole('button', { name: 'Change avatar' });
    expect(button).toHaveAttribute('data-slot', 'file-upload-trigger');
    expect(button).toHaveAttribute('data-testid', 'fu--trigger');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('group/avatar', 'size-32');
    expect(byTestId('fu--trigger--image')).toHaveAttribute('data-slot', 'avatar-image');
    expect(byTestId('fu--trigger--fallback')).toHaveTextContent('AL');
  });

  it('opens the picker on click', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    render(<ClickToUpload />);
    await userEvent.click(screen.getByRole('button', { name: 'Change avatar' }));
    await waitFor(() => expect(click).toHaveBeenCalled());
  });

  it('shows the picked file as the preview (stored → blob)', async () => {
    const { container } = render(<ClickToUpload stored='/stored.png' />);
    expect(byTestId('fu--trigger--image')).toHaveAttribute('src', '/stored.png');
    pick(container, makeFile('me.png', 3, 'image/png'));
    await waitFor(() =>
      expect(byTestId('fu--trigger--image')).toHaveAttribute('src', 'blob:preview'),
    );
    fireEvent.load(byTestId('fu--trigger--image'));
    await waitFor(() =>
      expect(byTestId('fu--trigger--image')).toHaveAttribute('data-state', 'visible'),
    );
  });

  it('rejects an oversized or wrong-type file and keeps the old photo', async () => {
    const { container } = render(<ClickToUpload stored='/stored.png' />);
    pick(container, makeFile('huge.png', 600 * 1024, 'image/png'));
    expect(await screen.findByTestId('fu--rejections')).toBeInTheDocument();
    expect(byTestId('fu--trigger--image')).toHaveAttribute('src', '/stored.png');
    expect(byTestId('fu--trigger')).toHaveAttribute(
      'aria-describedby',
      byTestId('fu--rejections').id,
    );
  });

  it('a disabled trigger reaches the button and does not open the picker', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    render(<ClickToUpload disabled />);
    const button = screen.getByRole('button', { name: 'Change avatar' });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    await nextFrame();
    expect(click).not.toHaveBeenCalled();
  });
});
