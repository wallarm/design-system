import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AttributeEdit } from './AttributeEdit';
import { AttributeEditError } from './AttributeEditError';

describe('AttributeEditError', () => {
  it('renders nothing when valid', () => {
    render(
      <AttributeEdit defaultValue='x' data-testid='attr'>
        <AttributeEditError />
      </AttributeEdit>,
    );
    expect(screen.queryByTestId('attr--edit-error')).toBeNull();
  });

  it('renders the context error message when invalid', () => {
    render(
      <AttributeEdit defaultValue='x' status='error' error='An error message.' data-testid='attr'>
        <AttributeEditError />
      </AttributeEdit>,
    );
    expect(screen.getByTestId('attr--edit-error')).toHaveTextContent('An error message.');
  });

  it('prefers explicit children over the context error', () => {
    render(
      <AttributeEdit defaultValue='x' status='error' error='ctx' data-testid='attr'>
        <AttributeEditError>custom</AttributeEditError>
      </AttributeEdit>,
    );
    expect(screen.getByTestId('attr--edit-error')).toHaveTextContent('custom');
  });
});
