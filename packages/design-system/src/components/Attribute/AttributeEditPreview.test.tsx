import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AttributeEdit } from './AttributeEdit';
import { AttributeEditPreview } from './AttributeEditPreview';

describe('AttributeEditPreview', () => {
  it('renders the value and enters edit on click', async () => {
    render(
      <AttributeEdit defaultValue='hello' data-testid='attr'>
        <AttributeEditPreview>hello</AttributeEditPreview>
      </AttributeEdit>,
    );
    const preview = screen.getByTestId('attr--edit-preview');
    expect(preview).toHaveTextContent('hello');
    expect(preview).toHaveAttribute('role', 'button');
    await userEvent.click(preview);
    // preview unmounts in edit mode
    expect(screen.queryByTestId('attr--edit-preview')).toBeNull();
  });

  it('enters edit via keyboard (Enter)', async () => {
    render(
      <AttributeEdit defaultValue='hello' data-testid='attr'>
        <AttributeEditPreview>hello</AttributeEditPreview>
      </AttributeEdit>,
    );
    screen.getByTestId('attr--edit-preview').focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.queryByTestId('attr--edit-preview')).toBeNull();
  });

  it('is not activatable when readOnly', async () => {
    render(
      <AttributeEdit defaultValue='hello' readOnly data-testid='attr'>
        <AttributeEditPreview>hello</AttributeEditPreview>
      </AttributeEdit>,
    );
    const preview = screen.getByTestId('attr--edit-preview');
    expect(preview).not.toHaveAttribute('role', 'button');
    await userEvent.click(preview);
    expect(screen.getByTestId('attr--edit-preview')).toBeInTheDocument();
  });

  it('forwards arbitrary data-* attributes to the target node (metrics)', () => {
    render(
      <AttributeEdit defaultValue='hello' data-testid='attr'>
        <AttributeEditPreview data-analytics-id='ATTR_EDIT'>hello</AttributeEditPreview>
      </AttributeEdit>,
    );
    expect(screen.getByTestId('attr--edit-preview')).toHaveAttribute(
      'data-analytics-id',
      'ATTR_EDIT',
    );
  });

  it('is inert while loading (no button role, click does not enter edit)', async () => {
    render(
      <AttributeEdit defaultValue='hello' status='loading' data-testid='attr'>
        <AttributeEditPreview>hello</AttributeEditPreview>
      </AttributeEdit>,
    );
    const preview = screen.getByTestId('attr--edit-preview');
    expect(preview).not.toHaveAttribute('role', 'button');
    await userEvent.click(preview);
    expect(screen.getByTestId('attr--edit-preview')).toBeInTheDocument();
  });
});
