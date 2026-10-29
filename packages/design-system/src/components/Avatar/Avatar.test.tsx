import type { FC } from 'react';

import { describe, expect, it, rs } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  Avatar,
  AvatarContent,
  AvatarDescription,
  AvatarFallback,
  AvatarImage,
  AvatarName,
  AvatarOverlay,
} from '.';
import type { SvgIconProps } from '../../icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

const renderAvatar = (props: { src?: string; name?: string; onStatusChange?: () => void } = {}) =>
  render(
    <Avatar data-testid='av' onStatusChange={props.onStatusChange}>
      <AvatarImage src={props.src} />
      <AvatarFallback name={props.name} />
    </Avatar>,
  );

describe('Avatar', () => {
  it('renders a span root with the default (lg) size on the plate layers', () => {
    renderAvatar();
    const root = screen.getByTestId('av');
    expect(root.tagName).toBe('SPAN');
    expect(root).toHaveAttribute('data-slot', 'avatar');
    expect(root).toHaveClass('rounded-12');
    expect(root).not.toHaveClass('size-32');
    expect(screen.getByTestId('av--image')).toHaveClass('size-32', 'rounded-12');
    expect(screen.getByTestId('av--fallback')).toHaveClass('size-32', 'rounded-12', 'text-xs');
  });

  it.each([
    ['sm', 'size-20', 'rounded-8'],
    ['md', 'size-24', 'rounded-8'],
    ['lg', 'size-32', 'rounded-12'],
  ] as const)('applies the %s size to every plate layer', (size, box, radius) => {
    render(
      <Avatar data-testid='av' size={size}>
        <AvatarImage />
        <AvatarFallback />
        <AvatarOverlay />
      </Avatar>,
    );
    expect(screen.getByTestId('av')).toHaveClass(radius);
    for (const part of ['image', 'fallback', 'overlay']) {
      expect(screen.getByTestId(`av--${part}`)).toHaveClass(box, radius);
    }
    expect(screen.getByTestId('av--fallback')).toHaveClass('text-xs');
  });

  it('shows the fallback while loading and the photo once loaded', async () => {
    const onStatusChange = rs.fn();
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
    const onStatusChange = rs.fn();
    renderAvatar({ src: '/broken.png', name: 'Ada Lovelace', onStatusChange });
    const img = screen.getByTestId('av--image');
    fireEvent.error(img);
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith({ status: 'error' }));
    expect(screen.getByTestId('av--fallback')).toHaveAttribute('data-state', 'visible');
    expect(img).toHaveAttribute('data-state', 'hidden');
  });

  it('draws the stroke and tint on the fallback plate, never on the root or the photo', async () => {
    renderAvatar({ src: '/me.png' });
    const root = screen.getByTestId('av');
    const img = screen.getByTestId('av--image');
    const fallback = screen.getByTestId('av--fallback');
    expect(root).not.toHaveClass('border');
    expect(img).not.toHaveClass('border');
    expect(fallback).toHaveClass('border', 'border-border-primary', 'bg-states-primary-hover');
    // Once the photo is visible Ark hides the fallback, and the stroke goes with it.
    fireEvent.load(img);
    await waitFor(() => expect(fallback).toHaveAttribute('data-state', 'hidden'));
    expect(fallback).toHaveClass('data-[state=hidden]:hidden');
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

  it('clamps the root to its container only for a user item', () => {
    const { rerender } = render(
      <Avatar data-testid='av'>
        <AvatarFallback />
      </Avatar>,
    );
    expect(screen.getByTestId('av')).toHaveClass('has-[>[data-slot=avatar-content]]:max-w-full');
    expect(screen.getByTestId('av')).not.toHaveClass('max-w-full');
    rerender(
      <Avatar data-testid='av'>
        <AvatarImage />
      </Avatar>,
    );
    expect(screen.getByTestId('av--image')).toHaveClass('bg-states-primary-hover');
  });

  describe('fallback content', () => {
    it.each([
      ['sm', 'A'],
      ['md', 'AM'],
      ['lg', 'AM'],
    ] as const)('shows %s initials as %s', (size, initials) => {
      render(
        <Avatar data-testid='av' size={size}>
          <AvatarFallback name='Artem Miskevich' />
        </Avatar>,
      );
      expect(screen.getByTestId('av--fallback').textContent).toBe(initials);
    });

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

    it('colours initials as text, branded in a Branded frame', () => {
      render(
        <Avatar data-testid='av'>
          <AvatarFallback name='Ada Lovelace' />
        </Avatar>,
      );
      const fallback = screen.getByTestId('av--fallback');
      expect(fallback).toHaveClass('text-text-primary', 'branded:text-text-brand');
      expect(fallback).not.toHaveClass('text-icon-primary');
    });

    it('colours the icon as an icon, branded in a Branded frame', () => {
      render(
        <Avatar data-testid='av'>
          <AvatarFallback />
        </Avatar>,
      );
      const fallback = screen.getByTestId('av--fallback');
      expect(fallback).toHaveClass(
        'text-icon-primary',
        'branded:text-icon-brand',
        'branded:bg-states-brand-hover',
        'branded:border-border-brand',
      );
      expect(fallback).not.toHaveClass('text-text-primary');
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

describe('AvatarContent', () => {
  const renderItem = (size?: 'sm' | 'md' | 'lg') =>
    render(
      <Avatar data-testid='av' size={size}>
        <AvatarImage />
        <AvatarFallback name='Artem Miskevich' />
        <AvatarContent>
          <AvatarName>Artem Miskevich</AvatarName>
          <AvatarDescription>admin@wallarm.com</AvatarDescription>
        </AvatarContent>
      </Avatar>,
    );

  it('puts the plate in column 1 and the text in column 2 of the root row', () => {
    renderItem('sm');
    expect(screen.getByTestId('av')).toHaveClass('inline-grid', 'items-center', 'gap-x-6');
    for (const part of ['image', 'fallback']) {
      expect(screen.getByTestId(`av--${part}`)).toHaveClass('col-start-1', 'row-start-1');
    }
    expect(screen.getByTestId('av--content')).toHaveClass(
      'col-start-2',
      'row-start-1',
      'flex-col',
      'min-w-0',
    );
  });

  it.each(['sm', 'md', 'lg'] as const)('styles name and description at %s', size => {
    renderItem(size);
    const name = screen.getByTestId('av--name');
    const description = screen.getByTestId('av--description');
    expect(name).toHaveTextContent('Artem Miskevich');
    expect(name).toHaveClass('text-sm', 'text-text-primary', 'font-normal', 'truncate');
    expect(description).toHaveTextContent('admin@wallarm.com');
    expect(description).toHaveClass('text-xs', 'text-text-secondary', 'truncate');
  });

  it('renders spans (valid inside a button root) with data-slots', () => {
    renderItem();
    expect(screen.getByTestId('av--content')).toHaveAttribute('data-slot', 'avatar-content');
    expect(screen.getByTestId('av--name')).toHaveAttribute('data-slot', 'avatar-name');
    expect(screen.getByTestId('av--description')).toHaveAttribute(
      'data-slot',
      'avatar-description',
    );
    for (const part of ['content', 'name', 'description']) {
      expect(screen.getByTestId(`av--${part}`).tagName).toBe('SPAN');
    }
  });

  it('forwards ref, className and rest props on each part', () => {
    const refs = {
      content: { current: null as HTMLSpanElement | null },
      name: { current: null as HTMLSpanElement | null },
      description: { current: null as HTMLSpanElement | null },
    };
    render(
      <Avatar data-testid='av'>
        <AvatarFallback />
        <AvatarContent ref={refs.content} className='w-160' title='c'>
          <AvatarName ref={refs.name} className='font-medium' title='n'>
            Ada
          </AvatarName>
          <AvatarDescription ref={refs.description} title='d'>
            ada@example.com
          </AvatarDescription>
        </AvatarContent>
      </Avatar>,
    );
    expect(refs.content.current).toBe(screen.getByTestId('av--content'));
    expect(refs.name.current).toBe(screen.getByTestId('av--name'));
    expect(refs.description.current).toBe(screen.getByTestId('av--description'));
    expect(screen.getByTestId('av--content')).toHaveClass('w-160');
    expect(screen.getByTestId('av--name')).toHaveClass('font-medium');
    expect(screen.getByTestId('av--name')).not.toHaveClass('font-normal');
    expect(screen.getByTestId('av--description')).toHaveAttribute('title', 'd');
  });

  it.each(['name', 'description'] as const)(
    'shows the full %s in a tooltip only when it is truncated',
    async part => {
      const text = part === 'name' ? 'Artem Miskevich' : 'admin@wallarm.com';
      const { unmount } = renderItem();
      // jsdom has no layout, so a hover over untruncated text opens nothing.
      await userEvent.hover(screen.getByTestId(`av--${part}`));
      await new Promise(resolve => setTimeout(resolve, 600));
      expect(screen.getAllByText(text)).toHaveLength(1);
      unmount();

      renderItem();
      const el = screen.getByTestId(`av--${part}`);
      Object.defineProperties(el, {
        scrollWidth: { configurable: true, value: 300 },
        clientWidth: { configurable: true, value: 100 },
      });
      await userEvent.hover(el);
      await waitFor(() => expect(screen.getAllByText(text)).toHaveLength(2), { timeout: 2000 });
    },
  );

  it('keeps the name inside an interactive root', () => {
    render(
      <Avatar as='button' data-testid='av'>
        <AvatarFallback name='Ada Lovelace' />
        <AvatarContent>
          <AvatarName>Ada Lovelace</AvatarName>
        </AvatarContent>
      </Avatar>,
    );
    expect(screen.getByRole('button', { name: 'Ada Lovelace' })).toHaveAttribute(
      'data-testid',
      'av',
    );
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

  it('swaps the fallback content, not its plate, while the overlay shows (class contract)', () => {
    render(
      <Avatar data-testid='av'>
        <AvatarFallback />
        <AvatarOverlay />
      </Avatar>,
    );
    expect(screen.getByTestId('av')).toHaveClass(
      'hover:not-disabled:[&:has(>[data-slot=avatar-overlay])>[data-slot=avatar-fallback]]:text-transparent',
      'hover:not-disabled:[&:has(>[data-slot=avatar-overlay])>[data-slot=avatar-fallback]>*]:invisible',
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
    expect(root).toHaveClass('group/avatar', 'rounded-12');
    expect(screen.getByTestId('av--image')).toHaveClass('size-32');
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

  it('a span root drops button-only attributes', () => {
    render(
      // @ts-expect-error button attributes need as='button' or asChild
      <Avatar data-testid='av' disabled name='photo' value='1' form='f'>
        <AvatarFallback />
      </Avatar>,
    );
    const root = screen.getByTestId('av');
    for (const attr of ['disabled', 'name', 'value', 'form', 'type']) {
      expect(root).not.toHaveAttribute(attr);
    }
  });

  it('asChild passes button attributes to its child', () => {
    render(
      <Avatar asChild type='submit' disabled name='photo'>
        <button aria-label='Save'>
          <AvatarFallback />
        </button>
      </Avatar>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('name', 'photo');
    expect(button).toBeDisabled();
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

describe('Avatar id', () => {
  it('puts a consumer id on the root unchanged', () => {
    render(
      <Avatar id='me' data-testid='av'>
        <AvatarFallback />
      </Avatar>,
    );
    expect(screen.getByTestId('av')).toHaveAttribute('id', 'me');
  });

  it('puts a consumer id on a button root unchanged', () => {
    render(
      <Avatar as='button' id='me' aria-label='Profile'>
        <AvatarFallback />
      </Avatar>,
    );
    expect(screen.getByRole('button', { name: 'Profile' })).toHaveAttribute('id', 'me');
  });

  it('keeps the tooltip trigger id on the button, so the tooltip links to it', async () => {
    render(
      <Tooltip openDelay={0}>
        <TooltipTrigger asChild>
          <Avatar as='button' aria-label='Profile'>
            <AvatarFallback />
          </Avatar>
        </TooltipTrigger>
        <TooltipContent data-testid='tip'>Ada Lovelace</TooltipContent>
      </Tooltip>,
    );
    const button = screen.getByRole('button', { name: 'Profile' });
    expect(button.id).toMatch(/^tooltip:.+:trigger$/);
    // Keyboard focus: zag opens a tooltip on focus only when focus is visible.
    await userEvent.tab();
    expect(button).toHaveFocus();
    const tip = await screen.findByTestId('tip');
    await waitFor(() => expect(button).toHaveAttribute('aria-describedby', tip.id));
  });
});
