import { createListCollection } from '@ark-ui/react/collection';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Select } from './Select';
import { SelectButton } from './SelectButton';
import { SelectClearTrigger } from './SelectClearTrigger';
import { SelectContent } from './SelectContent';
import { SelectOption } from './SelectOption';
import { SelectOptionText } from './SelectOptionText';
import { SelectPositioner } from './SelectPositioner';
import { SelectSearchInput } from './SelectSearchInput';

// Select is a compound API; analytics seams live on the exported
// sub-components (`SelectButton`, `SelectOption`, `SelectClearTrigger`,
// `SelectSearchInput`, `SelectInput`), NOT on the `<Select>` root. The Ark UI
// `Select.Root` is a logic-only context wrapper without its own DOM, so
// wrapper-level placement isn't a valid contract here. See
// docs/metrics/contract.md.

const items = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
];

const renderSelect = (extra?: { multiple?: boolean }) => {
  const collection = createListCollection({ items });
  return render(
    <Select collection={collection} multiple={extra?.multiple ?? false} data-testid='select'>
      <SelectButton data-testid='trigger' data-analytics-id='FRAMEWORK_TRIGGER' />
      <SelectPositioner>
        <SelectContent>
          <SelectSearchInput
            value=''
            onChange={() => undefined}
            data-testid='search'
            data-analytics-id='FRAMEWORK_SEARCH'
          />
          {items.map(item => (
            <SelectOption
              key={item.value}
              item={item}
              data-testid={`option-${item.value}`}
              data-analytics-id={`FRAMEWORK_${item.value.toUpperCase()}`}
            >
              <SelectOptionText>{item.label}</SelectOptionText>
            </SelectOption>
          ))}
          <SelectClearTrigger data-testid='clear' data-analytics-id='FRAMEWORK_CLEAR'>
            Clear
          </SelectClearTrigger>
        </SelectContent>
      </SelectPositioner>
    </Select>,
  );
};

describe('Attribute pass-through (compound seams)', () => {
  it('forwards data-analytics-id to the SelectButton <button>', () => {
    renderSelect();
    const trigger = screen.getByTestId('trigger');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('data-analytics-id', 'FRAMEWORK_TRIGGER');
  });

  it('forwards data-analytics-props verbatim on the SelectButton', () => {
    const payload = '{"feature":"framework-picker"}';
    const collection = createListCollection({ items });
    render(
      <Select collection={collection}>
        <SelectButton
          data-testid='trigger'
          data-analytics-id='FRAMEWORK_TRIGGER'
          data-analytics-props={payload}
        />
      </Select>,
    );
    expect(screen.getByTestId('trigger')).toHaveAttribute('data-analytics-props', payload);
  });

  it('forwards data-analytics-id to each SelectOption', async () => {
    renderSelect();
    await userEvent.click(screen.getByTestId('trigger'));

    const reactOption = await screen.findByTestId('option-react');
    expect(reactOption).toHaveAttribute('data-analytics-id', 'FRAMEWORK_REACT');

    const vueOption = screen.getByTestId('option-vue');
    expect(vueOption).toHaveAttribute('data-analytics-id', 'FRAMEWORK_VUE');
  });

  it('forwards data-analytics-id to the SelectClearTrigger <button>', async () => {
    renderSelect();
    await userEvent.click(screen.getByTestId('trigger'));

    const clear = await screen.findByTestId('clear');
    expect(clear.tagName).toBe('BUTTON');
    expect(clear).toHaveAttribute('data-analytics-id', 'FRAMEWORK_CLEAR');
  });

  it('forwards data-analytics-id to the SelectSearchInput container', async () => {
    renderSelect();
    await userEvent.click(screen.getByTestId('trigger'));

    const search = await screen.findByTestId('search');
    expect(search).toHaveAttribute('data-analytics-id', 'FRAMEWORK_SEARCH');
  });
});

describe('Click resolution', () => {
  it('resolves clicks on a SelectOption to its analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    renderSelect();
    await userEvent.click(screen.getByTestId('trigger'));
    const reactOption = await screen.findByTestId('option-react');
    await userEvent.click(reactOption);
    expect(captured).toHaveBeenCalledWith('FRAMEWORK_REACT');
  });

  it('resolves clicks on the SelectButton to its analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    renderSelect();
    await userEvent.click(screen.getByTestId('trigger'));
    expect(captured).toHaveBeenCalledWith('FRAMEWORK_TRIGGER');
  });
});

describe('State persistence', () => {
  it('keeps analytics-id on the trigger after open → close cycle', async () => {
    renderSelect();
    const trigger = screen.getByTestId('trigger');

    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');

    expect(screen.getByTestId('trigger')).toHaveAttribute('data-analytics-id', 'FRAMEWORK_TRIGGER');
  });

  it('keeps analytics-id on a SelectOption after value change', async () => {
    renderSelect({ multiple: true });
    await userEvent.click(screen.getByTestId('trigger'));

    const reactOption = await screen.findByTestId('option-react');
    await userEvent.click(reactOption);

    // Re-open and verify the option still has its analytics-id.
    await userEvent.click(screen.getByTestId('trigger'));
    const reactOptionAfter = await screen.findByTestId('option-react');
    expect(reactOptionAfter).toHaveAttribute('data-analytics-id', 'FRAMEWORK_REACT');
  });
});
