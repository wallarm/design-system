import { describe, expect, it } from '@rstest/core';
import type { GridLineTypeFunctionProps } from 'recharts/types/cartesian/CartesianGrid';

import { dropEdgeGridLines } from './dropEdgeGridLines';

// Ticks 0 / 50 / 100 on a plot from y=0 (top) to y=100 (bottom).
const yAxis = {
  scale: { map: (v: number) => 100 - v },
  niceTicks: [0, 50, 100],
} as unknown as GridLineTypeFunctionProps['yAxis'];

// What recharts hands the `horizontal` render function: the line geometry plus every
// `<CartesianGrid>` prop and its own layout state.
const lineProps = (y: number) =>
  ({
    x1: 0,
    x2: 200,
    y1: y,
    y2: y,
    key: `line-${y}`,
    index: 0,
    offset: { top: 0 },
    yAxis,
    xAxis: {},
    stroke: 'var(--color-border-primary-light)',
    strokeDasharray: '4 4',
    horizontal: () => null,
    horizontalCoordinatesGenerator: () => [],
    horizontalPoints: [0, 50, 100],
    verticalPoints: [],
    syncWithTicks: false,
    zIndex: 0,
  }) as unknown as GridLineTypeFunctionProps;

describe('dropEdgeGridLines', () => {
  it('renders a kept line with SVG attributes only, not the grid props', () => {
    const line = dropEdgeGridLines()(lineProps(50));
    expect(line.type).toBe('line');
    expect(line.props).toEqual({
      x1: 0,
      x2: 200,
      y1: 50,
      y2: 50,
      stroke: 'var(--color-border-primary-light)',
      strokeDasharray: '4 4',
      fill: 'none',
    });
  });

  it('drops the bottom line', () => {
    expect(dropEdgeGridLines()(lineProps(100)).type).toBe('g');
  });

  it('keeps the bottom line with keepBottom', () => {
    expect(dropEdgeGridLines({ keepBottom: true })(lineProps(100)).type).toBe('line');
  });
});
