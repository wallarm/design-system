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

const meta = {
  title: 'Inputs Date/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['alpha'],
} satisfies Meta<typeof Calendar>;

export default meta;

export const Single: StoryFn<typeof meta> = () => (
  <Calendar type='single' closeOnSelect={false}>
    <Button variant='outline' color='neutral'>
      <CalendarIcon size='sm' />
      Select date
    </Button>
  </Calendar>
);

// Helper to create dates with correct type (workaround for @internationalized/date version mismatch)
const createDate = (year: number, month: number, day: number) =>
  today(getLocalTimeZone()).set({ year, month, day }) as unknown as DateValue;

export const DoubleWithRange: StoryFn<typeof meta> = () => (
  <Calendar
    type='double'
    closeOnSelect={false}
    defaultValue={[createDate(2025, 1, 15), createDate(2025, 2, 10)]}
  >
    <Button variant='outline' color='neutral'>
      <CalendarIcon size='sm' />
      Select date range
    </Button>
  </Calendar>
);

export const WithPresets: StoryFn<typeof meta> = () => (
  <Calendar type='double' showPresets closeOnSelect={false}>
    <Button variant='outline' color='neutral'>
      <CalendarIcon size='sm' />
      Select date range
    </Button>
  </Calendar>
);

export const WithInputHeader: StoryFn<typeof meta> = () => (
  <Calendar type='double' showInput closeOnSelect={false}>
    <Button variant='outline' color='neutral'>
      <CalendarIcon size='sm' />
      Select date range
    </Button>
  </Calendar>
);

export const WithFooter: StoryFn<typeof meta> = () => (
  <Calendar type='double' showFooter>
    <Button variant='outline' color='neutral'>
      <CalendarIcon size='sm' />
      Select date range
    </Button>
  </Calendar>
);

export const FullFeatured: StoryFn<typeof meta> = () => (
  <Calendar type='double' showPresets showInput showFooter>
    <Button variant='outline' color='neutral'>
      <CalendarIcon size='sm' />
      Select date range
    </Button>
  </Calendar>
);

export const SingleWithInput: StoryFn<typeof meta> = () => (
  <Calendar type='single' showInput closeOnSelect={false}>
    <Button variant='outline' color='neutral'>
      <CalendarIcon size='sm' />
      Select date
    </Button>
  </Calendar>
);

export const SingleWithPresets: StoryFn<typeof meta> = () => (
  <Calendar type='single' showPresets closeOnSelect={false}>
    <Button variant='outline' color='neutral'>
      <CalendarIcon size='sm' />
      Select date
    </Button>
  </Calendar>
);

/** Demonstrates disabling specific dates using isDateUnavailable prop */
export const WithDisabledDates: StoryFn<typeof meta> = () => (
  <Calendar
    type='double'
    closeOnSelect={false}
    isDateUnavailable={date => {
      // Disable weekends: getDay() returns 0 for Sunday, 6 for Saturday
      const dayOfWeek = new Date(date.year, date.month - 1, date.day).getDay();
      return dayOfWeek === 0 || dayOfWeek === 6;
    }}
  >
    <Button variant='outline' color='neutral'>
      <CalendarIcon size='sm' />
      Select date range (weekends disabled)
    </Button>
  </Calendar>
);

/** Demonstrates preventing range selection that spans disabled dates (must be controlled) */
export const DisallowDisabledInRange: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState<DateValue[]>([]);

  const isWeekend = (date: DateValue) => {
    const dayOfWeek = new Date(date.year, date.month - 1, date.day).getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  return (
    <Calendar
      type='double'
      closeOnSelect={false}
      value={value}
      onChange={setValue}
      isDateUnavailable={isWeekend}
      disallowDisabledDatesInRange
    >
      <Button variant='outline' color='neutral'>
        <CalendarIcon size='sm' />
        Range cannot span weekends
      </Button>
    </Calendar>
  );
};

export const Controlled: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState<DateValue[]>([]);
  const [open, setOpen] = useState(false);

  const getButtonLabel = () => {
    if (!value || value.length === 0 || !value[0]) return 'Select date range';
    if (value.length === 1 || !value[1]) return value[0].toString();
    return `${value[0].toString()} - ${value[1].toString()}`;
  };

  return (
    <Calendar
      type='double'
      showPresets
      showInput
      showFooter
      value={value}
      onChange={setValue}
      open={open}
      onOpenChange={setOpen}
      onApply={() => {
        setOpen(false);
      }}
      onReset={() => {
        setValue([]);
      }}
    >
      <Button variant='outline' color='neutral'>
        <CalendarIcon size='sm' />
        {getButtonLabel()}
      </Button>
    </Calendar>
  );
};

// ============================================================================
// Assembled Examples (using sub-components)
// ============================================================================

/** Demonstrates assembling the calendar from sub-components */
export const AssembledBasic: StoryFn<typeof meta> = () => (
  <Calendar type='double' closeOnSelect={false}>
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

/** Assembled with presets */
export const AssembledWithPresets: StoryFn<typeof meta> = () => (
  <Calendar type='double' closeOnSelect={false}>
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

/** Assembled with custom preset items */
export const AssembledCustomPresets: StoryFn<typeof meta> = () => {
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

/** Assembled with footer */
export const AssembledWithFooter: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState<DateValue[]>([]);

  return (
    <Calendar type='double' value={value} onChange={setValue}>
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

/** Full assembled calendar with all features */
export const AssembledFullFeatured: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState<DateValue[]>([]);

  return (
    <Calendar type='double' value={value} onChange={setValue}>
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

// ============================================================================
// Readonly Examples
// ============================================================================

/** Readonly calendar displaying a pre-selected range (no interaction allowed) */
export const Readonly: StoryFn<typeof meta> = () => (
  <Calendar
    type='double'
    readonly
    defaultOpen
    defaultValue={[createDate(2025, 1, 10), createDate(2025, 1, 20)]}
  >
    <Button variant='outline' color='neutral'>
      <CalendarIcon size='sm' />
      View date range
    </Button>
  </Calendar>
);

/** Readonly calendar with presets (presets are disabled) */
export const ReadonlyWithPresets: StoryFn<typeof meta> = () => (
  <Calendar
    type='double'
    readonly
    showPresets
    defaultOpen
    defaultValue={[createDate(2025, 1, 5), createDate(2025, 1, 15)]}
  >
    <Button variant='outline' color='neutral'>
      <CalendarIcon size='sm' />
      View date range
    </Button>
  </Calendar>
);

/** Readonly single date calendar */
export const ReadonlySingle: StoryFn<typeof meta> = () => (
  <Calendar type='single' readonly defaultOpen defaultValue={[createDate(2025, 1, 15)]}>
    <Button variant='outline' color='neutral'>
      <CalendarIcon size='sm' />
      View date
    </Button>
  </Calendar>
);
