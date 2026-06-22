import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';
import { RadioIndicator } from './RadioIndicator';
import { RadioLabel } from './RadioLabel';

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to the <label> click target', () => {
    render(
      <RadioGroup name='framework'>
        <Radio value='react' data-testid='radio' data-analytics-id='PICK_REACT'>
          <RadioIndicator />
          <RadioLabel>React</RadioLabel>
        </Radio>
      </RadioGroup>,
    );

    const root = screen.getByTestId('radio');
    expect(root.tagName).toBe('LABEL');
    expect(root).toHaveAttribute('data-analytics-id', 'PICK_REACT');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'framework', value: 'react' });

    render(
      <RadioGroup name='framework'>
        <Radio
          value='react'
          data-testid='radio'
          data-analytics-id='PICK_REACT'
          data-analytics-props={payload}
        >
          <RadioIndicator />
          <RadioLabel>React</RadioLabel>
        </Radio>
      </RadioGroup>,
    );

    const root = screen.getByTestId('radio');
    expect(root).toHaveAttribute('data-analytics-id', 'PICK_REACT');
    expect(root).toHaveAttribute('data-analytics-props', payload);
  });

  it('does not silently re-route to the hidden <input>', () => {
    render(
      <RadioGroup name='framework'>
        <Radio value='react' data-testid='radio' data-analytics-id='PICK_REACT'>
          <RadioIndicator />
          <RadioLabel>React</RadioLabel>
        </Radio>
      </RadioGroup>,
    );

    const input = document.querySelector('input[type="radio"]');
    expect(input).not.toBeNull();
    expect(input).not.toHaveAttribute('data-analytics-id');
  });

  it('user clicks resolve to the data-analytics-id element via closest()', async () => {
    const captured = captureAnalyticsClicks();

    render(
      <RadioGroup name='framework'>
        <Radio value='react' data-testid='radio' data-analytics-id='PICK_REACT'>
          <RadioIndicator />
          <RadioLabel>React</RadioLabel>
        </Radio>
      </RadioGroup>,
    );
    await userEvent.click(screen.getByTestId('radio'));

    expect(captured).toHaveBeenCalledWith('PICK_REACT');
  });
});
