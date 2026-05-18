import type { ReactNode } from 'react';
import { Text } from 'recharts';
import type { TextAnchor } from 'recharts/types/component/Text';
import type { XAxisTickContentProps, YAxisTickContentProps } from 'recharts/types/util/types';
import { LINE_AXIS_TICK_TEXT_PROPS } from '../constants';

export interface AxisTickDecision {
  /** When `true`, render nothing for this tick. */
  skip?: boolean;
  /** Override the axis-derived text anchor. */
  anchor?: TextAnchor;
}

type AxisTickProps = XAxisTickContentProps | YAxisTickContentProps;
type Decide<T extends AxisTickProps> = (props: T) => AxisTickDecision;

// `index` and `visibleTicksCount` in `decide` are post-collision-filter — so
// `index === 0` and `index === visibleTicksCount - 1` are guaranteed to be the
// rendered edge ticks, not the upstream data edges.
export const renderAxisTick =
  <T extends AxisTickProps>(decide?: Decide<T>) =>
  (props: T): ReactNode => {
    const decision = decide?.(props) ?? {};
    if (decision.skip) return null;
    const { x, y, payload, textAnchor, verticalAnchor, tickFormatter, orientation } = props;
    const value = tickFormatter ? tickFormatter(payload.value, payload.index) : payload.value;
    // Recharts pre-shifts the first/last tick's `tickCoord` inward to keep a
    // middle-anchored label within the plot. That shift is wrong for an
    // `'end'` / `'start'`-anchored label — it leaves the edge of the text
    // floating off its tick. When the caller overrides the anchor, anchor to
    // the true `coordinate` so the text edge lands directly under the tick.
    const isHorizontal = orientation === 'top' || orientation === 'bottom';
    const anchorToCoordinate = decision.anchor != null;
    return (
      <Text
        x={anchorToCoordinate && isHorizontal ? payload.coordinate : x}
        y={anchorToCoordinate && !isHorizontal ? payload.coordinate : y}
        textAnchor={decision.anchor ?? textAnchor}
        verticalAnchor={verticalAnchor}
        {...LINE_AXIS_TICK_TEXT_PROPS}
      >
        {value}
      </Text>
    );
  };
