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

// Helper to create dates with correct type (workaround for @internationalized/date version mismatch)
const createDate = (year: number, month: number, day: number) =>
  today(getLocalTimeZone()).set({ year, month, day }) as unknown as DateValue;

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

/** Range calendar with disabled weekends */
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

/** Range selection cannot span disabled dates (controlled mode required) */
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

/** Custom preset items */
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

/** Readonly range calendar displaying a pre-selected range */
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

/** Readonly range calendar with presets (presets are disabled) */
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

/** Readonly single calendar */
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
