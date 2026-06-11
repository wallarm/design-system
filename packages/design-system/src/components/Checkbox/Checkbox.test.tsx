import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Checkbox } from './Checkbox';

describe('Attribute pass-through', () => {
  it('forwards arbitrary data-* to the root element', () => {
    render(
      <Checkbox data-testid='checkbox' data-analytics-id='ACCEPT_TOS'>
        Accept
      </Checkbox>,
    );

    expect(screen.getByTestId('checkbox')).toHaveAttribute('data-analytics-id', 'ACCEPT_TOS');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'settings', field: 'accept-tos' });

    render(
      <Checkbox
        data-testid='checkbox'
        data-analytics-id='ACCEPT_TOS'
        data-analytics-props={payload}
      >
        Accept
      </Checkbox>,
    );

    const root = screen.getByTestId('checkbox');
    expect(root).toHaveAttribute('data-analytics-id', 'ACCEPT_TOS');
    expect(root).toHaveAttribute('data-analytics-props', payload);
  });

  it('does not let {...rest} fight disabled defaults', () => {
    render(
      <Checkbox disabled data-testid='checkbox' data-analytics-id='X'>
        Accept
      </Checkbox>,
    );

    const root = screen.getByTestId('checkbox');
    expect(root).toHaveAttribute('data-analytics-id', 'X');
    expect(root).toHaveAttribute('data-disabled');
  });

  it('user clicks resolve to the data-analytics-id element via closest()', async () => {
    const captured = captureAnalyticsClicks();

    render(
      <Checkbox data-testid='checkbox' data-analytics-id='ACCEPT_TOS'>
        Accept
      </Checkbox>,
    );
    await userEvent.click(screen.getByTestId('checkbox'));

    expect(captured).toHaveBeenCalledWith('ACCEPT_TOS');
  });

  it('does not strand data-analytics-id on the hidden <input>', () => {
    render(
      <Checkbox data-testid='checkbox' data-analytics-id='ACCEPT_TOS'>
        Accept
      </Checkbox>,
    );

    expect(screen.getByRole('checkbox')).not.toHaveAttribute('data-analytics-id');
  });
});
