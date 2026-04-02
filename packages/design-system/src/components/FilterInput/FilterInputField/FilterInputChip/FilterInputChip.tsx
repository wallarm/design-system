import type { FC, HTMLAttributes, MouseEvent as ReactMouseEvent, Ref } from 'react';
import { useCallback, useRef } from 'react';
import { cn } from '../../../../utils/cn';
import type { ChipErrorSegment } from '../../types';
import { ChipSearchInput } from './ChipSearchInput';
import { chipVariants } from './classes';
import { useEditingContext } from './context/EditingContext';
import { FilterInputRemoveButton } from './FilterInputRemoveButton';
import { Segment } from './Segment';

export type ChipSegment = 'attribute' | 'operator' | 'value';

export interface FilterInputChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: Ref<HTMLDivElement>;
  chipId?: string;
  attribute: string;
  operator?: string;
  value?: string;
  error?: ChipErrorSegment;
  valueParts?: string[];
  valueSeparator?: string;
  errorValueIndices?: number[];
  building?: boolean;
  /** When true, the chip cannot be edited or removed (dimmed appearance) */
  disabled?: boolean;
  onRemove?: () => void;
  onSegmentClick?: (segment: ChipSegment, anchorRect: DOMRect) => void;
}

export const FilterInputChip: FC<FilterInputChipProps> = ({
  ref,
  chipId,
  attribute,
  operator,
  value,
  error = false,
  valueParts,
  valueSeparator,
  errorValueIndices,
  building = false,
  disabled = false,
  onRemove,
  onSegmentClick,
  className,
  ...props
}) => {
  const interactive = !building && !disabled;
  const hasError = !!error;
  const internalRef = useRef<HTMLDivElement>(null);

  const editing = useEditingContext();
  const isEditingThisChip = editing != null && chipId != null && editing.editingChipId === chipId;
  const activeSegment = isEditingThisChip ? editing.editingSegment : null;

  const handleSegmentClick = useCallback(
    (segment: ChipSegment, e: ReactMouseEvent) => {
      if (!onSegmentClick) return;
      if (activeSegment === segment) return;
      e.stopPropagation();
      const anchorEl =
        segment === 'attribute' ? internalRef.current : (e.currentTarget as HTMLElement);
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

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      internalRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  return (
    <div
      ref={setRefs}
      className={cn(
        chipVariants({ error: hasError, interactive, disabled }),
        'max-w-[600px]',
        className,
      )}
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
      {(operator || activeSegment === 'operator') && (
        <Segment
          variant='operator'
          className='shrink-0'
          onClick={interactive ? e => handleSegmentClick('operator', e) : undefined}
          {...segmentEditProps('operator')}
        >
          {operator ?? ''}
        </Segment>
      )}
      {(value || activeSegment === 'value') && (
        <Segment
          variant='value'
          className='shrink-0'
          error={activeSegment !== 'value' && (error === true || error === 'value')}
          valueParts={valueParts}
          valueSeparator={valueSeparator}
          errorValueIndices={errorValueIndices}
          onClick={interactive ? e => handleSegmentClick('value', e) : undefined}
          {...segmentEditProps('value')}
        >
          {value ?? ''}
        </Segment>
      )}

      {building && <ChipSearchInput />}

      {onRemove && !disabled && <FilterInputRemoveButton error={hasError} onRemove={onRemove} />}
    </div>
  );
};

FilterInputChip.displayName = 'FilterInputChip';
