import type { FC, HTMLAttributes, MouseEvent as ReactMouseEvent } from 'react';
import { useCallback, useRef, useState } from 'react';
import { cn } from '../../../../utils/cn';
import { chipVariants } from './classes';
import { useEditingContext } from './EditingContext';
import { QueryBarRemoveButton } from './QueryBarRemoveButton';
import { Segment } from './Segment';

export type ChipSegment = 'attribute' | 'operator' | 'value';

export interface QueryBarChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  chipId?: string;
  attribute: string;
  operator?: string;
  value?: string;
  error?: boolean;
  building?: boolean;
  onRemove?: () => void;
  onSegmentClick?: (segment: ChipSegment, anchorRect: DOMRect) => void;
}

export const QueryBarChip: FC<QueryBarChipProps> = ({
  chipId,
  attribute,
  operator,
  value,
  error = false,
  building = false,
  onRemove,
  onSegmentClick,
  className,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const interactive = !building;
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
      className={cn(chipVariants({ error, interactive }), 'max-w-[600px]', className)}
      data-slot='query-bar-chip'
      onMouseEnter={interactive ? () => setIsHovered(true) : undefined}
      onMouseLeave={interactive ? () => setIsHovered(false) : undefined}
      {...props}
    >
      <Segment
        variant='attribute'
        className='shrink-0'
        onClick={interactive ? e => handleSegmentClick('attribute', e) : undefined}
        {...segmentEditProps('attribute')}
      >
        {attribute}
      </Segment>
      {operator && (
        <Segment
          variant='operator'
          className='shrink-0'
          onClick={interactive ? e => handleSegmentClick('operator', e) : undefined}
          {...segmentEditProps('operator')}
        >
          {operator}
        </Segment>
      )}
      {value && (
        <Segment
          variant='value'
          className='min-w-0 max-w-[400px]'
          onClick={interactive ? e => handleSegmentClick('value', e) : undefined}
          {...segmentEditProps('value')}
        >
          {value}
        </Segment>
      )}

      {isHovered && onRemove && <QueryBarRemoveButton error={error} onRemove={onRemove} />}
    </div>
  );
};

QueryBarChip.displayName = 'QueryBarChip';
