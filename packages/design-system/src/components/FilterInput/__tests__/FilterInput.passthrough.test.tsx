import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { captureAnalyticsClicks } from '../../../testUtils/captureAnalyticsClicks';
import { FilterInput } from '../FilterInput';
import { FilterInputChip } from '../FilterInputField';
import type { FieldMetadata } from '../types';

// FilterInput is wrapper-level by accepted contract — see
// docs/metrics/contract.md. The `data-analytics-id` consumers pass
// to `<FilterInput>` lands on the inner field `<div data-slot='filter-input'>`,
// which is the actual interactive surface. Inner chips, segments, gap buttons,
// and action buttons all inherit the id via SDK closest() resolution. Advanced
// consumers who build custom layouts with the exported `FilterInputChip` can
// attach per-chip analytics directly to each chip.

const sampleFields: FieldMetadata[] = [
  {
    name: 'status',
    label: 'Status',
    type: 'enum',
    values: [{ value: 'active', label: 'Active' }],
  },
];

describe('Attribute pass-through (wrapper-level)', () => {
  it('forwards data-analytics-id to the field wrapper <div>', () => {
    render(
      <FilterInput fields={sampleFields} data-testid='filter' data-analytics-id='RULES_FILTER' />,
    );

    const root = screen.getByTestId('filter');
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveAttribute('data-analytics-id', 'RULES_FILTER');
    expect(root).toHaveAttribute('data-slot', 'filter-input');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'rules', view: 'list' });

    render(
      <FilterInput
        fields={sampleFields}
        data-testid='filter'
        data-analytics-id='RULES_FILTER'
        data-analytics-props={payload}
      />,
    );

    const root = screen.getByTestId('filter');
    expect(root).toHaveAttribute('data-analytics-id', 'RULES_FILTER');
    expect(root).toHaveAttribute('data-analytics-props', payload);
  });

  it('preserves the attr across a chip add', async () => {
    render(
      <FilterInput fields={sampleFields} data-testid='filter' data-analytics-id='RULES_FILTER' />,
    );

    const input = screen.getByPlaceholderText('Type to filter...');
    await userEvent.click(input);
    await userEvent.keyboard('{Escape}');

    expect(screen.getByTestId('filter')).toHaveAttribute('data-analytics-id', 'RULES_FILTER');
  });
});

describe('Click resolution', () => {
  it('captures clicks on the inner search input under the wrapper analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <FilterInput fields={sampleFields} data-testid='filter' data-analytics-id='RULES_FILTER' />,
    );

    const input = screen.getByPlaceholderText('Type to filter...');
    await userEvent.click(input);

    expect(captured).toHaveBeenCalledWith('RULES_FILTER');
  });

  it('captures clicks on the field wrapper itself under the wrapper analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <FilterInput fields={sampleFields} data-testid='filter' data-analytics-id='RULES_FILTER' />,
    );

    await userEvent.click(screen.getByTestId('filter'));

    expect(captured).toHaveBeenCalledWith('RULES_FILTER');
  });
});

describe('Compound seam: per-chip analytics', () => {
  it('forwards data-analytics-id directly to an exported FilterInputChip <div>', () => {
    render(
      <FilterInputChip
        data-testid='chip'
        data-analytics-id='CHIP_STATUS_EQ_ACTIVE'
        attribute='status'
        operator='='
        value='active'
      />,
    );

    const chip = screen.getByTestId('chip');
    expect(chip.tagName).toBe('DIV');
    expect(chip).toHaveAttribute('data-analytics-id', 'CHIP_STATUS_EQ_ACTIVE');
    expect(chip).toHaveAttribute('data-slot', 'filter-input-condition-chip');
  });

  it('forwards data-analytics-props verbatim on the exported FilterInputChip', () => {
    const payload = '{"chip":"status=active"}';
    render(
      <FilterInputChip
        data-testid='chip'
        data-analytics-props={payload}
        attribute='status'
        operator='='
        value='active'
      />,
    );

    expect(screen.getByTestId('chip')).toHaveAttribute('data-analytics-props', payload);
  });
});
