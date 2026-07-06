import type { ChartColor } from '../../types';
import { HORIZONTAL_BAR_STACK_PALETTE, REMAINDER_KEY } from '../constants';
import type { HorizontalBarStackDatum } from '../HorizontalBarStack';

export interface ResolvedSegment {
  key: string;
  value: number;
  color?: ChartColor;
  className?: string;
  isRemainder: boolean;
}

const sanitize = (n: number): number =>
  typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : 0;

export function resolveSegments(data: HorizontalBarStackDatum[], total?: number): ResolvedSegment[] {
  const segments: ResolvedSegment[] = data.map((d, i) => ({
    key: d.name,
    value: sanitize(d.value),
    color: d.color ?? HORIZONTAL_BAR_STACK_PALETTE[i % HORIZONTAL_BAR_STACK_PALETTE.length],
    className: d.className,
    isRemainder: false,
  }));

  const sum = segments.reduce((s, seg) => s + seg.value, 0);
  const hasTotal = typeof total === 'number' && Number.isFinite(total) && total > sum;
  const remainder = hasTotal ? total - sum : 0;

  if (remainder > 0) {
    segments.push({ key: REMAINDER_KEY, value: remainder, isRemainder: true });
  }

  return segments;
}
