import { createListCollection } from '@ark-ui/react/collection';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Select } from './Select';
import { SelectButton } from './SelectButton';
import { SelectClearTrigger } from './SelectClearTrigger';
import { SelectContent } from './SelectContent';
import { SelectInput } from './SelectInput';
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

    // Re-open and verify the option still has its analytics-id. The default
    // findByTestId timeout (1000ms) can lose the race against the
    // close→reopen remount cycle (zag-js tears the option list down on
    // close via its presence/exit-enter machine, then rebuilds it here)
    // under CI-runner load, so give it more headroom than the first query.
    await userEvent.click(screen.getByTestId('trigger'));
    const reactOptionAfter = await screen.findByTestId('option-react', {}, { timeout: 5000 });
    expect(reactOptionAfter).toHaveAttribute('data-analytics-id', 'FRAMEWORK_REACT');
  });
});

describe('Size variants', () => {
  const collection = createListCollection({ items });

  it('SelectButton defaults to the default (36px) height with no size prop', () => {
    render(
      <Select collection={collection} data-testid='select'>
        <SelectButton data-testid='trigger' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-36');
  });

  it('SelectButton renders the medium (32px) height', () => {
    render(
      <Select collection={collection} data-testid='select'>
        <SelectButton data-testid='trigger' size='medium' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-32');
  });

  it('SelectButton renders the small (24px) height', () => {
    render(
      <Select collection={collection} data-testid='select'>
        <SelectButton data-testid='trigger' size='small' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-24');
  });

  it('SelectButton renders the inline-edit (28px) height', () => {
    render(
      <Select collection={collection} data-testid='select'>
        <SelectButton data-testid='trigger' size='inline-edit' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-28');
  });

  it('SelectInput defaults to the default (36px) height with no size prop', () => {
    render(
      <Select collection={collection} multiple data-testid='select'>
        <SelectInput data-testid='trigger' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-36');
  });

  it('SelectInput renders the medium (32px) height', () => {
    render(
      <Select collection={collection} multiple data-testid='select'>
        <SelectInput data-testid='trigger' size='medium' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-32');
  });

  it('SelectInput renders the small (24px) height', () => {
    render(
      <Select collection={collection} multiple data-testid='select'>
        <SelectInput data-testid='trigger' size='small' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-24');
  });

  it('SelectInput scales its item Tags to medium at small size (large would leave no vertical margin in a 24px row)', () => {
    render(
      <Select collection={collection} multiple defaultValue={['react']} data-testid='select'>
        <SelectInput data-testid='trigger' size='small' />
      </Select>,
    );
    const tag = document.querySelector('[data-slot="tag"]');
    expect(tag?.className).toContain('h-20');
  });

  it('SelectInput keeps its item Tags at large for medium/default sizes', () => {
    render(
      <Select collection={collection} multiple defaultValue={['react']} data-testid='select'>
        <SelectInput data-testid='trigger' size='medium' />
      </Select>,
    );
    const tag = document.querySelector('[data-slot="tag"]');
    expect(tag?.className).toContain('h-24');
  });
});
