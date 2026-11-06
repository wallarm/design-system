import type { FC } from 'react';
import { useTestId } from '../../../utils/testId';
import { ChartDelta, type ChartDeltaProps } from '../internal/ChartDelta';

export type MetricDeltaProps = Pick<ChartDeltaProps, 'value' | 'trend' | 'sentiment'>;

/**
 * The trend chip brick — a thin wrapper over the shared `ChartDelta` so it earns a
 * `--delta` slot id while `ChartDelta` stays the single source of colour/arrow logic.
 * `sentiment` sets the colour (positive → green, negative → red, neutral → slate),
 * `trend` sets the arrow — independent axes.
 */
export const MetricDelta: FC<MetricDeltaProps> = props => {
  const testId = useTestId('delta');
  return <ChartDelta {...props} data-testid={testId} />;
};

MetricDelta.displayName = 'MetricDelta';
