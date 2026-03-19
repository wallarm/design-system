import type { BarShapeProps } from 'recharts';
import type { ActiveShape } from 'recharts/types/util/types';
import { CHART_COLORS } from '../constants';
import type { ChartColor } from '../types';

const getBarFill = (props: BarShapeProps) => {
  const DEFAULT_COLOR = 'var(--color-states-primary-pressed)';

  if (props.color) {
    return CHART_COLORS[props.color as ChartColor] ?? DEFAULT_COLOR;
  }

  return DEFAULT_COLOR;
};

export const ChartBarListBar: ActiveShape<BarShapeProps, SVGPathElement> = props => {
  const { x = 0, y = 0, width = 0, height = 0 } = props;

  if (width <= 0) return null;

  return <rect x={x} y={y} width={width} height={height} fill={getBarFill(props)} rx={6} ry={6} />;
};
