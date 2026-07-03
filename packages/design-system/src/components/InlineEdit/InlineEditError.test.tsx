import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { InlineEditError } from './InlineEditError';

describe('InlineEditError', () => {
  it('renders nothing when valid', () => {
    render(
      <InlineEdit defaultValue='x' data-testid='attr'>
        <InlineEditError />
      </InlineEdit>,
    );
    expect(screen.queryByTestId('attr--error')).toBeNull();
  });

  it('renders the context error message when invalid', () => {
    render(
      <InlineEdit defaultValue='x' status='error' error='An error message.' data-testid='attr'>
        <InlineEditError />
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--error')).toHaveTextContent('An error message.');
  });

  it('prefers explicit children over the context error', () => {
    render(
      <InlineEdit defaultValue='x' status='error' error='ctx' data-testid='attr'>
        <InlineEditError>custom</InlineEditError>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--error')).toHaveTextContent('custom');
  });
});
