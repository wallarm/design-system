import { CalendarDate } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalendarBody, CalendarContent, CalendarGrids, CalendarTrigger } from '../Calendar';
import { DateInput } from '../DateInput';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditDateTime } from './InlineEditDateTime';

function Harness({
  onCommit,
  analyticsId,
}: {
  onCommit?: (v: unknown) => void;
  analyticsId?: string;
}) {
  return (
    <InlineEdit
      defaultValue={new CalendarDate(2026, 6, 15)}
      defaultEdit
      onValueCommit={onCommit}
      data-testid='ie'
    >
      <InlineEditControl>
        <InlineEditDateTime data-analytics-id={analyticsId} />
      </InlineEditControl>
    </InlineEdit>
  );
}

describe('InlineEditDateTime', () => {
  it('renders the calendar open with the time-aware header', () => {
    render(<Harness />);
    const content = document.querySelector('[data-scope="date-picker"][data-part="content"]');
    expect(content).toBeTruthy();
    // CalendarInputHeader renders a minute-granularity DateInput in the popover
    // header — its segments carry `data-segment` (see TemporalSegment.tsx), so
    // hour/minute segments prove the time-aware header rendered.
    expect(content?.querySelector('[data-segment="hour"]')).toBeTruthy();
    expect(content?.querySelector('[data-segment="minute"]')).toBeTruthy();
  });

  it('derives the shared input testId slot on the DateInput wrapper', () => {
    render(<Harness />);
    expect(screen.getByTestId('ie--input')).toBeInTheDocument();
  });

  it('forwards data-analytics-id to the DateInput wrapper, not the focusable segments', () => {
    render(<Harness analyticsId='date-edit' />);
    const target = document.querySelector('[data-analytics-id="date-edit"]');
    expect(target).toBe(screen.getByTestId('ie--input'));
    expect(target?.querySelector('[data-segment]')).toBeTruthy();
    expect(target?.querySelectorAll('[data-segment][data-analytics-id]')).toHaveLength(0);
  });

  it('children compose ordinary Calendar parts inside the prewired root (bound-root pattern)', () => {
    const onCommit = vi.fn();
    render(
      <InlineEdit
        defaultValue={new CalendarDate(2026, 6, 15)}
        defaultEdit
        onValueCommit={onCommit}
        data-testid='ie'
      >
        <InlineEditControl>
          <InlineEditDateTime>
            <CalendarTrigger>
              <DateInput
                data-testid='custom-date-input'
                value={null}
                onChange={() => {}}
                granularity='minute'
                showIcon={false}
              />
            </CalendarTrigger>
            <CalendarContent>
              <CalendarBody>
                <CalendarGrids />
              </CalendarBody>
            </CalendarContent>
          </InlineEditDateTime>
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(document.querySelector('[data-scope="date-picker"][data-part="content"]')).toBeTruthy();
    expect(screen.getByTestId('custom-date-input')).toBeInTheDocument();
    expect(screen.queryByTestId('ie--input')).not.toBeInTheDocument();
  });
});
