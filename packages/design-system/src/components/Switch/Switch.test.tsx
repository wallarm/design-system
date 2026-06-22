import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Switch } from './Switch';

describe('Attribute pass-through', () => {
  it('forwards arbitrary data-* to the root element', () => {
    render(
      <Switch data-testid='switch' data-analytics-id='TOGGLE_BETA'>
        Beta features
      </Switch>,
    );

    expect(screen.getByTestId('switch')).toHaveAttribute('data-analytics-id', 'TOGGLE_BETA');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'settings', field: 'beta' });

    render(
      <Switch data-testid='switch' data-analytics-id='TOGGLE_BETA' data-analytics-props={payload}>
        Beta features
      </Switch>,
    );

    const root = screen.getByTestId('switch');
    expect(root).toHaveAttribute('data-analytics-id', 'TOGGLE_BETA');
    expect(root).toHaveAttribute('data-analytics-props', payload);
  });

  it('does not let {...rest} fight disabled defaults', () => {
    render(
      <Switch disabled data-testid='switch' data-analytics-id='X'>
        Beta features
      </Switch>,
    );

    const root = screen.getByTestId('switch');
    expect(root).toHaveAttribute('data-analytics-id', 'X');
    expect(root).toHaveAttribute('data-disabled');
  });

  it('user clicks resolve to the data-analytics-id element via closest()', async () => {
    const captured = captureAnalyticsClicks();

    render(
      <Switch data-testid='switch' data-analytics-id='TOGGLE_BETA'>
        Beta features
      </Switch>,
    );
    await userEvent.click(screen.getByTestId('switch'));

    expect(captured).toHaveBeenCalledWith('TOGGLE_BETA');
  });

  it('does not strand data-analytics-id on the hidden <input>', () => {
    render(
      <Switch data-testid='switch' data-analytics-id='TOGGLE_BETA'>
        Beta features
      </Switch>,
    );

    expect(screen.getByRole('checkbox')).not.toHaveAttribute('data-analytics-id');
  });
});
