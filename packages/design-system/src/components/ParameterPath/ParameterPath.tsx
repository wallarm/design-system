import type { ClipboardEvent, FC, ReactNode } from 'react';
import { useCallback, useRef } from 'react';
import { cn } from '../../utils/cn';
import { TestIdProvider } from '../../utils/testId';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { formatAsFilter } from './formatAsFilter';
import { ParameterPathEllipsis } from './ParameterPathEllipsis';
import { ParameterPathEncoding } from './ParameterPathEncoding';
import { ParameterPathJoint } from './ParameterPathJoint';
import { ParameterPathMethod } from './ParameterPathMethod';
import { ParameterPathSegment } from './ParameterPathSegment';
import type { ParameterPathProps } from './types';
import { useParameterPathTruncation } from './useParameterPathTruncation';

const buildFullPathLabel = (
  method: ParameterPathProps['method'],
  segments: string[],
  encoding?: string,
): string => {
  const parts: string[] = [];
  if (method) parts.push(method);
  parts.push(...segments);
  if (encoding) parts.push(encoding);
  return parts.join(' › ');
};

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

    if (method) {
      items.push(
        <span key='method' data-measure={forMeasurement ? 'method' : undefined}>
          <ParameterPathMethod method={method} />
        </span>,
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
          <span key={`j-${segIndex}-pre`} data-measure={forMeasurement ? 'joint' : undefined}>
            <ParameterPathJoint />
          </span>,
        );
      }

      const isCollapsedBoundary =
        !forMeasurement && indices !== null && position === 0 && visibleIdx.length === 2;

      items.push(
        <span
          key={`s-${segIndex}`}
          data-measure={forMeasurement ? 'segment' : undefined}
          data-testid={!forMeasurement && testId ? `${testId}--segment-${segIndex}` : undefined}
        >
          <ParameterPathSegment
            variant={isLast ? 'highlighted' : 'default'}
            withZap={isLast && attack}
          >
            {value}
          </ParameterPathSegment>
        </span>,
      );

      if (isCollapsedBoundary) {
        items.push(
          <span key='ellipsis-joint-pre'>
            <ParameterPathJoint />
          </span>,
          <span key='ellipsis'>
            <ParameterPathEllipsis />
          </span>,
        );
      }
    });

    if (encoding) {
      items.push(
        <span key='enc-joint' data-measure={forMeasurement ? 'joint' : undefined}>
          <ParameterPathJoint />
        </span>,
        <span key='enc' data-measure={forMeasurement ? 'encoding' : undefined}>
          <ParameterPathEncoding>{encoding}</ParameterPathEncoding>
        </span>,
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

  const measurementRow = (
    <div
      ref={measurementRef}
      data-row='measure'
      aria-hidden='true'
      className='flex items-center gap-0 absolute left-[-9999px] top-0 invisible pointer-events-none'
    >
      {renderRow(true)}
    </div>
  );

  const root = (
    <TestIdProvider value={testId}>
      <div
        {...rest}
        data-testid={testId}
        data-slot='parameter-path'
        data-truncated={isTruncated || undefined}
        ref={ref}
        onCopy={handleCopy}
        className={cn('relative flex items-center min-w-0', className)}
      >
        {visibleRow}
        {measurementRow}
      </div>
    </TestIdProvider>
  );

  if (!isTruncated) return root;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{root}</TooltipTrigger>
      <TooltipContent>{buildFullPathLabel(method, segments, encoding)}</TooltipContent>
    </Tooltip>
  );
};

ParameterPath.displayName = 'ParameterPath';
