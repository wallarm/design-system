import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Text } from '../Text';
import { FormatNumber } from './FormatNumber';

const meta = {
  title: 'Data Display/FormatNumber',
  component: FormatNumber,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['decimal', 'percent', 'byte'],
    },
    notation: {
      control: 'radio',
      options: ['compact', 'standard'],
    },
    decimals: {
      control: 'number',
    },
  },
  args: {
    value: 12345,
    type: 'decimal',
    notation: 'compact',
  },
} satisfies Meta<typeof FormatNumber>;

export default meta;

const compactValues = [0, 5, 42, 999, 1_000, 12_042, 59_614, 999_499, 999_500, 1_400_000_000_000];

export const Compact: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    {compactValues.map(v => (
      <>
        <Text key={`label-${v}`} size='sm' color='secondary' align='right'>
          {v.toLocaleString('en-US')}
        </Text>
        <FormatNumber key={v} value={v} />
      </>
    ))}
  </div>
);

export const Standard: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    {compactValues.map(v => (
      <>
        <Text key={`label-${v}`} size='sm' color='secondary' align='right'>
          {v.toLocaleString('en-US')}
        </Text>
        <FormatNumber key={v} value={v} notation='standard' />
      </>
    ))}
  </div>
);

export const WithUnit: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    <Text size='sm' color='secondary' align='right'>
      42
    </Text>
    <FormatNumber value={42} unit='requests' />

    <Text size='sm' color='secondary' align='right'>
      12,042
    </Text>
    <FormatNumber value={12_042} unit='requests' />

    <Text size='sm' color='secondary' align='right'>
      59,614,283
    </Text>
    <FormatNumber value={59_614_283} unit='errors' />

    <Text size='sm' color='secondary' align='right'>
      500 (standard)
    </Text>
    <FormatNumber value={500} unit='requests' notation='standard' />
  </div>
);

export const Percent: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    <Text size='sm' color='secondary' align='right'>
      0%
    </Text>
    <FormatNumber value={0} type='percent' />

    <Text size='sm' color='secondary' align='right'>
      0.02% (decimals=0)
    </Text>
    <FormatNumber value={0.02} type='percent' />

    <Text size='sm' color='secondary' align='right'>
      0.02% (decimals=1)
    </Text>
    <FormatNumber value={0.02} type='percent' decimals={1} />

    <Text size='sm' color='secondary' align='right'>
      25.5%
    </Text>
    <FormatNumber value={25.5} type='percent' decimals={1} />

    <Text size='sm' color='secondary' align='right'>
      50%
    </Text>
    <FormatNumber value={50} type='percent' />

    <Text size='sm' color='secondary' align='right'>
      99.97% (decimals=0)
    </Text>
    <FormatNumber value={99.97} type='percent' />

    <Text size='sm' color='secondary' align='right'>
      99.97% (decimals=1)
    </Text>
    <FormatNumber value={99.97} type='percent' decimals={1} />

    <Text size='sm' color='secondary' align='right'>
      100%
    </Text>
    <FormatNumber value={100} type='percent' />
  </div>
);

export const Bytes: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    <Text size='sm' color='secondary' align='right'>
      512 (compact)
    </Text>
    <FormatNumber value={512} type='byte' />

    <Text size='sm' color='secondary' align='right'>
      3,400 (compact)
    </Text>
    <FormatNumber value={3_400} type='byte' />

    <Text size='sm' color='secondary' align='right'>
      12,700,000 (compact)
    </Text>
    <FormatNumber value={12_700_000} type='byte' />

    <Text size='sm' color='secondary' align='right'>
      2,345,678,901 (compact)
    </Text>
    <FormatNumber value={2_345_678_901} type='byte' />

    <Text size='sm' color='secondary' align='right'>
      1,100,000,000,000 (compact)
    </Text>
    <FormatNumber value={1_100_000_000_000} type='byte' />

    <Text size='sm' color='secondary' align='right'>
      12,700,000 (standard)
    </Text>
    <FormatNumber value={12_700_000} type='byte' notation='standard' />
  </div>
);

export const NoTooltip: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    <Text size='sm' color='secondary' align='right'>
      12,042 (decimal)
    </Text>
    <FormatNumber value={12_042} tooltip={false} />

    <Text size='sm' color='secondary' align='right'>
      59,614,283 (decimal)
    </Text>
    <FormatNumber value={59_614_283} tooltip={false} />

    <Text size='sm' color='secondary' align='right'>
      12,042 with unit
    </Text>
    <FormatNumber value={12_042} unit='requests' tooltip={false} />

    <Text size='sm' color='secondary' align='right'>
      12,700,000 (byte)
    </Text>
    <FormatNumber value={12_700_000} type='byte' tooltip={false} />
  </div>
);

export const NegativeValues: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    <Text size='sm' color='secondary' align='right'>
      -42
    </Text>
    <FormatNumber value={-42} />

    <Text size='sm' color='secondary' align='right'>
      -12,042
    </Text>
    <FormatNumber value={-12_042} />

    <Text size='sm' color='secondary' align='right'>
      -59,614,283
    </Text>
    <FormatNumber value={-59_614_283} />
  </div>
);

export const NullValue: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    <Text size='sm' color='secondary' align='right'>
      null
    </Text>
    <FormatNumber value={null} />

    <Text size='sm' color='secondary' align='right'>
      undefined
    </Text>
    <FormatNumber value={undefined} />
  </div>
);

export const SpecialValues: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    <Text size='sm' color='secondary' align='right'>
      0
    </Text>
    <FormatNumber value={0} />

    <Text size='sm' color='secondary' align='right'>
      NaN
    </Text>
    <FormatNumber value={Number.NaN} />

    <Text size='sm' color='secondary' align='right'>
      Infinity
    </Text>
    <FormatNumber value={Number.POSITIVE_INFINITY} />
  </div>
);
