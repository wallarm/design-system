import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  EditingProvider,
  useEditingContext,
} from '../FilterInputField/FilterInputChip/context/EditingContext';
import { FilterInputChip } from '../FilterInputField/FilterInputChip/FilterInputChip';

/** Helper that renders a consumer and returns the context value */
const ContextInspector = () => {
  const ctx = useEditingContext();
  return <div data-testid='ctx'>{ctx ? 'has-context' : 'no-context'}</div>;
};

// biome-ignore lint/suspicious/noEmptyBlockStatements: test stub
const noop = () => {};

describe('EditingContext', () => {
  it('returns null when no provider is present', () => {
    render(<ContextInspector />);
    expect(screen.getByTestId('ctx')).toHaveTextContent('no-context');
  });

  it('provides editing context to descendants', () => {
    render(
      <EditingProvider
        editingChipId='chip-0'
        editingSegment='attribute'
        segmentFilterText='IP'
        onSegmentFilterChange={noop}
        onSegmentEditKeyDown={noop}
        onSegmentEditBlur={noop}
      >
        <ContextInspector />
      </EditingProvider>,
    );
    expect(screen.getByTestId('ctx')).toHaveTextContent('has-context');
  });
});

describe('FilterInputChip with EditingContext', () => {
  it('renders in read mode when no editing context', () => {
    render(<FilterInputChip attribute='IP Address' operator='is' value='1.2.3.4' />);
    expect(screen.getByText('IP Address')).toBeInTheDocument();
    expect(screen.getByText('is')).toBeInTheDocument();
    expect(screen.getByText('1.2.3.4')).toBeInTheDocument();
    // No input elements
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders in read mode when editing context targets a different chip', () => {
    render(
      <EditingProvider
        editingChipId='chip-99'
        editingSegment='attribute'
        segmentFilterText='test'
        onSegmentFilterChange={noop}
        onSegmentEditKeyDown={noop}
        onSegmentEditBlur={noop}
      >
        <FilterInputChip chipId='chip-0' attribute='IP Address' operator='is' value='1.2.3.4' />
      </EditingProvider>,
    );
    expect(screen.getByText('IP Address')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('shows input when editing context targets this chip', () => {
    const onChange = vi.fn();
    render(
      <EditingProvider
        editingChipId='chip-0'
        editingSegment='attribute'
        segmentFilterText='IP'
        onSegmentFilterChange={onChange}
        onSegmentEditKeyDown={noop}
        onSegmentEditBlur={noop}
      >
        <FilterInputChip chipId='chip-0' attribute='IP Address' operator='is' value='1.2.3.4' />
      </EditingProvider>,
    );
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('IP');
  });

  it('calls onSegmentFilterChange when input value changes', () => {
    const onChange = vi.fn();
    render(
      <EditingProvider
        editingChipId='chip-0'
        editingSegment='value'
        segmentFilterText='old'
        onSegmentFilterChange={onChange}
        onSegmentEditKeyDown={noop}
        onSegmentEditBlur={noop}
      >
        <FilterInputChip chipId='chip-0' attribute='IP' operator='is' value='1.2.3.4' />
      </EditingProvider>,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new-value' } });
    expect(onChange).toHaveBeenCalledWith('new-value');
  });

  it('shows input for operator segment (inline-editable for filtering)', () => {
    render(
      <EditingProvider
        editingChipId='chip-0'
        editingSegment='operator'
        segmentFilterText='is'
        onSegmentFilterChange={noop}
        onSegmentEditKeyDown={noop}
        onSegmentEditBlur={noop}
      >
        <FilterInputChip chipId='chip-0' attribute='IP' operator='is' value='1.2.3.4' />
      </EditingProvider>,
    );
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('is');
  });

  it('does not show input for non-matching segment', () => {
    render(
      <EditingProvider
        editingChipId='chip-0'
        editingSegment='attribute'
        segmentFilterText='IP'
        onSegmentFilterChange={noop}
        onSegmentEditKeyDown={noop}
        onSegmentEditBlur={noop}
      >
        <FilterInputChip chipId='chip-0' attribute='IP Address' operator='is' value='1.2.3.4' />
      </EditingProvider>,
    );
    // Only one input (for attribute), operator and value remain as text
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(1);
    expect(screen.getByText('is')).toBeInTheDocument();
    expect(screen.getByText('1.2.3.4')).toBeInTheDocument();
  });

  it('does not show input when chipId is not provided', () => {
    render(
      <EditingProvider
        editingChipId='chip-0'
        editingSegment='attribute'
        segmentFilterText='IP'
        onSegmentFilterChange={noop}
        onSegmentEditKeyDown={noop}
        onSegmentEditBlur={noop}
      >
        <FilterInputChip attribute='IP Address' operator='is' value='1.2.3.4' />
      </EditingProvider>,
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
