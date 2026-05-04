import { type RefObject, useLayoutEffect, useState } from 'react';
import { useContainerWidth } from '../Table/lib/useContainerWidth';

interface ComputeArgs {
  containerWidth: number;
  methodWidth: number;
  encodingWidth: number;
  segmentWidths: number[];
  jointWidth: number;
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
  jointWidth,
}: ComputeArgs): TruncationResult => {
  const segCount = segmentWidths.length;
  const allIndices = Array.from({ length: segCount }, (_, i) => i);

  if (segCount <= 2 || containerWidth <= 0) {
    return { isTruncated: false, visibleSegmentIndices: allIndices };
  }

  const jointsCount =
    (methodWidth > 0 ? 1 : 0) + Math.max(0, segCount - 1) + (encodingWidth > 0 ? 1 : 0);
  const totalWidth =
    methodWidth +
    encodingWidth +
    segmentWidths.reduce((acc, w) => acc + w, 0) +
    jointsCount * jointWidth;

  if (totalWidth <= containerWidth) {
    return { isTruncated: false, visibleSegmentIndices: allIndices };
  }

  return { isTruncated: true, visibleSegmentIndices: [0, segCount - 1] };
};

interface UseTruncationArgs {
  containerRef: RefObject<HTMLElement | null>;
  measurementRef: RefObject<HTMLElement | null>;
  segmentCount: number;
  hasMethod: boolean;
  hasEncoding: boolean;
}

/**
 * Measures rendered segments inside `measurementRef` (a hidden full-width clone),
 * watches `containerRef` width via ResizeObserver, and returns truncation state.
 */
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
    const jointEl = root.querySelector<HTMLElement>('[data-measure="joint"]');
    const segmentEls = Array.from(root.querySelectorAll<HTMLElement>('[data-measure="segment"]'));

    const segmentWidths = segmentEls.map(el => el.getBoundingClientRect().width);
    const methodWidth = hasMethod && methodEl ? methodEl.getBoundingClientRect().width : 0;
    const encodingWidth = hasEncoding && encodingEl ? encodingEl.getBoundingClientRect().width : 0;
    const jointWidth = jointEl ? jointEl.getBoundingClientRect().width : 0;

    setResult(
      computeTruncation({
        containerWidth,
        methodWidth,
        encodingWidth,
        segmentWidths,
        jointWidth,
      }),
    );
  }, [containerWidth, segmentCount, hasMethod, hasEncoding, measurementRef]);

  return result;
};
