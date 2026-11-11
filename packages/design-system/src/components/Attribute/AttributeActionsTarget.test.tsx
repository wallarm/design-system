import { describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AttributeActions } from './AttributeActions';
import { AttributeActionsContent } from './AttributeActionsContent';
import { AttributeActionsItem } from './AttributeActionsItem';
import { AttributeActionsTarget } from './AttributeActionsTarget';

const Actions = ({ onNestedClick = () => {} }: { onNestedClick?: () => void }) => (
  <AttributeActions>
    <AttributeActionsTarget aria-label='Attribute actions' data-analytics-id='ATTRIBUTE_ACTIONS'>
      Attribute value
      <button type='button' onClick={onNestedClick}>
        Nested action
      </button>
    </AttributeActionsTarget>
    <AttributeActionsContent>
      <AttributeActionsItem value='copy'>Copy value</AttributeActionsItem>
    </AttributeActionsContent>
  </AttributeActions>
);

describe('AttributeActionsTarget keyboard access', () => {
  it.each(['{Enter}', ' '])('opens the menu from the focusable trigger with %s', async key => {
    const user = userEvent.setup();
    render(<Actions />);
    const trigger = screen.getByRole('button', { name: 'Attribute actions' });
    expect(trigger).toHaveAttribute('data-analytics-id', 'ATTRIBUTE_ACTIONS');
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard(key);
    expect(await screen.findByRole('menuitem', { name: 'Copy value' })).toBeVisible();
  });

  it('keeps nested actions independent of the surrounding menu trigger', async () => {
    const user = userEvent.setup();
    const onNestedClick = rs.fn();
    render(<Actions onNestedClick={onNestedClick} />);
    await user.click(screen.getByRole('button', { name: 'Nested action' }));
    expect(onNestedClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });
});
