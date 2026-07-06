import type { FC } from 'react';
import { ArrowDown, ArrowUp } from '../../../icons';
import { Badge } from '../../Badge';
import type { BadgeColor } from '../../Badge/types';

export type ChartDeltaSentiment = 'positive' | 'negative' | 'neutral';
export type ChartDeltaTrend = 'up' | 'down';

export interface ChartDeltaProps {
  /** Magnitude shown in the chip; rendered as `Math.abs(value).toLocaleString('en-US')`. */
  value: number;
  /** Arrow direction. Defaults to the sign of `value` (`>= 0` → up). */
  trend?: ChartDeltaTrend;
  /**
   * Colour = meaning, and it is independent of the arrow: `positive` → green,
   * `negative` → w-orange, `neutral` → slate. Defaults to `neutral`. An increase
   * can therefore read as negative (w-orange ↑) and a decrease as positive (green ↓).
   */
  sentiment?: ChartDeltaSentiment;
  'data-testid'?: string;
}

const SENTIMENT_COLOR: Record<ChartDeltaSentiment, BadgeColor> = {
  positive: 'green',
  negative: 'w-orange',
  neutral: 'slate',
};

const formatNumber = (n: number): string => n.toLocaleString('en-US');

/**
 * The shared trend chip used by `Metric` and `HorizontalBarStack`. A 2-axis
 * matrix mirroring the Figma `delta` component: `sentiment` drives the colour,
 * `trend` drives the arrow — the two are independent.
 */
export const ChartDelta: FC<ChartDeltaProps> = ({
  value,
  trend,
  sentiment = 'neutral',
  'data-testid': testId,
}) => {
  const direction = trend ?? (value >= 0 ? 'up' : 'down');
  const abs = Math.abs(value);

  return (
    <Badge
      type='secondary'
      color={SENTIMENT_COLOR[sentiment]}
      size='medium'
      data-testid={testId}
      // Badge renders a generic <div>; without a role its aria-label is ignored —
      // role='img' makes "up 10" the computed accessible name. The arrow icon is
      // decorative (aria-hidden); direction + magnitude live in the label.
      role='img'
      aria-label={`${direction} ${formatNumber(abs)}`}
    >
      {direction === 'up' ? <ArrowUp aria-hidden /> : <ArrowDown aria-hidden />}
      {formatNumber(abs)}
    </Badge>
  );
};

ChartDelta.displayName = 'ChartDelta';
