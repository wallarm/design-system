import type { FC, ReactNode, Ref } from 'react';
import { range } from '../../utils/range';
import { TestIdProvider } from '../../utils/testId';
import type { HttpMethodName } from '../HttpMethod';
import { rowVariants } from './classes';
import { MEASURE, ROW } from './constants';
import { ParameterPathEllipsis } from './ParameterPathEllipsis';
import { ParameterPathEncoding } from './ParameterPathEncoding';
import { ParameterPathJoint } from './ParameterPathJoint';
import { ParameterPathMethod } from './ParameterPathMethod';
import { ParameterPathSegment } from './ParameterPathSegment';

interface ParameterPathRowProps {
  ref?: Ref<HTMLDivElement>;
  method?: HttpMethodName;
  segments: string[];
  encoding?: string;
  attack: boolean;
  /**
   * The offscreen measurement row renders every segment (tagged with
   * `data-measure`) so the truncation hook can read widths; the visible row
   * renders only the segments in `indices`.
   */
  forMeasurement: boolean;
  /** Visible segment indices when collapsed; `null` shows every segment. */
  indices: number[] | null;
  /** Visible row only: an expanded path wraps instead of clipping. */
  isExpanded?: boolean;
}

export const ParameterPathRow: FC<ParameterPathRowProps> = ({
  ref,
  method,
  segments,
  encoding,
  attack,
  forMeasurement,
  indices,
  isExpanded = false,
}) => {
  const lastIndex = segments.length - 1;
  const visibleIdx = forMeasurement || indices === null ? range(segments.length) : indices;
  const measure = (slot: string) => (forMeasurement ? slot : undefined);

  const items: ReactNode[] = [];

  if (method) {
    items.push(
      <ParameterPathMethod key='method' method={method} data-measure={measure(MEASURE.method)} />,
    );
  }

  visibleIdx.forEach((segIndex, position) => {
    const value = segments[segIndex];
    if (value === undefined) return;
    const isLast = segIndex === lastIndex;
    const isFirstShown = position === 0;

    const showJointBefore = !(isFirstShown && !method);
    if (showJointBefore) {
      items.push(
        <ParameterPathJoint key={`j-${segIndex}-pre`} data-measure={measure(MEASURE.joint)} />,
      );
    }

    const isCollapsedBoundary =
      !forMeasurement && indices !== null && position === 0 && visibleIdx.length === 2;

    items.push(
      <ParameterPathSegment
        key={`s-${segIndex}`}
        index={segIndex}
        variant={isLast ? 'highlighted' : 'default'}
        withZap={isLast && attack}
        data-measure={measure(MEASURE.segment)}
      >
        {value}
      </ParameterPathSegment>,
    );

    if (isCollapsedBoundary) {
      items.push(
        <ParameterPathJoint key='ellipsis-joint-pre' />,
        <ParameterPathEllipsis key='ellipsis' />,
      );
    }
  });

  if (encoding) {
    items.push(
      <ParameterPathJoint key='enc-joint' data-measure={measure(MEASURE.joint)} />,
      <ParameterPathEncoding key='enc' data-measure={measure(MEASURE.encoding)}>
        {encoding}
      </ParameterPathEncoding>,
    );
  }

  if (forMeasurement) {
    // Suppress test-ids in the measurement row so queries match only the visible
    // one. Positioned offscreen and hidden — it exists purely to measure widths.
    return (
      <div
        ref={ref}
        data-slot='parameter-path-row'
        data-row={ROW.measure}
        aria-hidden='true'
        className='flex items-center gap-0 absolute left-[-9999px] top-0 invisible pointer-events-none'
      >
        <TestIdProvider value={undefined}>{items}</TestIdProvider>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      data-slot='parameter-path-row'
      data-row={ROW.visible}
      className={rowVariants({ expanded: isExpanded })}
    >
      {items}
    </div>
  );
};

ParameterPathRow.displayName = 'ParameterPathRow';
