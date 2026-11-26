import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { FormatDuration } from './FormatDuration';

const DESCRIPTION = [
  'Prints how long something took in its two largest units — `1h 30m`, `30m 23s`, `45s` — so a column of run times stays short and comparable.',
  'When smaller units are dropped, the exact duration sits in a tooltip behind a dashed underline. `value` takes milliseconds or an ISO 8601 duration (`PT2M13S`); `formatDuration()` returns the same text as a string.',
].join(' ');

const meta = {
  title: 'Data Display/FormatDuration',
  component: FormatDuration,
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
  args: {
    value: 5_400_000,
  },
} satisfies Meta<typeof FormatDuration>;

export default meta;

/**
 * The raw milliseconds beside what the component makes of them. A zero unit between
 * the two shown is left out (`1h`, not `1h 0m`), and anything under a second reads `<1s`.
 */
export const Units: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    <span className='sb-annotation text-right'>0</span>
    <FormatDuration value={0} data-testid='duration-zero' />

    <span className='sb-annotation text-right'>300</span>
    <FormatDuration value={300} data-testid='duration-sub-second' />

    <span className='sb-annotation text-right'>45,000</span>
    <FormatDuration value={45_000} data-testid='duration-seconds' />

    <span className='sb-annotation text-right'>1,823,000</span>
    <FormatDuration value={1_823_000} data-testid='duration-minutes' />

    <span className='sb-annotation text-right'>3,600,000</span>
    <FormatDuration value={3_600_000} data-testid='duration-hour' />

    <span className='sb-annotation text-right'>5,400,000</span>
    <FormatDuration value={5_400_000} data-testid='duration-hours' />

    <span className='sb-annotation text-right'>184,500,000</span>
    <FormatDuration value={184_500_000} data-testid='duration-days' />
  </div>
);

/**
 * Two units are shown; the rest moves into the tooltip, so `1h 4m 30s` reads `1h 4m`
 * with the exact figure on hover. `tooltip={false}` drops the tooltip and the underline.
 */
export const Truncated: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    <span className='sb-annotation text-right'>1h 4m 30s</span>
    <FormatDuration value={3_870_000} data-testid='duration-truncated' />

    <span className='sb-annotation text-right'>2d 3h 15m</span>
    <FormatDuration value={184_500_000} data-testid='duration-truncated-days' />

    <span className='sb-annotation text-right'>1h 4m 30s (tooltip=false)</span>
    <FormatDuration value={3_870_000} tooltip={false} data-testid='duration-no-tooltip' />
  </div>
);

/**
 * An ISO 8601 duration from an API contract renders as is, without converting it first.
 */
export const IsoDuration: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    <span className='sb-annotation text-right'>PT52S</span>
    <FormatDuration value='PT52S' />

    <span className='sb-annotation text-right'>PT2M13S</span>
    <FormatDuration value='PT2M13S' />

    <span className='sb-annotation text-right'>PT41.6S</span>
    <FormatDuration value='PT41.6S' />

    <span className='sb-annotation text-right'>P1DT2H</span>
    <FormatDuration value='P1DT2H' />
  </div>
);

/**
 * `null` and `undefined` render an em dash with 'No data' on hover; a negative or
 * unparsable value renders a bare em dash.
 */
export const NullValue: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-[1fr_1fr] items-center gap-x-16 gap-y-12'>
    <span className='sb-annotation text-right'>null</span>
    <FormatDuration value={null} data-testid='duration-null' />

    <span className='sb-annotation text-right'>-1000</span>
    <FormatDuration value={-1000} />

    <span className='sb-annotation text-right'>'2 minutes'</span>
    <FormatDuration value='2 minutes' />
  </div>
);

/**
 * `typography='inherit'` renders a plain span, so the duration takes its font, size,
 * weight and colour from the parent.
 */
export const InheritTypography: StoryFn<typeof meta> = () => (
  <div className='font-sans-display text-xl font-medium text-text-primary'>
    <FormatDuration value={1_823_000} typography='inherit' />
  </div>
);
