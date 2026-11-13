import { describe, expect, it } from '@rstest/core';
import {
  findOverlappingRanges,
  isInRange,
  layoutRangeLabels,
  type RangeEdges,
  resolveRangeEdges,
} from './rangeGeometry';

// Data X 0..20 every 5, datum i at pixel 100 + i * 50 → plot spans 100..300.
const xs = [0, 5, 10, 15, 20];
const pixelOf = (i: number) => 100 + i * 50;
const plot = { xs, pixelOf, plotLeft: 100, plotRight: 300 };

describe('resolveRangeEdges', () => {
  it('maps edges that hit data points to their pixels', () => {
    expect(resolveRangeEdges({ ...plot, from: 5, to: 15 })).toEqual({
      x1: 150,
      x2: 250,
      clampedStart: false,
      clampedEnd: false,
    });
  });

  it('interpolates edges between buckets', () => {
    const edges = resolveRangeEdges({ ...plot, from: 7, to: 12 });
    expect(edges?.x1).toBe(170);
    expect(edges?.x2).toBe(220);
  });

  it('clamps a start before the first datum to the plot left edge', () => {
    expect(resolveRangeEdges({ ...plot, from: -5, to: 10 })).toMatchObject({
      x1: 100,
      clampedStart: true,
      clampedEnd: false,
    });
  });

  it('clamps an ongoing range or an end past the last datum to the plot right edge', () => {
    expect(resolveRangeEdges({ ...plot, from: 10 })).toMatchObject({ x2: 300, clampedEnd: true });
    expect(resolveRangeEdges({ ...plot, from: 10, to: 99 })).toMatchObject({
      x2: 300,
      clampedEnd: true,
    });
  });

  it('returns null for a range fully outside the data', () => {
    expect(resolveRangeEdges({ ...plot, from: 30, to: 40 })).toBeNull();
    expect(resolveRangeEdges({ ...plot, from: -10, to: -1 })).toBeNull();
  });

  it('returns null for a single datum or unsorted data', () => {
    expect(resolveRangeEdges({ ...plot, xs: [5], from: 0, to: 10 })).toBeNull();
    expect(resolveRangeEdges({ ...plot, xs: [20, 15, 10, 5, 0], from: 5, to: 15 })).toBeNull();
  });

  it('matches string X exactly', () => {
    const stringPlot = { ...plot, xs: ['a', 'b', 'c', 'd'] };
    expect(resolveRangeEdges({ ...stringPlot, from: 'b', to: 'c' })).toEqual({
      x1: 150,
      x2: 200,
      clampedStart: false,
      clampedEnd: false,
    });
    expect(resolveRangeEdges({ ...stringPlot, from: 'zz' })).toBeNull();
  });
});

describe('isInRange', () => {
  const range = { from: 5, to: 15 };

  it('compares numeric X inclusively', () => {
    expect(isInRange(10, range, xs)).toBe(true);
    expect(isInRange(15, range, xs)).toBe(true);
    expect(isInRange(16, range, xs)).toBe(false);
  });

  it('treats a missing end as ongoing', () => {
    expect(isInRange(999, { from: 5 }, xs)).toBe(true);
  });

  it('compares string X by index between the matched edges', () => {
    const letters = ['a', 'b', 'c', 'd'];
    expect(isInRange('b', { from: 'b', to: 'c' }, letters)).toBe(true);
    expect(isInRange('c', { from: 'b', to: 'c' }, letters)).toBe(true);
    expect(isInRange('d', { from: 'b', to: 'c' }, letters)).toBe(false);
    expect(isInRange('d', { from: 'b' }, letters)).toBe(true);
    expect(isInRange('b', { from: 'zz' }, letters)).toBe(false);
  });
});

describe('findOverlappingRanges', () => {
  it('reports overlapping pairs', () => {
    expect(
      findOverlappingRanges([
        { key: 'a', from: 0, to: 10 },
        { key: 'b', from: 5, to: 20 },
        { key: 'c', from: 30 },
      ]),
    ).toEqual([['a', 'b']]);
  });

  it('counts touching ranges as overlapping', () => {
    expect(
      findOverlappingRanges([
        { key: 'a', from: 0, to: 10 },
        { key: 'b', from: 10, to: 20 },
      ]),
    ).toEqual([['a', 'b']]);
  });

  it('lets an ongoing range overlap anything starting after it', () => {
    expect(
      findOverlappingRanges([
        { key: 'a', from: 10 },
        { key: 'b', from: 50, to: 60 },
        { key: 'c', from: 0, to: 5 },
      ]),
    ).toEqual([['a', 'b']]);
  });
});

describe('layoutRangeLabels', () => {
  const edges: RangeEdges = { x1: 150, x2: 250, clampedStart: false, clampedEnd: false };
  const base = {
    edges,
    ongoing: false,
    visibleRangeCount: 1,
    startWidth: 30,
    endWidth: 30,
    plotLeft: 100,
    plotRight: 300,
    gap: 4,
  };

  it('puts labels outside the edges', () => {
    expect(layoutRangeLabels(base)).toEqual({
      start: { x: 146, anchor: 'end' },
      end: { x: 254, anchor: 'start' },
    });
  });

  it('hides every label when two or more ranges are visible', () => {
    expect(layoutRangeLabels({ ...base, visibleRangeCount: 2 })).toEqual({
      start: null,
      end: null,
    });
  });

  it('hides the start label of a clamped start edge', () => {
    expect(
      layoutRangeLabels({ ...base, edges: { ...edges, x1: 100, clampedStart: true } }).start,
    ).toBeNull();
  });

  it('hides labels that would leave the plot', () => {
    expect(layoutRangeLabels({ ...base, edges: { ...edges, x1: 120 } }).start).toBeNull();
    expect(layoutRangeLabels({ ...base, edges: { ...edges, x2: 280 } }).end).toBeNull();
  });

  it('places the ongoing label inside the range at the plot right edge', () => {
    expect(
      layoutRangeLabels({
        ...base,
        ongoing: true,
        edges: { ...edges, x2: 300, clampedEnd: true },
      }).end,
    ).toEqual({ x: 300, anchor: 'end' });
  });

  it('hides the ongoing label when it would collide with the start label', () => {
    const layout = layoutRangeLabels({
      ...base,
      ongoing: true,
      edges: { x1: 280, x2: 300, clampedStart: false, clampedEnd: true },
    });
    expect(layout.start).toEqual({ x: 276, anchor: 'end' });
    expect(layout.end).toBeNull();
  });
});
