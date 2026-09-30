import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar, AvatarFallback, AvatarImage } from '.';

describe('Avatar — accessibility', () => {
  it('is decorative by default: empty alt, hidden fallback, no role', () => {
    render(
      <Avatar data-testid='av'>
        <AvatarImage src='/me.png' />
        <AvatarFallback name='Ada Lovelace' />
      </Avatar>,
    );
    expect(screen.getByTestId('av--image')).toHaveAttribute('alt', '');
    expect(screen.getByTestId('av--fallback')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('av')).not.toHaveAttribute('role');
  });

  it('becomes an image when labelled', () => {
    render(
      <Avatar aria-label='Ada Lovelace'>
        <AvatarFallback name='Ada Lovelace' />
      </Avatar>,
    );
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveAttribute(
      'data-slot',
      'avatar',
    );
  });

  it('does not force role=img on an asChild root', () => {
    render(
      <Avatar asChild aria-label='Change avatar'>
        <button type='button'>
          <AvatarFallback />
        </button>
      </Avatar>,
    );
    expect(screen.getByRole('button', { name: 'Change avatar' })).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('lets a consumer expose meaningful fallback text', () => {
    render(
      <Avatar data-testid='av'>
        <AvatarFallback aria-hidden={false}>Guest</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByTestId('av--fallback')).toHaveAttribute('aria-hidden', 'false');
  });

  it('keeps a consumer alt', () => {
    render(
      <Avatar data-testid='av'>
        <AvatarImage src='/me.png' alt='Ada Lovelace' />
      </Avatar>,
    );
    expect(screen.getByTestId('av--image')).toHaveAttribute('alt', 'Ada Lovelace');
  });
});
