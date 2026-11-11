import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import {
  Avatar,
  AvatarContent,
  AvatarDescription,
  AvatarFallback,
  AvatarImage,
  AvatarName,
  AvatarOverlay,
} from '.';
import { TestIdProvider } from '../../utils/testId';

describe('Avatar — test ids', () => {
  it('cascades {id}--image and {id}--fallback', () => {
    render(
      <Avatar data-testid='me'>
        <AvatarImage src='/me.png' />
        <AvatarFallback />
      </Avatar>,
    );
    expect(screen.getByTestId('me--image')).toHaveAttribute('data-slot', 'avatar-image');
    expect(screen.getByTestId('me--fallback')).toHaveAttribute('data-slot', 'avatar-fallback');
  });

  it('cascades {id}--overlay', () => {
    render(
      <Avatar data-testid='me'>
        <AvatarOverlay />
      </Avatar>,
    );
    expect(screen.getByTestId('me--overlay')).toHaveAttribute('data-slot', 'avatar-overlay');
  });

  it('cascades {id}--content, {id}--name and {id}--description', () => {
    render(
      <Avatar data-testid='me'>
        <AvatarFallback />
        <AvatarContent>
          <AvatarName>Ada</AvatarName>
          <AvatarDescription>ada@example.com</AvatarDescription>
        </AvatarContent>
      </Avatar>,
    );
    expect(screen.getByTestId('me--content')).toHaveAttribute('data-slot', 'avatar-content');
    expect(screen.getByTestId('me--name')).toHaveAttribute('data-slot', 'avatar-name');
    expect(screen.getByTestId('me--description')).toHaveAttribute(
      'data-slot',
      'avatar-description',
    );
  });

  it('keeps the DOM clean without a data-testid', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage />
        <AvatarFallback />
        <AvatarContent>
          <AvatarName>Ada</AvatarName>
          <AvatarDescription>ada@example.com</AvatarDescription>
        </AvatarContent>
      </Avatar>,
    );
    expect(container.querySelector('[data-testid]')).toBeNull();
  });

  it('never inherits the parent cascade base as its own id', () => {
    const { container } = render(
      <TestIdProvider value='rail'>
        <Avatar>
          <AvatarFallback />
        </Avatar>
      </TestIdProvider>,
    );
    expect(container.querySelector('[data-testid="rail"]')).toBeNull();
  });
});
