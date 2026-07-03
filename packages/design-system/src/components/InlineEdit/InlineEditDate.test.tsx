import { CalendarDate } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalendarBody, CalendarContent, CalendarGrids, CalendarTrigger } from '../Calendar';
import { DateInput } from '../DateInput';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditDate } from './InlineEditDate';

function Harness({
  onCommit,
  showTime = false,
  analyticsId,
}: {
  onCommit?: (v: unknown) => void;
  showTime?: boolean;
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
        <InlineEditDate showTime={showTime} data-analytics-id={analyticsId} />
      </InlineEditControl>
    </InlineEdit>
  );
}

describe('InlineEditDate', () => {
  it('renders the calendar open with the segmented trigger input pre-filled', async () => {
    render(<Harness />);
    // Portaled content is present (defaultOpen) — grid day cells exist.
    expect(document.querySelector('[data-scope="date-picker"][data-part="content"]')).toBeTruthy();
    expect(screen.getByTestId('ie--input')).toBeInTheDocument();
  });

  it('showTime mode renders the time-aware header', () => {
    render(<Harness showTime />);
    const content = document.querySelector('[data-scope="date-picker"][data-part="content"]');
    expect(content).toBeTruthy();
    // CalendarInputHeader renders a minute-granularity DateInput in the popover
    // header when showTime is set — its segments carry `data-segment` (see
    // TemporalSegment.tsx), so hour/minute segments prove the time-aware
    // header (rather than the day-only header) rendered.
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
    // Same node as the wrapper carrying the derived testId (documented gap:
    // ANALYTICS_GAPS.md — attributes land on the wrapper, not the segments).
    expect(target).toBe(screen.getByTestId('ie--input'));
    expect(target?.querySelector('[data-segment]')).toBeTruthy();
    // The focusable segments themselves must not carry the attribute.
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
          <InlineEditDate>
            <CalendarTrigger>
              <DateInput
                data-testid='custom-date-input'
                value={null}
                onChange={() => {}}
                granularity='day'
                showIcon={false}
              />
            </CalendarTrigger>
            <CalendarContent>
              <CalendarBody>
                <CalendarGrids />
              </CalendarBody>
            </CalendarContent>
          </InlineEditDate>
        </InlineEditControl>
      </InlineEdit>,
    );
    // defaultOpen wiring stays on the root regardless of composition — the
    // portaled popover content renders through the children path too.
    expect(document.querySelector('[data-scope="date-picker"][data-part="content"]')).toBeTruthy();
    expect(screen.getByTestId('custom-date-input')).toBeInTheDocument();
    // The children path replaces the default composition entirely — the
    // default DateInput (which would carry the shared `input` testId slot)
    // must not also render.
    expect(screen.queryByTestId('ie--input')).not.toBeInTheDocument();
  });
});
