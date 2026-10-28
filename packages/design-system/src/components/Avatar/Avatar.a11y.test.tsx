import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';

import { Avatar, AvatarContent, AvatarFallback, AvatarImage, AvatarName } from '.';

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

  it('does not become an image when it shows a name (user item)', () => {
    render(
      <Avatar data-testid='av' aria-label='Artem Miskevich'>
        <AvatarFallback name='Artem Miskevich' />
        <AvatarContent>
          <AvatarName>Artem Miskevich</AvatarName>
        </AvatarContent>
      </Avatar>,
    );
    expect(screen.getByTestId('av')).not.toHaveAttribute('role');
    expect(screen.queryByRole('img')).toBeNull();
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

  it('in a user item the visible name is the text; the plate stays decorative', () => {
    render(
      <Avatar data-testid='av'>
        <AvatarImage src='/me.png' />
        <AvatarFallback name='Ada Lovelace' />
        <AvatarContent>
          <AvatarName>Ada Lovelace</AvatarName>
        </AvatarContent>
      </Avatar>,
    );
    expect(screen.getByTestId('av')).not.toHaveAttribute('role');
    expect(screen.getByTestId('av--fallback')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('av--name')).not.toHaveAttribute('aria-hidden');
    expect(screen.getByText('Ada Lovelace')).toBeVisible();
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

it('does not force role=img on an as="button" root', () => {
  render(
    <Avatar as='button' aria-label='Change avatar'>
      <AvatarFallback />
    </Avatar>,
  );
  expect(screen.getByRole('button', { name: 'Change avatar' })).toBeInTheDocument();
  expect(screen.queryByRole('img')).toBeNull();
});
