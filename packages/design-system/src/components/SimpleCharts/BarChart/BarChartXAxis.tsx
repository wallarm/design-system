import type { FC } from 'react';
import { XAxis } from 'recharts';
import type { TickFormatter } from 'recharts/types/cartesian/CartesianAxis';
import type { XAxisTickContentProps } from 'recharts/types/util/types';
import { renderAxisTick } from '../LineChart/lib/renderAxisTick';
import { BAR_VALUE_LABEL_HEIGHT } from './constants';

export interface BarChartXAxisProps {
  /** Format the rendered tick label. Receives the tick value. */
  tickFormatter?: (value: unknown, index: number) => string;
  /** Recharts target tick count. */
  tickCount?: number;
  /** Explicit tick values. Overrides recharts' generator. */
  ticks?: ReadonlyArray<number>;
  /** Recharts domain override. Defaults to `[0, 'auto']`. */
  domain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'];
  /** Keep the value scale but draw no labels — the row totals carry the values. */
  hide?: boolean;
}

const renderTick = renderAxisTick<XAxisTickContentProps>();

const DEFAULT_DOMAIN: BarChartXAxisProps['domain'] = [0, 'auto'];

/**
 * The value scale. Mount it with `hide` — the row totals carry the values and the scale only
 * sizes the bars. Visible, it draws value labels under the bars in a 16px band, no axis line.
 */
export const BarChartXAxis: FC<BarChartXAxisProps> = ({
  tickFormatter,
  tickCount,
  ticks,
  domain = DEFAULT_DOMAIN,
  hide = false,
}) => (
  <XAxis
    type='number'
    hide={hide}
    height={BAR_VALUE_LABEL_HEIGHT}
    tickLine={false}
    // The hidden tick line still offsets the label by its 6px length (see `ColumnChartXAxis`).
    tickSize={0}
    axisLine={false}
    allowDecimals={false}
    tick={renderTick}
    tickFormatter={tickFormatter as TickFormatter | undefined}
    tickCount={tickCount}
    ticks={ticks}
    domain={domain}
    interval='preserveStartEnd'
  />
);

BarChartXAxis.displayName = 'BarChartXAxis';
