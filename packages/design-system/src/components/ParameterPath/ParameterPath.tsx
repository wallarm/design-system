import type { ClipboardEvent, FC, KeyboardEvent } from 'react';
import { useCallback, useRef } from 'react';
import { useControlled } from '../../hooks';
import { cn } from '../../utils/cn';
import { hasTextSelection } from '../../utils/hasTextSelection';
import { TestIdProvider } from '../../utils/testId';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { buildFullPathLabel } from './buildFullPathLabel';
import { EXPAND_KEYS } from './constants';
import { formatAsFilter } from './formatAsFilter';
import { ParameterPathRow } from './ParameterPathRow';
import type { ParameterPathProps } from './types';
import { useParameterPathTruncation } from './useParameterPathTruncation';

export const ParameterPath: FC<ParameterPathProps> = ({
  ref,
  method,
  segments,
  encoding,
  attack = false,
  expandable = false,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  copyFormat = formatAsFilter,
  className,
  'data-testid': testId,
  ...rest
}) => {
  const [expandedState, setExpandedUncontrolled] = useControlled({
    controlled: expanded,
    default: defaultExpanded,
  });

  const setExpanded = useCallback(
    (next: boolean) => {
      setExpandedUncontrolled(next);
      onExpandedChange?.(next);
    },
    [setExpandedUncontrolled, onExpandedChange],
  );

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

  const collapsible = isTruncated && segments.length > 2;
  // `expandable` gates the click affordance; `expandedState` is the open/closed
  // state. A path that fits is never truncated, so expanding it is a no-op.
  const isExpanded = Boolean(expandedState) && collapsible;
  const interactive = expandable && collapsible;
  const indices = collapsible && !isExpanded ? visibleSegmentIndices : null;

  const toggleExpanded = useCallback(() => {
    // A click that ends a text selection should copy, not toggle.
    if (hasTextSelection()) return;
    setExpanded(!isExpanded);
  }, [isExpanded, setExpanded]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (EXPAND_KEYS.includes(event.key)) {
        event.preventDefault();
        setExpanded(!isExpanded);
      }
    },
    [isExpanded, setExpanded],
  );

  // Tooltip is mounted unconditionally and toggled via `disabled` — conditional
  // wrapping would remount the visible row and tear down the ResizeObserver,
  // freezing truncation. The inner TestIdProvider re-establishes our testId
  // because Tooltip's own provider would otherwise clobber it.
  return (
    <Tooltip disabled={!isTruncated || isExpanded}>
      <TooltipTrigger asChild>
        <div
          {...rest}
          data-testid={testId}
          data-slot='parameter-path'
          data-truncated={isTruncated || undefined}
          data-expanded={isExpanded || undefined}
          ref={ref}
          onCopy={handleCopy}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          aria-expanded={interactive ? isExpanded : undefined}
          onClick={interactive ? toggleExpanded : undefined}
          onKeyDown={interactive ? handleKeyDown : undefined}
          className={cn(
            'relative flex items-center min-w-0',
            interactive && 'cursor-pointer',
            className,
          )}
        >
          <TestIdProvider value={testId}>
            <ParameterPathRow
              ref={containerRef}
              forMeasurement={false}
              isExpanded={isExpanded}
              indices={indices}
              method={method}
              segments={segments}
              encoding={encoding}
              attack={attack}
            />
            <ParameterPathRow
              ref={measurementRef}
              forMeasurement
              indices={null}
              method={method}
              segments={segments}
              encoding={encoding}
              attack={attack}
            />
          </TestIdProvider>
        </div>
      </TooltipTrigger>
      <TooltipContent>{buildFullPathLabel(method, segments, encoding)}</TooltipContent>
    </Tooltip>
  );
};

ParameterPath.displayName = 'ParameterPath';
