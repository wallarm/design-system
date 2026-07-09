import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { InlineEditPreviewIcon } from './InlineEditPreviewIcon';

describe('InlineEditPreviewIcon', () => {
  it('renders nothing when not activatable (disabled)', () => {
    render(
      <InlineEdit defaultValue='hello' disabled data-testid='attr'>
        <InlineEditPreviewIcon />
      </InlineEdit>,
    );
    expect(screen.queryByTestId('attr--preview-icon')).toBeNull();
  });

  it('renders the default pencil icon when activatable and idle', () => {
    render(
      <InlineEdit defaultValue='hello' data-testid='attr'>
        <InlineEditPreviewIcon />
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--preview-icon')).toBeInTheDocument();
  });

  it('renders a custom icon when activatable and idle', () => {
    render(
      <InlineEdit defaultValue='hello' data-testid='attr'>
        <InlineEditPreviewIcon>
          <span data-testid='custom'>*</span>
        </InlineEditPreviewIcon>
      </InlineEdit>,
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });

  it('shows the loader while loading, overriding any custom icon', () => {
    render(
      <InlineEdit defaultValue='hello' status='loading' data-testid='attr'>
        <InlineEditPreviewIcon>
          <span data-testid='custom'>*</span>
        </InlineEditPreviewIcon>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--preview-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('custom')).toBeNull();
  });

  it('shows the success check when saved, overriding any custom icon', () => {
    render(
      <InlineEdit defaultValue='hello' status='saved' data-testid='attr'>
        <InlineEditPreviewIcon>
          <span data-testid='custom'>*</span>
        </InlineEditPreviewIcon>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--preview-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('custom')).toBeNull();
  });
});
