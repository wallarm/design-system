import { CalendarDate } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTestId } from '../../utils/testId';
import {
  CalendarBody,
  CalendarContent,
  CalendarGrids,
  CalendarInputHeader,
  CalendarTrigger,
  type DateValue,
} from '../Calendar';
import { DateInput } from '../DateInput';
import { toCalendarDateValue, toReactAriaDateValue, withMinuteGranularity } from './dateValueCast';
import { InlineEdit } from './InlineEdit';
import { useInlineEdit } from './InlineEditContext';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditDateTime } from './InlineEditDateTime';

function DateInputTrigger({ analyticsId }: { analyticsId?: string }) {
  const testId = useTestId('input');
  const { value, setValue } = useInlineEdit<DateValue | null>();
  return (
    <DateInput
      data-testid={testId}
      data-analytics-id={analyticsId}
      value={toReactAriaDateValue(withMinuteGranularity(value ?? null))}
      onChange={v => setValue(toCalendarDateValue(v))}
      granularity='minute'
    />
  );
}

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
        <InlineEditDateTime>
          <CalendarTrigger>
            <DateInputTrigger analyticsId={analyticsId} />
          </CalendarTrigger>
          <CalendarContent>
            <CalendarBody>
              <CalendarInputHeader />
              <CalendarGrids />
            </CalendarBody>
          </CalendarContent>
        </InlineEditDateTime>
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

  it('derives the shared input testId slot from the ambient InlineEdit root, with no wiring in InlineEditDateTime itself', () => {
    render(<Harness />);
    expect(screen.getByTestId('ie--input')).toBeInTheDocument();
  });

  it('forwards data-analytics-id to whatever node the consumer places it on', () => {
    render(<Harness analyticsId='date-edit' />);
    const target = document.querySelector('[data-analytics-id="date-edit"]');
    expect(target).toBe(screen.getByTestId('ie--input'));
  });
});
