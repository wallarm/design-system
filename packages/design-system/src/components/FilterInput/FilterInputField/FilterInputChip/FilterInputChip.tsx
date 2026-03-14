import type { FC, HTMLAttributes, MouseEvent as ReactMouseEvent } from 'react';
import { useCallback, useRef } from 'react';
import { cn } from '../../../../utils/cn';
import type { ChipErrorSegment } from '../../types';
import { chipVariants } from './classes';
import { useEditingContext } from './EditingContext';
import { FilterInputRemoveButton } from './FilterInputRemoveButton';
import { OperatorSegment } from './OperatorSegment';
import { Segment } from './Segment';
import { ValueSegment } from './ValueSegment';

export type ChipSegment = 'attribute' | 'operator' | 'value';

export interface FilterInputChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  chipId?: string;
  attribute: string;
  operator?: string;
  value?: string;
  error?: ChipErrorSegment;
  valueParts?: string[];
  valueSeparator?: string;
  errorValueIndices?: number[];
  building?: boolean;
  onRemove?: () => void;
  onSegmentClick?: (segment: ChipSegment, anchorRect: DOMRect) => void;
}

export const FilterInputChip: FC<FilterInputChipProps> = ({
  chipId,
  attribute,
  operator,
  value,
  error = false,
  valueParts,
  valueSeparator,
  errorValueIndices,
  building = false,
  onRemove,
  onSegmentClick,
  className,
  ...props
}) => {
  const interactive = !building;
  const hasError = !!error;
  const chipRef = useRef<HTMLDivElement>(null);

  const editing = useEditingContext();
  const isEditingThisChip = editing != null && chipId != null && editing.editingChipId === chipId;
  const activeSegment = isEditingThisChip ? editing.editingSegment : null;

  const handleSegmentClick = useCallback(
    (segment: ChipSegment, e: ReactMouseEvent) => {
      if (!onSegmentClick) return;
      // Don't re-trigger when already editing this segment
      if (activeSegment === segment) return;
      e.stopPropagation();
      // For attribute clicks, use the whole chip as anchor; otherwise use the clicked segment
      const anchorEl = segment === 'attribute' ? chipRef.current : (e.currentTarget as HTMLElement);
      if (!anchorEl) return;
      onSegmentClick(segment, anchorEl.getBoundingClientRect());
    },
    [onSegmentClick, activeSegment],
  );

  const segmentEditProps = (segment: ChipSegment) =>
    isEditingThisChip && editing.editingSegment === segment
      ? {
          editing: true as const,
          editText: editing.segmentFilterText,
          onEditChange: editing.onSegmentFilterChange,
          onEditKeyDown: editing.onSegmentEditKeyDown,
          onEditBlur: editing.onSegmentEditBlur,
        }
      : {};

  return (
    <div
      ref={chipRef}
      className={cn(chipVariants({ error: hasError, interactive }), 'max-w-[600px]', className)}
      data-slot='filter-input-condition-chip'
      {...props}
    >
      <Segment
        variant='attribute'
        className='shrink-0'
        error={error === true || error === 'attribute'}
        onClick={interactive ? e => handleSegmentClick('attribute', e) : undefined}
        {...segmentEditProps('attribute')}
      >
        {attribute}
      </Segment>
      {operator && (
        <OperatorSegment
          className='shrink-0'
          onClick={interactive ? e => handleSegmentClick('operator', e) : undefined}
        >
          {operator}
        </OperatorSegment>
      )}
      {value && (
        <ValueSegment
          className='min-w-0 max-w-[400px]'
          error={activeSegment !== 'value' && (error === true || error === 'value')}
          valueParts={valueParts}
          valueSeparator={valueSeparator}
          errorValueIndices={errorValueIndices}
          onClick={interactive ? e => handleSegmentClick('value', e) : undefined}
          {...segmentEditProps('value')}
        >
          {value}
        </ValueSegment>
      )}

      {onRemove && <FilterInputRemoveButton error={hasError} onRemove={onRemove} />}
    </div>
  );
};

FilterInputChip.displayName = 'FilterInputChip';
