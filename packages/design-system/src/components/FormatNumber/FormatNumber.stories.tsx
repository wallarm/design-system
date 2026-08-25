import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { FormatNumber } from './FormatNumber';

const DESCRIPTION = [
  'Prints a number the way the house number guide says to: abbreviated by default — `12k`, `59.6M` — with the full figure in a tooltip behind a dashed underline.',
  '`type` chooses the family: `decimal`, `percent`, which refuses to round to a flat `0%` or `100%` it has not earned, and `byte`, which counts in units of 1000.',
].join(' ');

const meta = {
  title: 'Data Display/FormatNumber',
  component: FormatNumber,
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
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

/**
 * The raw value beside what the component makes of it, across the tier boundaries —
 * 999,499 stays `999k` while 999,500 becomes `1M`, because the tier turns over when
 * rounding would reach 1000×. Abbreviated values use tabular figures, so a column of
 * them stays aligned.
 */
export const Compact: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    {compactValues.map(v => (
      <>
        <span key={`label-${v}`} className='sb-annotation text-right'>
          {v.toLocaleString('en-US')}
        </span>
        <FormatNumber key={v} value={v} />
      </>
    ))}
  </div>
);

/**
 * `notation='standard'` prints the grouped figure instead, for the place where the exact
 * number is the point and there is room to show it.
 */
export const Standard: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    {compactValues.map(v => (
      <>
        <span key={`label-${v}`} className='sb-annotation text-right'>
          {v.toLocaleString('en-US')}
        </span>
        <FormatNumber key={v} value={v} notation='standard' />
      </>
    ))}
  </div>
);

/**
 * `unit` follows the value — except on an abbreviated number with its tooltip still on,
 * where it moves into the tooltip and the accessible name and leaves the cell.
 */
export const WithUnit: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    <span className='sb-annotation text-right'>42</span>
    <FormatNumber value={42} unit='requests' />

    <span className='sb-annotation text-right'>12,042</span>
    <FormatNumber value={12_042} unit='requests' />

    <span className='sb-annotation text-right'>59,614,283</span>
    <FormatNumber value={59_614_283} unit='errors' />

    <span className='sb-annotation text-right'>500 (standard)</span>
    <FormatNumber value={500} unit='requests' notation='standard' />
  </div>
);

/**
 * The boundary rules: anything above zero that would round to `0%` prints `<1%`, and
 * anything below a hundred that would round to `100%` prints `>99%`, with `decimals`
 * moving both thresholds.
 */
export const Percent: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    <span className='sb-annotation text-right'>0%</span>
    <FormatNumber value={0} type='percent' />

    <span className='sb-annotation text-right'>0.02% (decimals=0)</span>
    <FormatNumber value={0.02} type='percent' />

    <span className='sb-annotation text-right'>0.02% (decimals=1)</span>
    <FormatNumber value={0.02} type='percent' decimals={1} />

    <span className='sb-annotation text-right'>25.5%</span>
    <FormatNumber value={25.5} type='percent' decimals={1} />

    <span className='sb-annotation text-right'>50%</span>
    <FormatNumber value={50} type='percent' />

    <span className='sb-annotation text-right'>99.97% (decimals=0)</span>
    <FormatNumber value={99.97} type='percent' />

    <span className='sb-annotation text-right'>99.97% (decimals=1)</span>
    <FormatNumber value={99.97} type='percent' decimals={1} />

    <span className='sb-annotation text-right'>100%</span>
    <FormatNumber value={100} type='percent' />
  </div>
);

/**
 * `byte` counts in decimal units — a thousand to the kilobyte, not 1024 — so 12,700,000
 * reads `12.7 MB`, and `standard` spells the whole figure out.
 */
export const Bytes: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    <span className='sb-annotation text-right'>512 (compact)</span>
    <FormatNumber value={512} type='byte' />

    <span className='sb-annotation text-right'>3,400 (compact)</span>
    <FormatNumber value={3_400} type='byte' />

    <span className='sb-annotation text-right'>12,700,000 (compact)</span>
    <FormatNumber value={12_700_000} type='byte' />

    <span className='sb-annotation text-right'>2,345,678,901 (compact)</span>
    <FormatNumber value={2_345_678_901} type='byte' />

    <span className='sb-annotation text-right'>1,100,000,000,000 (compact)</span>
    <FormatNumber value={1_100_000_000_000} type='byte' />

    <span className='sb-annotation text-right'>12,700,000 (standard)</span>
    <FormatNumber value={12_700_000} type='byte' notation='standard' />
  </div>
);

/**
 * `tooltip={false}` removes the tooltip and the dashed underline with it, for a cell where
 * the abbreviation is enough; the full value stays in the accessible name.
 */
export const NoTooltip: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    <span className='sb-annotation text-right'>12,042 (decimal)</span>
    <FormatNumber value={12_042} tooltip={false} />

    <span className='sb-annotation text-right'>59,614,283 (decimal)</span>
    <FormatNumber value={59_614_283} tooltip={false} />

    <span className='sb-annotation text-right'>12,042 with unit</span>
    <FormatNumber value={12_042} unit='requests' tooltip={false} />

    <span className='sb-annotation text-right'>12,700,000 (byte)</span>
    <FormatNumber value={12_700_000} type='byte' tooltip={false} />
  </div>
);

/**
 * Negatives abbreviate on the same tiers, with the sign kept in front of the number.
 */
export const NegativeValues: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    <span className='sb-annotation text-right'>-42</span>
    <FormatNumber value={-42} />

    <span className='sb-annotation text-right'>-12,042</span>
    <FormatNumber value={-12_042} />

    <span className='sb-annotation text-right'>-59,614,283</span>
    <FormatNumber value={-59_614_283} />
  </div>
);

/**
 * `null` and `undefined` render an em dash with 'No data' on hover, so a figure nobody
 * recorded never reads as a zero.
 */
export const NullValue: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    <span className='sb-annotation text-right'>null</span>
    <FormatNumber value={null} />

    <span className='sb-annotation text-right'>undefined</span>
    <FormatNumber value={undefined} />
  </div>
);

/**
 * Zero is printed as itself rather than abbreviated, while `NaN` and `Infinity` fall back
 * to the em dash — with no tooltip, since there is nothing behind them to show.
 */
export const SpecialValues: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    <span className='sb-annotation text-right'>0</span>
    <FormatNumber value={0} />

    <span className='sb-annotation text-right'>NaN</span>
    <FormatNumber value={Number.NaN} />

    <span className='sb-annotation text-right'>Infinity</span>
    <FormatNumber value={Number.POSITIVE_INFINITY} />
  </div>
);
