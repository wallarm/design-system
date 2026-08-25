import { subDays, subHours, subMinutes, subMonths, subSeconds, subYears } from 'date-fns';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { FormatDateTime } from './FormatDateTime';

const DESCRIPTION = [
  'Prints a timestamp the way the house date guide says to: `relative` by default for anything recent, `date` when only the day matters, `datetime` when the exact moment does.',
  'Relative stops being relative as a date ages — past roughly five months it prints the day and month, past a year it adds the year — and it always carries the full absolute time, timezone included, in a tooltip.',
].join(' ');

const meta = {
  title: 'Data Display/FormatDateTime',
  component: FormatDateTime,
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
  argTypes: {
    format: {
      control: 'select',
      options: ['relative', 'date', 'datetime'],
    },
    layout: {
      control: 'radio',
      options: ['stacked', 'inline'],
    },
    showSeconds: {
      control: 'boolean',
    },
  },
  args: {
    value: new Date().toISOString(),
    format: 'relative',
    layout: 'stacked',
    showSeconds: true,
  },
} satisfies Meta<typeof FormatDateTime>;

export default meta;

const now = new Date();

/**
 * The whole ladder in one frame, from `Just now` up to the age where it gives up and
 * prints a date instead. The dashed underline is the cue that the precise value is one
 * hover away.
 */
export const Relative: StoryFn<typeof meta> = () => (
  <VStack gap={12} align='start'>
    <HStack gap={16} align='center'>
      <span className='sb-annotation w-128'>Just now</span>
      <FormatDateTime value={subSeconds(now, 10)} format='relative' />
    </HStack>
    <HStack gap={16} align='center'>
      <span className='sb-annotation w-128'>Minutes ago</span>
      <FormatDateTime value={subMinutes(now, 12)} format='relative' />
    </HStack>
    <HStack gap={16} align='center'>
      <span className='sb-annotation w-128'>Hours ago</span>
      <FormatDateTime value={subHours(now, 3)} format='relative' />
    </HStack>
    <HStack gap={16} align='center'>
      <span className='sb-annotation w-128'>Yesterday</span>
      <FormatDateTime value={subHours(now, 30)} format='relative' />
    </HStack>
    <HStack gap={16} align='center'>
      <span className='sb-annotation w-128'>Days ago</span>
      <FormatDateTime value={subDays(now, 5)} format='relative' />
    </HStack>
    <HStack gap={16} align='center'>
      <span className='sb-annotation w-128'>Weeks ago</span>
      <FormatDateTime value={subDays(now, 21)} format='relative' />
    </HStack>
    <HStack gap={16} align='center'>
      <span className='sb-annotation w-128'>Months ago</span>
      <FormatDateTime value={subMonths(now, 3)} format='relative' />
    </HStack>
    <HStack gap={16} align='center'>
      <span className='sb-annotation w-128'>Short date</span>
      <FormatDateTime value={subDays(now, 200)} format='relative' />
    </HStack>
    <HStack gap={16} align='center'>
      <span className='sb-annotation w-128'>Full date</span>
      <FormatDateTime value={subYears(now, 2)} format='relative' />
    </HStack>
  </VStack>
);

/**
 * `format='date'` drops the time — and drops the year too when the date falls in the
 * current one, which is why only the 2025 row carries it.
 */
export const DateFormat: StoryFn<typeof meta> = () => (
  <VStack gap={12} align='start'>
    <FormatDateTime value='2026-01-01T00:00:00' format='date' />
    <FormatDateTime value='2026-02-11T14:32:07' format='date' />
    <FormatDateTime value='2025-06-15T09:00:00' format='date' />
  </VStack>
);

/**
 * `format='datetime'` shows both, the time in secondary type with its timezone, and no
 * tooltip: there is nothing left to reveal.
 */
export const DatetimeFormat: StoryFn<typeof meta> = () => (
  <VStack gap={12} align='start'>
    <FormatDateTime value='2026-01-01T11:00:00' format='datetime' />
    <FormatDateTime value='2026-02-11T14:32:07' format='datetime' />
    <FormatDateTime value='2025-12-25T23:59:59' format='datetime' />
  </VStack>
);

/**
 * `stacked` is the default and the table-cell shape; `inline` puts date and time on one
 * baseline for a row that cannot grow to two lines.
 */
export const DatetimeLayout: StoryFn<typeof meta> = () => (
  <HStack gap={64} align='start'>
    <VStack gap={12} align='start'>
      <span className='sb-annotation'>Stacked (default)</span>
      <FormatDateTime value='2026-01-01T11:00:00' format='datetime' layout='stacked' />
      <FormatDateTime value='2026-02-11T14:32:07' format='datetime' layout='stacked' />
      <FormatDateTime value='2025-12-25T23:59:59' format='datetime' layout='stacked' />
    </VStack>
    <VStack gap={12} align='start'>
      <span className='sb-annotation'>Inline</span>
      <FormatDateTime value='2026-01-01T11:00:00' format='datetime' layout='inline' />
      <FormatDateTime value='2026-02-11T14:32:07' format='datetime' layout='inline' />
      <FormatDateTime value='2025-12-25T23:59:59' format='datetime' layout='inline' />
    </VStack>
  </HStack>
);

/**
 * When, and then who or what — the second line is composed from `Text` rather than being
 * a prop, so it can say anything the row needs.
 */
export const WithDescription: StoryFn<typeof meta> = () => (
  <VStack gap={12} align='start'>
    <VStack gap={2}>
      <FormatDateTime value='2026-01-01T00:00:00' format='date' />
      <Text size='sm' color='secondary'>
        Created by admin
      </Text>
    </VStack>
    <VStack gap={2}>
      <FormatDateTime value='2026-02-11T14:32:07' format='date' />
      <Text size='sm' color='secondary'>
        Last modified
      </Text>
    </VStack>
  </VStack>
);

/**
 * `null` and `undefined` both come out as an em dash rather than an empty cell, with 'No
 * data' behind it on hover.
 */
export const NullValue: StoryFn<typeof meta> = () => (
  <VStack gap={12} align='start'>
    <FormatDateTime value={null} />
    <FormatDateTime value={undefined} />
  </VStack>
);

/**
 * A timestamp five minutes ahead reads `Just now` rather than counting forwards — the
 * component absorbs clock skew between a browser and a server instead of showing it.
 */
export const FutureDate: StoryFn<typeof meta> = () => (
  <FormatDateTime value={new Date(Date.now() + 5 * 60 * 1000)} format='relative' />
);
