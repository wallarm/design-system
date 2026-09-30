import type { FC } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SvgIconProps } from '../../icons';
import { Avatar, AvatarFallback, AvatarImage, AvatarOverlay } from '.';

const renderAvatar = (props: { src?: string; name?: string; onStatusChange?: () => void } = {}) =>
  render(
    <Avatar data-testid='av' onStatusChange={props.onStatusChange}>
      <AvatarImage src={props.src} />
      <AvatarFallback name={props.name} />
    </Avatar>,
  );

describe('Avatar', () => {
  it('renders a span root with the default size', () => {
    renderAvatar();
    const root = screen.getByTestId('av');
    expect(root.tagName).toBe('SPAN');
    expect(root).toHaveAttribute('data-slot', 'avatar');
    expect(root).toHaveClass('size-32', 'rounded-12');
  });

  it('applies the xs size', () => {
    render(
      <Avatar data-testid='av' size='xs'>
        <AvatarFallback />
      </Avatar>,
    );
    expect(screen.getByTestId('av')).toHaveClass('size-24', 'rounded-8');
  });

  it('shows the fallback while loading and the photo once loaded', async () => {
    const onStatusChange = vi.fn();
    renderAvatar({ src: '/me.png', name: 'Ada Lovelace', onStatusChange });
    const img = screen.getByTestId('av--image');
    const fallback = screen.getByTestId('av--fallback');
    expect(img).toHaveAttribute('data-state', 'hidden');
    expect(fallback).toHaveAttribute('data-state', 'visible');
    expect(fallback).toHaveTextContent('AL');

    fireEvent.load(img);
    await waitFor(() => expect(img).toHaveAttribute('data-state', 'visible'));
    expect(fallback).toHaveAttribute('data-state', 'hidden');
    expect(onStatusChange).toHaveBeenCalledWith({ status: 'loaded' });
  });

  it('falls back when the photo fails', async () => {
    // Loading already shows the fallback, so assert the error status itself, not only the DOM.
    const onStatusChange = vi.fn();
    renderAvatar({ src: '/broken.png', name: 'Ada Lovelace', onStatusChange });
    const img = screen.getByTestId('av--image');
    fireEvent.error(img);
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith({ status: 'error' }));
    expect(screen.getByTestId('av--fallback')).toHaveAttribute('data-state', 'visible');
    expect(img).toHaveAttribute('data-state', 'hidden');
  });

  it('drops the stroke once a photo is visible (class contract; jsdom has no CSS)', () => {
    renderAvatar({ src: '/me.png' });
    expect(screen.getByTestId('av')).toHaveClass(
      'border',
      'has-[>img[data-state=visible]]:border-0',
    );
  });

  it('always renders the image element, even without src', () => {
    renderAvatar();
    expect(screen.getByTestId('av--image').tagName).toBe('IMG');
    expect(screen.getByTestId('av--fallback')).toHaveAttribute('data-state', 'visible');
  });

  it('re-enters loading when src changes, then shows the new photo', async () => {
    const { rerender } = renderAvatar({ src: '/a.png' });
    fireEvent.load(screen.getByTestId('av--image'));
    await waitFor(() =>
      expect(screen.getByTestId('av--image')).toHaveAttribute('data-state', 'visible'),
    );
    rerender(
      <Avatar data-testid='av'>
        <AvatarImage src='blob:preview' />
        <AvatarFallback />
      </Avatar>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('av--fallback')).toHaveAttribute('data-state', 'visible'),
    );
    fireEvent.load(screen.getByTestId('av--image'));
    await waitFor(() =>
      expect(screen.getByTestId('av--image')).toHaveAttribute('data-state', 'visible'),
    );
  });

  describe('fallback content', () => {
    it('prefers children', () => {
      render(
        <Avatar data-testid='av'>
          <AvatarFallback name='Ada Lovelace'>?</AvatarFallback>
        </Avatar>,
      );
      expect(screen.getByTestId('av--fallback')).toHaveTextContent('?');
    });

    it('shows the default icon without a name', () => {
      render(
        <Avatar data-testid='av'>
          <AvatarFallback />
        </Avatar>,
      );
      expect(screen.getByTestId('av--fallback').querySelector('svg')).not.toBeNull();
    });

    it('shows the icon when the name yields no initials', () => {
      render(
        <Avatar data-testid='av'>
          <AvatarFallback name='   ' />
        </Avatar>,
      );
      const fallback = screen.getByTestId('av--fallback');
      expect(fallback.textContent).toBe('');
      expect(fallback.querySelector('svg')).not.toBeNull();
    });

    it('takes a custom icon', () => {
      const Custom: FC<SvgIconProps> = () => <svg data-testid='custom-icon' />;
      render(
        <Avatar data-testid='av'>
          <AvatarFallback icon={Custom} />
        </Avatar>,
      );
      expect(screen.getByTestId('av--fallback')).toContainElement(
        screen.getByTestId('custom-icon'),
      );
    });

    it('colours initials as text, not as an icon', () => {
      render(
        <Avatar data-testid='av'>
          <AvatarFallback name='Ada Lovelace' />
        </Avatar>,
      );
      expect(screen.getByTestId('av--fallback')).toHaveClass('text-text-primary');
    });
  });

  it('asChild renders the consumer element and lets an incoming data-slot win', () => {
    render(
      <Avatar asChild data-testid='av' data-slot='nav-rail-item-avatar'>
        <button type='button' aria-label='Change avatar'>
          <AvatarImage />
          <AvatarFallback />
        </button>
      </Avatar>,
    );
    const root = screen.getByRole('button', { name: 'Change avatar' });
    expect(root).toHaveAttribute('data-testid', 'av');
    expect(root).toHaveAttribute('data-slot', 'nav-rail-item-avatar');
    expect(root).toHaveClass('group/avatar');
    expect(screen.getByTestId('av--image')).toBeInTheDocument();
  });

  it('forwards the ref, className and rest props to the root', () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <Avatar ref={ref} data-testid='av' className='-m-4' title='Ada'>
        <AvatarFallback />
      </Avatar>,
    );
    const root = screen.getByTestId('av');
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('-m-4');
    expect(root).toHaveAttribute('title', 'Ada');
  });
});

describe('AvatarOverlay', () => {
  it('renders the default edit icon, hidden from assistive tech', () => {
    render(
      <Avatar asChild data-testid='av'>
        <button type='button' aria-label='Change avatar'>
          <AvatarFallback />
          <AvatarOverlay />
        </button>
      </Avatar>,
    );
    const overlay = screen.getByTestId('av--overlay');
    expect(overlay).toHaveAttribute('data-slot', 'avatar-overlay');
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
    expect(overlay).not.toHaveAttribute('data-visible');
    expect(overlay.querySelector('svg')).not.toBeNull();
  });

  it('is forced visible with `visible`, with custom content', () => {
    render(
      <Avatar data-testid='av'>
        <AvatarOverlay visible>…</AvatarOverlay>
      </Avatar>,
    );
    const overlay = screen.getByTestId('av--overlay');
    expect(overlay).toHaveAttribute('data-visible');
    expect(overlay).toHaveTextContent('…');
  });

  it('a disabled root hides only the non-forced overlay (class contract)', () => {
    render(
      <Avatar data-testid='av'>
        <AvatarOverlay />
      </Avatar>,
    );
    expect(screen.getByTestId('av--overlay')).toHaveClass(
      'group-disabled/avatar:not-data-[visible]:hidden',
    );
  });

  it('paints the wash only over a visible photo (class contract)', () => {
    render(
      <Avatar data-testid='av'>
        <AvatarOverlay />
      </Avatar>,
    );
    expect(screen.getByTestId('av--overlay')).toHaveClass(
      'group-has-[>img[data-state=visible]]/avatar:bg-component-avatar-overlay',
    );
  });
});

describe('as="button"', () => {
  it('renders a native button root with type=button', () => {
    render(
      <Avatar as='button' data-testid='av' aria-label='Change avatar'>
        <AvatarImage />
        <AvatarFallback />
      </Avatar>,
    );
    const root = screen.getByRole('button', { name: 'Change avatar' });
    expect(root).toHaveAttribute('data-testid', 'av');
    expect(root).toHaveAttribute('type', 'button');
    expect(root).toHaveAttribute('data-slot', 'avatar');
    expect(root).toHaveClass('group/avatar', 'size-32');
    expect(screen.getByTestId('av--image')).toBeInTheDocument();
  });

  it('keeps a consumer type and supports disabled', () => {
    render(
      <Avatar as='button' type='submit' disabled aria-label='Change avatar'>
        <AvatarFallback />
      </Avatar>,
    );
    const root = screen.getByRole('button', { name: 'Change avatar' });
    expect(root).toHaveAttribute('type', 'submit');
    expect(root).toBeDisabled();
  });

  it('asChild still wins over as', () => {
    render(
      <Avatar as='button' asChild data-testid='av'>
        <a href='/me' aria-label='Profile'>
          <AvatarFallback />
        </a>
      </Avatar>,
    );
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('data-testid', 'av');
    expect(screen.queryByRole('button')).toBeNull();
  });
});
