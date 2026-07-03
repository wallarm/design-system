import { CalendarDate } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditDate } from './InlineEditDate';

function Harness({
  onCommit,
  showTime = false,
}: {
  onCommit?: (v: unknown) => void;
  showTime?: boolean;
}) {
  return (
    <InlineEdit
      defaultValue={new CalendarDate(2026, 6, 15)}
      defaultEdit
      onValueCommit={onCommit}
      data-testid='ie'
    >
      <InlineEditControl>
        <InlineEditDate showTime={showTime} />
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
});
