import { type RefObject, useLayoutEffect, useState } from 'react';
import { useContainerWidth } from '../Table/lib/useContainerWidth';

interface ComputeArgs {
  containerWidth: number;
  methodWidth: number;
  encodingWidth: number;
  segmentWidths: number[];
  jointsWidth: number;
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
}: ComputeArgs): TruncationResult => {
  const segCount = segmentWidths.length;
  const allIndices = Array.from({ length: segCount }, (_, i) => i);

  if (segCount <= 2 || containerWidth <= 0) {
    return { isTruncated: false, visibleSegmentIndices: allIndices };
  }

  const totalWidth =
    methodWidth + encodingWidth + segmentWidths.reduce((acc, w) => acc + w, 0) + jointsWidth;

  if (totalWidth <= containerWidth) {
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
    visibleSegmentIndices: Array.from({ length: segmentCount }, (_, i) => i),
  });

  useLayoutEffect(() => {
    const root = measurementRef.current;
    if (!root) return;

    const methodEl = root.querySelector<HTMLElement>('[data-measure="method"]');
    const encodingEl = root.querySelector<HTMLElement>('[data-measure="encoding"]');
    const jointEls = Array.from(root.querySelectorAll<HTMLElement>('[data-measure="joint"]'));
    const segmentEls = Array.from(root.querySelectorAll<HTMLElement>('[data-measure="segment"]'));

    const segmentWidths = segmentEls.map(el => el.getBoundingClientRect().width);
    const methodWidth = hasMethod && methodEl ? methodEl.getBoundingClientRect().width : 0;
    const encodingWidth = hasEncoding && encodingEl ? encodingEl.getBoundingClientRect().width : 0;
    const jointsWidth = jointEls.reduce((acc, el) => acc + el.getBoundingClientRect().width, 0);

    const next = computeTruncation({
      containerWidth,
      methodWidth,
      encodingWidth,
      segmentWidths,
      jointsWidth,
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
