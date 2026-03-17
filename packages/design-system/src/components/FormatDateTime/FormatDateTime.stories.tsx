import { subDays, subHours, subMinutes, subMonths, subSeconds, subYears } from 'date-fns';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { FormatDateTime } from './FormatDateTime';

const meta = {
  title: 'Data Display/FormatDateTime',
  component: FormatDateTime,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    format: {
      control: 'select',
      options: ['relative', 'date', 'datetime'],
    },
    showSeconds: {
      control: 'boolean',
    },
  },
  args: {
    value: new Date().toISOString(),
    format: 'relative',
    showSeconds: true,
  },
} satisfies Meta<typeof FormatDateTime>;

export default meta;

const now = new Date();

export const Relative: StoryFn<typeof meta> = () => (
  <VStack gap={12} align='start'>
    <HStack gap={16} align='center'>
      <Text size='sm' color='secondary' className='w-128'>
        Just now
      </Text>
      <FormatDateTime value={subSeconds(now, 10)} format='relative' />
    </HStack>
    <HStack gap={16} align='center'>
      <Text size='sm' color='secondary' className='w-128'>
        Minutes ago
      </Text>
      <FormatDateTime value={subMinutes(now, 12)} format='relative' />
    </HStack>
    <HStack gap={16} align='center'>
      <Text size='sm' color='secondary' className='w-128'>
        Hours ago
      </Text>
      <FormatDateTime value={subHours(now, 3)} format='relative' />
    </HStack>
    <HStack gap={16} align='center'>
      <Text size='sm' color='secondary' className='w-128'>
        Yesterday
      </Text>
      <FormatDateTime value={subHours(now, 30)} format='relative' />
    </HStack>
    <HStack gap={16} align='center'>
      <Text size='sm' color='secondary' className='w-128'>
        Days ago
      </Text>
      <FormatDateTime value={subDays(now, 5)} format='relative' />
    </HStack>
    <HStack gap={16} align='center'>
      <Text size='sm' color='secondary' className='w-128'>
        Weeks ago
      </Text>
      <FormatDateTime value={subDays(now, 21)} format='relative' />
    </HStack>
    <HStack gap={16} align='center'>
      <Text size='sm' color='secondary' className='w-128'>
        Months ago
      </Text>
      <FormatDateTime value={subMonths(now, 3)} format='relative' />
    </HStack>
    <HStack gap={16} align='center'>
      <Text size='sm' color='secondary' className='w-128'>
        Short date
      </Text>
      <FormatDateTime value={subDays(now, 200)} format='relative' />
    </HStack>
    <HStack gap={16} align='center'>
      <Text size='sm' color='secondary' className='w-128'>
        Full date
      </Text>
      <FormatDateTime value={subYears(now, 2)} format='relative' />
    </HStack>
  </VStack>
);

export const DateFormat: StoryFn<typeof meta> = () => (
  <VStack gap={12} align='start'>
    <FormatDateTime value='2026-01-01T00:00:00' format='date' />
    <FormatDateTime value='2026-02-11T14:32:07' format='date' />
    <FormatDateTime value='2025-06-15T09:00:00' format='date' />
  </VStack>
);

export const DatetimeFormat: StoryFn<typeof meta> = () => (
  <VStack gap={12} align='start'>
    <FormatDateTime value='2026-01-01T11:00:00' format='datetime' />
    <FormatDateTime value='2026-02-11T14:32:07' format='datetime' />
    <FormatDateTime value='2025-12-25T23:59:59' format='datetime' />
  </VStack>
);

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

export const NullValue: StoryFn<typeof meta> = () => (
  <VStack gap={12} align='start'>
    <FormatDateTime value={null} />
    <FormatDateTime value={undefined} />
  </VStack>
);

export const FutureDate: StoryFn<typeof meta> = () => (
  <FormatDateTime value={new Date(Date.now() + 5 * 60 * 1000)} format='relative' />
);
