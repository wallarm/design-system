import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CopyButton } from './CopyButton';

// Mock copyText so tests don't need the real clipboard API
vi.mock('../../utils/copyText', () => ({
  copyText: vi.fn(),
}));

describe('CopyButton', () => {
  it('renders with data-slot="copy-button"', () => {
    render(<CopyButton text='hello' />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('data-slot', 'copy-button');
  });

  it('forwards data-testid to the button', () => {
    render(<CopyButton text='hello' data-testid='my-copy' />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('data-testid', 'my-copy');
  });

  it('forwards arbitrary data-* attributes', () => {
    render(<CopyButton text='hello' data-analytics-id='COPY_BTN' />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('data-analytics-id', 'COPY_BTN');
  });

  it('calls copyText on click', async () => {
    const { copyText } = await import('../../utils/copyText');
    render(<CopyButton text='payload' />);
    await userEvent.click(screen.getByRole('button'));
    expect(copyText).toHaveBeenCalledWith('payload');
  });

  it('shows Check icon after click', async () => {
    const { container } = render(<CopyButton text='hello' />);

    // Before click: Copy icon (rect element)
    expect(container.querySelector('rect')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button'));

    // After click: Check icon (path with fill="currentColor", no rect)
    expect(container.querySelector('rect')).not.toBeInTheDocument();
  });

  it('accepts className override', () => {
    render(<CopyButton text='hello' className='custom-class' />);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('custom-class');
  });

  it('renders label text when label prop is provided', () => {
    render(<CopyButton text='hello' label='Copy code' />);
    expect(screen.getByText('Copy code')).toBeInTheDocument();
  });

  it('fires onClick handler alongside copy', async () => {
    const onClick = vi.fn();
    render(<CopyButton text='hello' onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('defaults aria-label to "Copy" when no label prop', () => {
    render(<CopyButton text='hello' />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Copy');
  });

  it('uses label as aria-label when label prop is provided', () => {
    render(<CopyButton text='hello' label='Copy code' />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Copy code');
  });
});
