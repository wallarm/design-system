import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { InlineEditPreview } from './InlineEditPreview';

describe('InlineEditPreview', () => {
  it('renders the value and enters edit on click', async () => {
    render(
      <InlineEdit defaultValue='hello' data-testid='attr'>
        <InlineEditPreview>hello</InlineEditPreview>
      </InlineEdit>,
    );
    const preview = screen.getByTestId('attr--preview');
    expect(preview).toHaveTextContent('hello');
    expect(preview).toHaveAttribute('role', 'button');
    await userEvent.click(preview);
    // preview unmounts in edit mode
    expect(screen.queryByTestId('attr--preview')).toBeNull();
  });

  it('enters edit via keyboard (Enter)', async () => {
    render(
      <InlineEdit defaultValue='hello' data-testid='attr'>
        <InlineEditPreview>hello</InlineEditPreview>
      </InlineEdit>,
    );
    screen.getByTestId('attr--preview').focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.queryByTestId('attr--preview')).toBeNull();
  });

  it('is not activatable when readOnly', async () => {
    render(
      <InlineEdit defaultValue='hello' readOnly data-testid='attr'>
        <InlineEditPreview>hello</InlineEditPreview>
      </InlineEdit>,
    );
    const preview = screen.getByTestId('attr--preview');
    expect(preview).not.toHaveAttribute('role', 'button');
    await userEvent.click(preview);
    expect(screen.getByTestId('attr--preview')).toBeInTheDocument();
  });

  it('forwards arbitrary data-* attributes to the target node (metrics)', () => {
    render(
      <InlineEdit defaultValue='hello' data-testid='attr'>
        <InlineEditPreview data-analytics-id='ATTR_EDIT'>hello</InlineEditPreview>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--preview')).toHaveAttribute('data-analytics-id', 'ATTR_EDIT');
  });

  it('is inert while loading (no button role, click does not enter edit)', async () => {
    render(
      <InlineEdit defaultValue='hello' status='loading' data-testid='attr'>
        <InlineEditPreview>hello</InlineEditPreview>
      </InlineEdit>,
    );
    const preview = screen.getByTestId('attr--preview');
    expect(preview).not.toHaveAttribute('role', 'button');
    await userEvent.click(preview);
    expect(screen.getByTestId('attr--preview')).toBeInTheDocument();
  });

  it('is neutral standalone — no negative row margin', () => {
    render(
      <InlineEdit defaultValue='v' data-testid='ie'>
        <InlineEditPreview>v</InlineEditPreview>
      </InlineEdit>,
    );
    expect(screen.getByTestId('ie--preview').className).not.toContain('-my-4');
  });
});
