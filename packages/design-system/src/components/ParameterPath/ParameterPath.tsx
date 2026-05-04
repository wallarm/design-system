import type { ClipboardEvent, FC, ReactNode } from 'react';
import { useCallback, useRef } from 'react';
import { cn } from '../../utils/cn';
import { TestIdProvider } from '../../utils/testId';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { buildFullPathLabel } from './buildFullPathLabel';
import { formatAsFilter } from './formatAsFilter';
import { ParameterPathEllipsis } from './ParameterPathEllipsis';
import { ParameterPathEncoding } from './ParameterPathEncoding';
import { ParameterPathJoint } from './ParameterPathJoint';
import { ParameterPathMethod } from './ParameterPathMethod';
import { ParameterPathSegment } from './ParameterPathSegment';
import type { ParameterPathProps } from './types';
import { useParameterPathTruncation } from './useParameterPathTruncation';

export const ParameterPath: FC<ParameterPathProps> = ({
  ref,
  method,
  segments,
  encoding,
  attack = false,
  copyFormat = formatAsFilter,
  className,
  'data-testid': testId,
  ...rest
}) => {
  const handleCopy = useCallback(
    (event: ClipboardEvent<HTMLDivElement>) => {
      const text = copyFormat({ method, segments, encoding });
      if (!text) return;
      event.preventDefault();
      event.clipboardData.setData('text/plain', text);
    },
    [copyFormat, method, segments, encoding],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const measurementRef = useRef<HTMLDivElement>(null);

  const { isTruncated, visibleSegmentIndices } = useParameterPathTruncation({
    containerRef,
    measurementRef,
    segmentCount: segments.length,
    hasMethod: Boolean(method),
    hasEncoding: Boolean(encoding),
  });

  const lastIndex = segments.length - 1;
  const indices = isTruncated && segments.length > 2 ? visibleSegmentIndices : null;

  const renderRow = (forMeasurement: boolean): ReactNode => {
    const visibleIdx =
      forMeasurement || indices === null
        ? Array.from({ length: segments.length }, (_, i) => i)
        : indices;

    const items: ReactNode[] = [];
    const measure = (slot: string) => (forMeasurement ? slot : undefined);

    if (method) {
      items.push(
        <ParameterPathMethod key='method' method={method} data-measure={measure('method')} />,
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
          <ParameterPathJoint key={`j-${segIndex}-pre`} data-measure={measure('joint')} />,
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
          data-measure={measure('segment')}
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
        <ParameterPathJoint key='enc-joint' data-measure={measure('joint')} />,
        <ParameterPathEncoding key='enc' data-measure={measure('encoding')}>
          {encoding}
        </ParameterPathEncoding>,
      );
    }

    return items;
  };

  const visibleRow = (
    <div
      ref={containerRef}
      data-row='visible'
      className='flex items-center gap-0 min-w-0 overflow-hidden'
    >
      {renderRow(false)}
    </div>
  );

  // Suppress test-ids inside the off-screen measurement row so queries against
  // `data-testid` resolve to a single (visible) match rather than two duplicates.
  const measurementRow = (
    <div
      ref={measurementRef}
      data-row='measure'
      aria-hidden='true'
      className='flex items-center gap-0 absolute left-[-9999px] top-0 invisible pointer-events-none'
    >
      <TestIdProvider value={undefined}>{renderRow(true)}</TestIdProvider>
    </div>
  );

  // The Tooltip wrapper is always rendered to keep the DOM tree stable across
  // truncation toggles. Conditionally wrapping in <Tooltip> would remount the
  // visible row, which would tear down the ResizeObserver in `useContainerWidth`
  // and freeze the measured container width — preventing truncation from ever
  // settling. Instead, we render Tooltip permanently and toggle `disabled`.
  // The outer Tooltip uses its own TestIdProvider for its sub-components, which
  // would clobber our context to `undefined` here. Re-establish the provider
  // inside TooltipTrigger so sub-components see the parent's `data-testid`.
  return (
    <Tooltip disabled={!isTruncated}>
      <TooltipTrigger asChild>
        <div
          {...rest}
          data-testid={testId}
          data-slot='parameter-path'
          data-truncated={isTruncated || undefined}
          ref={ref}
          onCopy={handleCopy}
          className={cn('relative flex items-center min-w-0', className)}
        >
          <TestIdProvider value={testId}>
            {visibleRow}
            {measurementRow}
          </TestIdProvider>
        </div>
      </TooltipTrigger>
      <TooltipContent>{buildFullPathLabel(method, segments, encoding)}</TooltipContent>
    </Tooltip>
  );
};

ParameterPath.displayName = 'ParameterPath';
