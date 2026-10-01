import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { TestIdProvider } from '../../utils/testId';
import { Avatar, AvatarFallback, AvatarImage, AvatarOverlay } from '.';

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

  it('keeps the DOM clean without a data-testid', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage />
        <AvatarFallback />
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
