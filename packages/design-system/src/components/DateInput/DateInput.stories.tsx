import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { CalendarDate, CalendarDateTime, getLocalTimeZone, today } from '../../index';
import { DateFormatProvider } from '../DateFormatProvider';
import { Field, FieldAction, FieldDescription, FieldError, FieldLabel } from '../Field';
import { HStack, VStack } from '../Stack';
import { DateInput } from './DateInput';

const sampleDate = new CalendarDate(2026, 1, 1);
const sampleDateTime = new CalendarDateTime(2026, 1, 1, 22, 0);

const DESCRIPTION = [
  'A date typed segment by segment, for a date the reader knows — pair it with `Calendar` when they need to see the month to choose.',
  'It takes React Aria date objects rather than a JavaScript `Date`, and segment order and hour cycle come from `DateFormatProvider` app-wide rather than per input.',
].join(' ');

const meta: Meta<typeof DateInput> = {
  title: 'Inputs Date/DateInput',
  component: DateInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    granularity: {
      control: 'select',
      options: ['day', 'hour', 'minute', 'second'],
      description:
        'Determines the smallest unit of time that can be edited. `day` shows date only, `hour`/`minute`/`second` add time segments.',
    },
    error: {
      control: 'boolean',
      description: 'Whether the input has an error state.',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled.',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the input is read-only. Displays value but prevents editing.',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when no value is selected.',
    },
    showIcon: {
      control: 'boolean',
      description: 'Whether to show the leading calendar icon. Default: true.',
    },
    showTimeDropdown: {
      control: 'boolean',
      description:
        'Show dropdown for time selection with arrow navigation. Only effective when granularity includes time.',
    },
    timeStep: {
      control: 'number',
      description: 'Time interval in minutes for dropdown options.',
    },
    size: {
      control: 'select',
      options: ['default', 'medium', 'small'],
      description: 'Visual size: default (36px), medium (32px), small (24px).',
    },
  },
  args: {
    granularity: 'day',
    error: false,
    disabled: false,
    readOnly: false,
    showIcon: true,
    size: 'default',
  },
};

export default meta;

const dropdownRoom: StoryFn<typeof meta>['decorators'] = [
  Story => (
    <div style={{ minHeight: 360, paddingBottom: 280 }}>
      <Story />
    </div>
  ),
];

/**
 * The bare field. Each segment is its own target: arrows step a segment, typing fills it and
 * moves on, so the whole date is reachable without a pointer.
 */
export const Basic: StoryFn<typeof meta> = ({ ...args }) => {
  return <DateInput {...args} />;
};
Basic.decorators = dropdownRoom;
Basic.parameters = { layout: 'padded' };

/**
 * The calendar icon is decoration here, not a trigger — this field opens nothing. Reach for
 * `Calendar` when the icon should open a picker.
 */
export const WithIcon: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <span className='sb-annotation'>Without icon</span>
      <DateInput showIcon={false} />
    </VStack>
    <VStack gap={12}>
      <span className='sb-annotation'>With icon</span>
      <DateInput />
    </VStack>
  </HStack>
);

/**
 * Default, disabled and error side by side. `error` reddens the border and marks the field
 * invalid; the reason belongs in `FieldError`.
 */
export const States: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <span className='sb-annotation'>Default</span>
      <DateInput />
      <DateInput defaultValue={sampleDate} />
    </VStack>
    <VStack gap={12}>
      <span className='sb-annotation'>Disabled</span>
      <DateInput disabled />
      <DateInput disabled defaultValue={sampleDate} />
    </VStack>
    <VStack gap={12}>
      <span className='sb-annotation'>Error</span>
      <DateInput error />
      <DateInput error defaultValue={sampleDate} />
    </VStack>
  </HStack>
);

/**
 * The same 36 / 32 / 24px scale as the other fields, so a date sits in a row of inputs without
 * breaking the line.
 */
export const Sizes: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={16}>
      <VStack gap={4}>
        <span className='sb-annotation'>Default (36px)</span>
        <DateInput size='default' />
      </VStack>
      <VStack gap={4}>
        <span className='sb-annotation'>Medium (32px)</span>
        <DateInput size='medium' />
      </VStack>
      <VStack gap={4}>
        <span className='sb-annotation'>Small (24px)</span>
        <DateInput size='small' />
      </VStack>
    </VStack>
    <VStack gap={16}>
      <VStack gap={4}>
        <span className='sb-annotation'>Default filled</span>
        <DateInput size='default' defaultValue={sampleDate} />
      </VStack>
      <VStack gap={4}>
        <span className='sb-annotation'>Medium filled</span>
        <DateInput size='medium' defaultValue={sampleDate} />
      </VStack>
      <VStack gap={4}>
        <span className='sb-annotation'>Small filled</span>
        <DateInput size='small' defaultValue={sampleDate} />
      </VStack>
    </VStack>
  </HStack>
);

/**
 * A field holding a value, next to one holding a placeholder. The clear affordance only appears
 * once there is something to clear.
 */
export const Filled: StoryFn<typeof meta> = () => (
  <VStack gap={16}>
    <VStack gap={4}>
      <span className='sb-annotation'>Date</span>
      <DateInput defaultValue={sampleDate} />
    </VStack>
    <DateFormatProvider order='day-first' hourCycle={24}>
      <VStack gap={4}>
        <span className='sb-annotation'>Date + time (24h)</span>
        <DateInput granularity='minute' defaultValue={sampleDateTime} />
      </VStack>
    </DateFormatProvider>
    <DateFormatProvider order='day-first' hourCycle={12}>
      <VStack gap={4}>
        <span className='sb-annotation'>Date + time (12h)</span>
        <DateInput granularity='minute' defaultValue={sampleDateTime} />
      </VStack>
    </DateFormatProvider>
    <VStack gap={4}>
      <span className='sb-annotation'>Without icon</span>
      <DateInput showIcon={false} defaultValue={sampleDate} />
    </VStack>
  </VStack>
);

/**
 * `granularity` decides how many segments there are, from a day down to a second. Ask for the
 * smallest unit you will actually use — every extra segment is another thing to tab through.
 */
export const Granularity: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <DateFormatProvider order='day-first' hourCycle={12}>
      <VStack gap={12}>
        <span className='sb-annotation'>12-hour format</span>
        <DateInput placeholder='day' granularity='day' />
        <DateInput placeholder='hour' granularity='hour' />
        <DateInput placeholder='minute' granularity='minute' />
        <DateInput placeholder='second' granularity='second' />
      </VStack>
    </DateFormatProvider>
    <DateFormatProvider order='day-first' hourCycle={24}>
      <VStack gap={12}>
        <span className='sb-annotation'>24-hour format</span>
        <DateInput placeholder='day' granularity='day' />
        <DateInput placeholder='hour' granularity='hour' />
        <DateInput placeholder='minute' granularity='minute' />
        <DateInput placeholder='second' granularity='second' />
      </VStack>
    </DateFormatProvider>
  </HStack>
);

/**
 * Inside `Field`, which supplies the label and description. The field does not read that
 * context, so check the labelling rather than assuming it wired itself.
 */
export const WithFieldComponents: StoryFn<typeof meta> = () => {
  // With `granularity='day'` the runtime value is always a CalendarDate —
  // onChange gets cast on the way in so app state stays narrowly typed.
  const [value, setValue] = useState<CalendarDate | null>(null);
  const [errorValue, setErrorValue] = useState<CalendarDate | null>(today(getLocalTimeZone()));

  const handleSetNow = () => {
    setValue(today(getLocalTimeZone()));
  };

  return (
    <VStack gap={24}>
      <Field>
        <FieldLabel>
          Label
          <FieldAction onClick={handleSetNow}>Set now</FieldAction>
        </FieldLabel>
        <DateInput
          placeholder='Select a date'
          value={value}
          onChange={v => setValue(v as CalendarDate | null)}
        />
        <FieldDescription>This is an input description.</FieldDescription>
      </Field>

      <Field invalid>
        <FieldLabel>Label</FieldLabel>
        <DateInput
          error
          value={errorValue}
          onChange={v => setErrorValue(v as CalendarDate | null)}
        />
        <FieldError>An error message.</FieldError>
      </Field>
    </VStack>
  );
};

/**
 * Day-first against month-first, each in its own scoped provider. This is an app-wide decision,
 * not a per-field one — the comparison exists to show what the provider changes.
 */
export const DateOrderComparison: StoryFn<typeof meta> = () => (
  <HStack gap={32}>
    <DateFormatProvider order='day-first' hourCycle={24}>
      <VStack gap={12}>
        <span className='sb-annotation'>Day first — DD MMM YYYY</span>
        <DateInput />
        <DateInput defaultValue={sampleDate} />
        <DateInput granularity='minute' defaultValue={sampleDateTime} />
      </VStack>
    </DateFormatProvider>
    <DateFormatProvider order='month-first' hourCycle={24}>
      <VStack gap={12}>
        <span className='sb-annotation'>Month first — MMM DD YYYY</span>
        <DateInput />
        <DateInput defaultValue={sampleDate} />
        <DateInput granularity='minute' defaultValue={sampleDateTime} />
      </VStack>
    </DateFormatProvider>
  </HStack>
);
DateOrderComparison.parameters = { layout: 'padded' };

/**
 * 12-hour against 24-hour, again from the provider. There is no per-input escape hatch, which
 * is deliberate: a form mixing both would be unreadable.
 */
export const HourCycleByContext: StoryFn<typeof meta> = () => (
  <HStack gap={32}>
    <DateFormatProvider order='day-first' hourCycle={12}>
      <VStack gap={12}>
        <span className='sb-annotation'>12-hour (AM/PM)</span>
        <DateInput granularity='minute' defaultValue={sampleDateTime} />
        <DateInput granularity='second' defaultValue={sampleDateTime} />
      </VStack>
    </DateFormatProvider>
    <DateFormatProvider order='day-first' hourCycle={24}>
      <VStack gap={12}>
        <span className='sb-annotation'>24-hour</span>
        <DateInput granularity='minute' defaultValue={sampleDateTime} />
        <DateInput granularity='second' defaultValue={sampleDateTime} />
      </VStack>
    </DateFormatProvider>
  </HStack>
);
HourCycleByContext.parameters = { layout: 'padded' };

/**
 * `readOnly` keeps the value legible and removes every edit affordance. Different from
 * disabled, which says the control exists but is unavailable.
 */
export const ReadOnly: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <span className='sb-annotation'>Date</span>
      <DateInput readOnly defaultValue={sampleDate} />
    </VStack>
    <VStack gap={12}>
      <span className='sb-annotation'>Date + time</span>
      <DateInput readOnly granularity='minute' defaultValue={sampleDateTime} />
    </VStack>
  </HStack>
);
ReadOnly.parameters = { layout: 'padded' };
