import { Time } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { useInlineEdit } from './InlineEditContext';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditTime } from './InlineEditTime';

function Harness() {
  return (
    <InlineEdit defaultValue={new Time(14, 30)} defaultEdit data-testid='ie'>
      <InlineEditControl>
        <InlineEditTime />
      </InlineEditControl>
    </InlineEdit>
  );
}

describe('InlineEditTime', () => {
  it('renders the time input with the shared input testId slot', () => {
    render(<Harness />);
    expect(screen.getByTestId('ie--input')).toBeInTheDocument();
  });

  it('forwards data-analytics-id to the TimeInput wrapper, not the focusable segments', () => {
    render(
      <InlineEdit defaultValue={new Time(14, 30)} defaultEdit data-testid='ie'>
        <InlineEditControl>
          <InlineEditTime data-analytics-id='time-edit' />
        </InlineEditControl>
      </InlineEdit>,
    );
    const target = document.querySelector('[data-analytics-id="time-edit"]');
    // Same node as the wrapper carrying the derived testId (documented gap:
    // ANALYTICS_GAPS.md — attributes land on the wrapper, not the segments).
    expect(target).toBe(screen.getByTestId('ie--input'));
    expect(target?.querySelector('[data-segment]')).toBeTruthy();
    // The focusable segments themselves must not carry the attribute.
    expect(target?.querySelectorAll('[data-segment][data-analytics-id]')).toHaveLength(0);
  });

  it('registers the blur submit mode', () => {
    function ModeProbe() {
      const { submitMode } = useInlineEdit();
      return <span data-testid='mode'>{submitMode}</span>;
    }
    render(
      <InlineEdit defaultValue={new Time(14, 30)} defaultEdit submitMode='both' data-testid='ie'>
        <InlineEditControl>
          <InlineEditTime />
          <ModeProbe />
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('blur');
  });

  it('defaults to the small (24px) size, matching the rest of InlineEdit', () => {
    render(<Harness />);
    const group = screen.getByTestId('ie--input').querySelector('[data-slot="input-group"]');
    expect(group).toHaveClass('h-24');
  });
});
