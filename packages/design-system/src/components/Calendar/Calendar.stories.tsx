import { useState } from 'react';
import type { DatePicker } from '@ark-ui/react';
import { getLocalTimeZone, today } from '@internationalized/date';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Calendar as CalendarIcon } from '../../icons/Calendar';
import { Button } from '../Button';
import { Calendar, DEFAULT_RANGE_PRESETS } from './Calendar';
import { CalendarApplyButton } from './CalendarApplyButton';
import { CalendarBody } from './CalendarBody';
import { CalendarContent } from './CalendarContent';
import { CalendarFooter } from './CalendarFooter';
import { CalendarFooterControls } from './CalendarFooterControls';
import { CalendarGrids } from './CalendarGrids';
import { CalendarInputHeader } from './CalendarInputHeader';
import { CalendarKeyboardHints } from './CalendarKeyboardHints';
import { CalendarPresetItem } from './CalendarPresetItem';
import { CalendarPresets } from './CalendarPresets';
import { CalendarResetButton } from './CalendarResetButton';
import { CalendarTrigger } from './CalendarTrigger';

type DateValue = DatePicker.DateValue;

const DESCRIPTION = [
  'The month grid for choosing a date the reader needs to see in context — a weekday, a distance from today — where `DateInput` is for a date they already know.',
  'It is its own popover, so compose a trigger beside it rather than wrapping it in one, and take React Aria date objects rather than a JavaScript `Date`.',
].join(' ');

const meta = {
  title: 'Inputs Date/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  tags: ['alpha'],
} satisfies Meta<typeof Calendar>;

export default meta;

// Helper to create dates with correct type (workaround for @internationalized/date version mismatch)
const createDate = (year: number, month: number, day: number) =>
  today(getLocalTimeZone()).set({ year, month, day }) as unknown as DateValue;

/**
 * One date. The grid earns its space when the reader is choosing by weekday or by distance from
 * today rather than typing a date they know.
 */
export const Single: StoryFn<typeof meta> = () => (
  <Calendar type='single' closeOnSelect={false}>
    <CalendarTrigger>
      <Button variant='outline' color='neutral'>
        <CalendarIcon size='sm' />
        Select date
      </Button>
    </CalendarTrigger>
    <CalendarContent>
      <CalendarBody>
        <CalendarGrids />
      </CalendarBody>
    </CalendarContent>
  </Calendar>
);

/**
 * A start and an end in one grid, with the span drawn between them. Two months show at once so
 * a range crossing a boundary can be chosen without paging.
 */
export const Range: StoryFn<typeof meta> = () => (
  <Calendar
    type='range'
    closeOnSelect={false}
    defaultValue={[createDate(2025, 1, 15), createDate(2025, 2, 10)]}
  >
    <CalendarTrigger>
      <Button variant='outline' color='neutral'>
        <CalendarIcon size='sm' />
        Select date range
      </Button>
    </CalendarTrigger>
    <CalendarContent>
      <CalendarBody>
        <CalendarGrids />
      </CalendarBody>
    </CalendarContent>
  </Calendar>
);

/**
 * `CalendarPresets` alongside the grid. The shipped defaults cover the ranges people actually
 * ask for — last week, this month, last 90 days — so reach for them before writing your own.
 */
export const RangeWithPresets: StoryFn<typeof meta> = () => (
  <Calendar type='range' closeOnSelect={false}>
    <CalendarTrigger>
      <Button variant='outline' color='neutral'>
        <CalendarIcon size='sm' />
        Select date range
      </Button>
    </CalendarTrigger>
    <CalendarContent>
      <CalendarPresets presets={DEFAULT_RANGE_PRESETS} />
      <CalendarBody>
        <CalendarGrids />
      </CalendarBody>
    </CalendarContent>
  </Calendar>
);

/**
 * `CalendarInputHeader` puts a typed field above the grid, so the same popover serves both a
 * reader who knows the dates and one who needs to look.
 */
export const RangeWithInput: StoryFn<typeof meta> = () => (
  <Calendar type='range' closeOnSelect={false}>
    <CalendarTrigger>
      <Button variant='outline' color='neutral'>
        <CalendarIcon size='sm' />
        Select date range
      </Button>
    </CalendarTrigger>
    <CalendarContent>
      <CalendarBody>
        <CalendarInputHeader />
        <CalendarGrids />
      </CalendarBody>
    </CalendarContent>
  </Calendar>
);

/**
 * `CalendarFooter` holds Reset and Apply, which turns the grid into a deliberate commit —
 * nothing changes underneath the reader until they apply it.
 */
export const RangeWithFooter: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState<DateValue[]>([]);

  return (
    <Calendar type='range' value={value} onChange={setValue}>
      <CalendarTrigger>
        <Button variant='outline' color='neutral'>
          <CalendarIcon size='sm' />
          Select date range
        </Button>
      </CalendarTrigger>
      <CalendarContent>
        <CalendarBody>
          <CalendarGrids />
          <CalendarFooter>
            <CalendarKeyboardHints />
            <CalendarFooterControls>
              <CalendarResetButton onClick={() => setValue([])} />
              <CalendarApplyButton />
            </CalendarFooterControls>
          </CalendarFooter>
        </CalendarBody>
      </CalendarContent>
    </Calendar>
  );
};

/**
 * Presets, input header and footer together, which is the shape a filter bar wants. Everything
 * else on this page is a subset of it.
 */
export const RangeFullFeatured: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState<DateValue[]>([]);

  return (
    <Calendar type='range' value={value} onChange={setValue}>
      <CalendarTrigger>
        <Button variant='outline' color='neutral'>
          <CalendarIcon size='sm' />
          Select date range
        </Button>
      </CalendarTrigger>
      <CalendarContent>
        <CalendarPresets presets={DEFAULT_RANGE_PRESETS} />
        <CalendarBody>
          <CalendarInputHeader />
          <CalendarGrids />
          <CalendarFooter>
            <CalendarKeyboardHints />
            <CalendarFooterControls>
              <CalendarResetButton onClick={() => setValue([])} />
              <CalendarApplyButton />
            </CalendarFooterControls>
          </CalendarFooter>
        </CalendarBody>
      </CalendarContent>
    </Calendar>
  );
};

/**
 * The typed header on a single calendar, for the same reason as the range: the reader chooses
 * how to answer.
 */
export const SingleWithInput: StoryFn<typeof meta> = () => (
  <Calendar type='single' closeOnSelect={false}>
    <CalendarTrigger>
      <Button variant='outline' color='neutral'>
        <CalendarIcon size='sm' />
        Select date
      </Button>
    </CalendarTrigger>
    <CalendarContent>
      <CalendarBody>
        <CalendarInputHeader />
        <CalendarGrids />
      </CalendarBody>
    </CalendarContent>
  </Calendar>
);

/**
 * `showTime` adds a time to the date, for a moment rather than a day. Ask for it only where the
 * time genuinely changes the result.
 */
export const SingleWithDateTime: StoryFn<typeof meta> = () => (
  <Calendar type='single' showTime closeOnSelect={false}>
    <CalendarTrigger>
      <Button variant='outline' color='neutral'>
        <CalendarIcon size='sm' />
        Select date and time
      </Button>
    </CalendarTrigger>
    <CalendarContent>
      <CalendarBody>
        <CalendarInputHeader />
        <CalendarGrids />
      </CalendarBody>
    </CalendarContent>
  </Calendar>
);

/**
 * Single-date presets — today, yesterday, first of the month — which answer the questions a
 * single date usually stands for.
 */
export const SingleWithPresets: StoryFn<typeof meta> = () => (
  <Calendar type='single' closeOnSelect={false}>
    <CalendarTrigger>
      <Button variant='outline' color='neutral'>
        <CalendarIcon size='sm' />
        Select date
      </Button>
    </CalendarTrigger>
    <CalendarContent>
      <CalendarPresets />
      <CalendarBody>
        <CalendarGrids />
      </CalendarBody>
    </CalendarContent>
  </Calendar>
);

/**
 * `isDateUnavailable` greys out dates that cannot be chosen. Show them rather than hiding them,
 * so the reader can see the shape of what is allowed.
 */
export const RangeWithDisabledDates: StoryFn<typeof meta> = () => (
  <Calendar
    type='range'
    closeOnSelect={false}
    isDateUnavailable={date => {
      const dayOfWeek = new Date(date.year, date.month - 1, date.day).getDay();
      return dayOfWeek === 0 || dayOfWeek === 6;
    }}
  >
    <CalendarTrigger>
      <Button variant='outline' color='neutral'>
        <CalendarIcon size='sm' />
        Select date range (weekends disabled)
      </Button>
    </CalendarTrigger>
    <CalendarContent>
      <CalendarBody>
        <CalendarGrids />
      </CalendarBody>
    </CalendarContent>
  </Calendar>
);

/**
 * A range refusing to span an unavailable date, which needs controlled mode. Use it where
 * crossing the gap would produce a period the system cannot honour.
 */
export const RangeDisallowDisabled: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState<DateValue[]>([]);

  const isWeekend = (date: DateValue) => {
    const dayOfWeek = new Date(date.year, date.month - 1, date.day).getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  return (
    <Calendar
      type='range'
      closeOnSelect={false}
      value={value}
      onChange={setValue}
      isDateUnavailable={isWeekend}
      disallowDisabledDatesInRange
    >
      <CalendarTrigger>
        <Button variant='outline' color='neutral'>
          <CalendarIcon size='sm' />
          Range cannot span weekends
        </Button>
      </CalendarTrigger>
      <CalendarContent>
        <CalendarBody>
          <CalendarGrids />
        </CalendarBody>
      </CalendarContent>
    </Calendar>
  );
};

/**
 * Owning the value, which is what presets, Apply and disallowed spans all require — the
 * uncontrolled form is only for the simplest case.
 */
export const RangeControlled: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState<DateValue[]>([]);
  const [open, setOpen] = useState(false);

  const getButtonLabel = () => {
    if (!value || value.length === 0 || !value[0]) return 'Select date range';
    if (value.length === 1 || !value[1]) return value[0].toString();
    return `${value[0].toString()} - ${value[1].toString()}`;
  };

  return (
    <Calendar type='range' value={value} onChange={setValue} open={open} onOpenChange={setOpen}>
      <CalendarTrigger>
        <Button variant='outline' color='neutral'>
          <CalendarIcon size='sm' />
          {getButtonLabel()}
        </Button>
      </CalendarTrigger>
      <CalendarContent>
        <CalendarPresets presets={DEFAULT_RANGE_PRESETS} />
        <CalendarBody>
          <CalendarInputHeader />
          <CalendarGrids />
          <CalendarFooter>
            <CalendarKeyboardHints />
            <CalendarFooterControls>
              <CalendarResetButton onClick={() => setValue([])} />
              <CalendarApplyButton onClick={() => setOpen(false)} />
            </CalendarFooterControls>
          </CalendarFooter>
        </CalendarBody>
      </CalendarContent>
    </Calendar>
  );
};

/**
 * Your own preset list, for domain periods the defaults do not cover. Keep the labels as plain
 * as the shipped ones.
 */
export const SingleCustomPresets: StoryFn<typeof meta> = () => {
  const now = today(getLocalTimeZone()) as unknown as DateValue;

  return (
    <Calendar type='single' closeOnSelect={false}>
      <CalendarTrigger>
        <Button variant='outline' color='neutral'>
          <CalendarIcon size='sm' />
          Select date
        </Button>
      </CalendarTrigger>
      <CalendarContent>
        <CalendarPresets>
          <CalendarPresetItem label='Today' value={[now]} shortcut='T' />
          <CalendarPresetItem
            label='Tomorrow'
            value={[
              createDate(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                new Date().getDate() + 1,
              ),
            ]}
            shortcut='O'
          />
          <CalendarPresetItem
            label='Next Week'
            value={[
              createDate(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                new Date().getDate() + 7,
              ),
            ]}
            shortcut='W'
          />
          <CalendarPresetItem
            label='Next Month'
            value={[
              createDate(new Date().getFullYear(), new Date().getMonth() + 2, new Date().getDate()),
            ]}
            shortcut='M'
          />
        </CalendarPresets>
        <CalendarBody>
          <CalendarGrids />
        </CalendarBody>
      </CalendarContent>
    </Calendar>
  );
};

// ============================================================================
// Readonly Examples
// ============================================================================

/**
 * A range shown but not editable, for a period the reader needs to read back rather than
 * change.
 */
export const RangeReadonly: StoryFn<typeof meta> = () => (
  <Calendar
    type='range'
    readonly
    defaultOpen
    defaultValue={[createDate(2025, 1, 10), createDate(2025, 1, 20)]}
  >
    <CalendarTrigger>
      <Button variant='outline' color='neutral'>
        <CalendarIcon size='sm' />
        View date range
      </Button>
    </CalendarTrigger>
    <CalendarContent>
      <CalendarBody>
        <CalendarGrids />
      </CalendarBody>
    </CalendarContent>
  </Calendar>
);

/**
 * The same, with presets rendered but inert — worth seeing, because a live-looking preset that
 * does nothing is worse than none.
 */
export const RangeReadonlyWithPresets: StoryFn<typeof meta> = () => (
  <Calendar
    type='range'
    readonly
    defaultOpen
    defaultValue={[createDate(2025, 1, 5), createDate(2025, 1, 15)]}
  >
    <CalendarTrigger>
      <Button variant='outline' color='neutral'>
        <CalendarIcon size='sm' />
        View date range
      </Button>
    </CalendarTrigger>
    <CalendarContent>
      <CalendarPresets presets={DEFAULT_RANGE_PRESETS} />
      <CalendarBody>
        <CalendarGrids />
      </CalendarBody>
    </CalendarContent>
  </Calendar>
);

/**
 * A single date shown but not editable.
 */
export const SingleReadonly: StoryFn<typeof meta> = () => (
  <Calendar type='single' readonly defaultOpen defaultValue={[createDate(2025, 1, 15)]}>
    <CalendarTrigger>
      <Button variant='outline' color='neutral'>
        <CalendarIcon size='sm' />
        View date
      </Button>
    </CalendarTrigger>
    <CalendarContent>
      <CalendarBody>
        <CalendarGrids />
      </CalendarBody>
    </CalendarContent>
  </Calendar>
);
