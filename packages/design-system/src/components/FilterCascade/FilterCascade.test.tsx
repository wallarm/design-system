import { describe, expect, it, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FilterCascade, type FilterCascadeProps } from './FilterCascade';
import { FilterCascadeContent } from './FilterCascadeContent';
import { FilterCascadeTrigger } from './FilterCascadeTrigger';
import { createFilterCascadeCollection } from './lib';

// Analytics seams: `FilterCascadeTrigger` renders the real <button> and forwards consumer props
// to it; the ✕ and the options are rendered by the component (see ANALYTICS_GAPS.md).

const collection = createFilterCascadeCollection([
  { value: 'org', label: 'Organization only' },
  {
    value: 'prod',
    label: 'Production US',
    description: '4 policies',
    children: [
      { value: 'api', label: 'api' },
      { value: 'checkout', label: 'checkout' },
    ],
  },
]);

const Harness = (props: Partial<FilterCascadeProps>) => (
  <FilterCascade label='Scope' collection={collection} data-testid='scope' {...props}>
    <FilterCascadeTrigger data-analytics-id='SCOPE' />
    <FilterCascadeContent />
  </FilterCascade>
);

describe('FilterCascade', () => {
  it('reads the label while unset and puts consumer props on the trigger button', () => {
    render(<Harness />);
    const trigger = screen.getByTestId('scope--trigger');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('data-analytics-id', 'SCOPE');
    expect(trigger).toHaveAccessibleName('Scope');
    expect(screen.queryByRole('button', { name: 'Clear Scope' })).not.toBeInTheDocument();
  });

  it('opens the next level on hover and picks a leaf as a path', async () => {
    const onValueChange = rs.fn();
    render(<Harness onValueChange={onValueChange} />);
    await userEvent.click(screen.getByTestId('scope--trigger'));

    expect(await screen.findByText('Production US')).toBeInTheDocument();
    expect(screen.getByText('4 policies')).toBeInTheDocument();
    await userEvent.hover(screen.getByText('Production US'));
    await userEvent.click(await screen.findByText('checkout'));

    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: ['prod', 'checkout'] }),
    );
    await waitFor(() =>
      expect(screen.getByTestId('scope--trigger')).toHaveAccessibleName(
        'Scope, Production US › checkout',
      ),
    );
  });

  it('lets a node that opens a level be picked itself', async () => {
    const onValueChange = rs.fn();
    render(<Harness onValueChange={onValueChange} />);
    await userEvent.click(screen.getByTestId('scope--trigger'));
    await userEvent.click(await screen.findByText('Production US'));
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: ['prod'] }));
  });

  it('clears the path with the ✕', async () => {
    const onValueChange = rs.fn();
    render(<Harness defaultValue={['prod', 'api']} onValueChange={onValueChange} />);
    expect(screen.getByTestId('scope--trigger')).toHaveAccessibleName('Scope, Production US › api');
    await userEvent.click(screen.getByRole('button', { name: 'Clear Scope' }));
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: [] }));
    expect(screen.getByTestId('scope--trigger')).toHaveAccessibleName('Scope');
  });
});
