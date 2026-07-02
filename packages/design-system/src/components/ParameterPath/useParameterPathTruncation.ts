import { type RefObject, useLayoutEffect, useState } from 'react';
import { range } from '../../utils/range';
import { useContainerWidth } from '../Table/lib/useContainerWidth';
import { MEASURE } from './constants';

// ResizeObserver's contentRect is device-pixel snapped while getBoundingClientRect
// sums are not; without a tolerance a sub-pixel mismatch flips truncation back and
// forth every frame — the "shaking" path (AS-1205).
const EPSILON = 1;

interface ComputeArgs {
  containerWidth: number;
  methodWidth: number;
  encodingWidth: number;
  segmentWidths: number[];
  jointsWidth: number;
  jointWidth: number;
  ellipsisWidth: number;
}

interface TruncationResult {
  isTruncated: boolean;
  visibleSegmentIndices: number[];
}

export const computeTruncation = ({
  containerWidth,
  methodWidth,
  encodingWidth,
  segmentWidths,
  jointsWidth,
  jointWidth,
  ellipsisWidth,
}: ComputeArgs): TruncationResult => {
  const segCount = segmentWidths.length;
  const allIndices = range(segCount);

  if (segCount <= 2 || containerWidth <= 0) {
    return { isTruncated: false, visibleSegmentIndices: allIndices };
  }

  const totalWidth =
    methodWidth + encodingWidth + segmentWidths.reduce((acc, w) => acc + w, 0) + jointsWidth;

  if (totalWidth <= containerWidth + EPSILON) {
    return { isTruncated: false, visibleSegmentIndices: allIndices };
  }

  // Collapsing swaps the middle segments (and all but two of their joints) for
  // the ellipsis pill. When the middle is narrower than the pill — e.g. a
  // single-letter segment — collapsing makes the row WIDER, so it can never
  // help; keep the full path (AS-1205).
  const middleWidth =
    segmentWidths.slice(1, -1).reduce((acc, w) => acc + w, 0) + (segCount - 3) * jointWidth;
  const collapsedWidth = totalWidth - middleWidth + ellipsisWidth;

  if (collapsedWidth + EPSILON >= totalWidth) {
    return { isTruncated: false, visibleSegmentIndices: allIndices };
  }

  // On overflow always collapse to [first, …, last]; if even that is too wide
  // the parent's `overflow-hidden` clips the row.
  return { isTruncated: true, visibleSegmentIndices: [0, segCount - 1] };
};

const indicesEqual = (a: number[], b: number[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i]);

interface UseTruncationArgs {
  containerRef: RefObject<HTMLElement | null>;
  measurementRef: RefObject<HTMLElement | null>;
  segmentCount: number;
  hasMethod: boolean;
  hasEncoding: boolean;
}

export const useParameterPathTruncation = ({
  containerRef,
  measurementRef,
  segmentCount,
  hasMethod,
  hasEncoding,
}: UseTruncationArgs): TruncationResult => {
  const containerWidth = useContainerWidth(containerRef);
  const [result, setResult] = useState<TruncationResult>({
    isTruncated: false,
    visibleSegmentIndices: range(segmentCount),
  });

  useLayoutEffect(() => {
    const root = measurementRef.current;
    if (!root) return;

    const methodEl = root.querySelector<HTMLElement>(`[data-measure="${MEASURE.method}"]`);
    const encodingEl = root.querySelector<HTMLElement>(`[data-measure="${MEASURE.encoding}"]`);
    const ellipsisEl = root.querySelector<HTMLElement>(`[data-measure="${MEASURE.ellipsis}"]`);
    const jointEls = Array.from(
      root.querySelectorAll<HTMLElement>(`[data-measure="${MEASURE.joint}"]`),
    );
    const segmentEls = Array.from(
      root.querySelectorAll<HTMLElement>(`[data-measure="${MEASURE.segment}"]`),
    );

    const segmentWidths = segmentEls.map(el => el.getBoundingClientRect().width);
    const methodWidth = hasMethod && methodEl ? methodEl.getBoundingClientRect().width : 0;
    const encodingWidth = hasEncoding && encodingEl ? encodingEl.getBoundingClientRect().width : 0;
    const jointWidths = jointEls.map(el => el.getBoundingClientRect().width);
    const jointsWidth = jointWidths.reduce((acc, w) => acc + w, 0);

    const next = computeTruncation({
      containerWidth,
      methodWidth,
      encodingWidth,
      segmentWidths,
      jointsWidth,
      jointWidth: jointWidths[0] ?? 0,
      ellipsisWidth: ellipsisEl?.getBoundingClientRect().width ?? 0,
    });

    setResult(prev =>
      prev.isTruncated === next.isTruncated &&
      indicesEqual(prev.visibleSegmentIndices, next.visibleSegmentIndices)
        ? prev
        : next,
    );
  }, [containerWidth, segmentCount, hasMethod, hasEncoding, measurementRef]);

  return result;
};
