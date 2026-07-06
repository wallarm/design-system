import { CalendarDate } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTestId } from '../../utils/testId';
import {
  CalendarBody,
  CalendarContent,
  CalendarGrids,
  CalendarTrigger,
  type DateValue,
} from '../Calendar';
import { DateInput } from '../DateInput';
import { toCalendarDateValue, toReactAriaDateValue } from './dateValueCast';
import { InlineEdit } from './InlineEdit';
import { useInlineEdit } from './InlineEditContext';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditDate } from './InlineEditDate';

// `useTestId`/`useInlineEdit` only resolve correctly from a component
// rendered as a descendant of <InlineEdit> — must be its own component, not
// called at the top of the Harness (which renders <InlineEdit> itself).
function DateInputTrigger({ analyticsId }: { analyticsId?: string }) {
  const testId = useTestId('input');
  const { value, setValue } = useInlineEdit<DateValue | null>();
  return (
    <DateInput
      data-testid={testId}
      data-analytics-id={analyticsId}
      value={toReactAriaDateValue(value ?? null)}
      onChange={v => setValue(toCalendarDateValue(v))}
      granularity='day'
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
        <InlineEditDate>
          <CalendarTrigger>
            <DateInputTrigger analyticsId={analyticsId} />
          </CalendarTrigger>
          <CalendarContent>
            <CalendarBody>
              <CalendarGrids />
            </CalendarBody>
          </CalendarContent>
        </InlineEditDate>
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

  it('derives the shared input testId slot from the ambient InlineEdit root, with no wiring in InlineEditDate itself', () => {
    render(<Harness />);
    expect(screen.getByTestId('ie--input')).toBeInTheDocument();
  });

  it('forwards data-analytics-id to whatever node the consumer places it on', () => {
    render(<Harness analyticsId='date-edit' />);
    const target = document.querySelector('[data-analytics-id="date-edit"]');
    expect(target).toBe(screen.getByTestId('ie--input'));
  });
});
