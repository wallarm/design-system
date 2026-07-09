import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { InlineEditPreviewValue } from './InlineEditPreviewValue';

describe('InlineEditPreviewValue', () => {
  it('truncates single-line by default', () => {
    render(
      <InlineEdit defaultValue='hello' data-testid='attr'>
        <InlineEditPreviewValue>hello</InlineEditPreviewValue>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--preview-value')).toHaveClass('truncate');
  });

  it('applies the line-clamp class when lineClamp is set', () => {
    render(
      <InlineEdit defaultValue='hello' data-testid='attr'>
        <InlineEditPreviewValue lineClamp={3}>hello</InlineEditPreviewValue>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--preview-value')).toHaveClass('line-clamp-3');
  });

  it('dims while a commit is loading', () => {
    render(
      <InlineEdit defaultValue='hello' status='loading' data-testid='attr'>
        <InlineEditPreviewValue>hello</InlineEditPreviewValue>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--preview-value')).toHaveClass('opacity-50');
  });
});
