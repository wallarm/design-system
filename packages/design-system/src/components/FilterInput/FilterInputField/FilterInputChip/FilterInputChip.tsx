import type { FC, HTMLAttributes, MouseEvent as ReactMouseEvent, Ref } from 'react';
import { useCallback, useRef } from 'react';
import { cn } from '../../../../utils/cn';
import type { ChipErrorSegment } from '../../types';
import { ChipSearchInput } from './ChipSearchInput';
import { chipVariants } from './classes';
import { useEditingContext } from './context/EditingContext';
import { FilterInputRemoveButton } from './FilterInputRemoveButton';
import { Segment } from './Segment';
import { SEGMENT_VARIANT, type SegmentVariant } from './segmentVariant';

export type ChipSegment = SegmentVariant;

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
  const interactive = !disabled;
  const hasError = !!error;
  const internalRef = useRef<HTMLDivElement>(null);

  const editing = useEditingContext();
  // A building chip has no chipId; inline-edit on it is signalled by editing
  // state where editingChipId is null but a segment is set. For committed
  // chips, match on chipId as before.
  const isEditingThisChip =
    editing != null &&
    editing.editingSegment != null &&
    (building ? editing.editingChipId == null : chipId != null && editing.editingChipId === chipId);
  const activeSegment = isEditingThisChip ? editing.editingSegment : null;

  const handleSegmentClick = useCallback(
    (segment: ChipSegment, e: ReactMouseEvent) => {
      if (!onSegmentClick) return;
      if (activeSegment === segment) return;
      e.stopPropagation();
      const anchorEl =
        segment === SEGMENT_VARIANT.attribute
          ? internalRef.current
          : (e.currentTarget as HTMLElement);
      if (!anchorEl) return;
      onSegmentClick(segment, anchorEl.getBoundingClientRect());
    },
    [onSegmentClick, activeSegment],
  );

  /**
   * Suppress focus change on mousedown so clicking a segment doesn't drop
   * focus to <body>. For a *building* chip that's load-bearing: a body-focus
   * blur on FilterInput fires `commitBuildingOnBlur`, which would persist the
   * in-progress chip as an errored condition before our click handler can
   * enter inline-edit mode. The inline-edit input is focused programmatically
   * after re-render via useFocusManagement's double-rAF effect.
   */
  const handleSegmentMouseDown = useCallback((e: ReactMouseEvent) => {
    e.preventDefault();
  }, []);

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
        chipVariants({ error: hasError, interactive, disabled, building }),
        'max-w-[320px]',
        className,
      )}
      data-slot='filter-input-condition-chip'
      {...props}
    >
      <Segment
        variant={SEGMENT_VARIANT.attribute}
        className='shrink-0'
        error={error === true || error === SEGMENT_VARIANT.attribute}
        onClick={interactive ? e => handleSegmentClick(SEGMENT_VARIANT.attribute, e) : undefined}
        onMouseDown={interactive && building ? handleSegmentMouseDown : undefined}
        {...segmentEditProps(SEGMENT_VARIANT.attribute)}
      >
        {attribute}
      </Segment>
      {(operator || activeSegment === SEGMENT_VARIANT.operator) && (
        <Segment
          variant={SEGMENT_VARIANT.operator}
          className='shrink-0'
          onClick={interactive ? e => handleSegmentClick(SEGMENT_VARIANT.operator, e) : undefined}
          onMouseDown={interactive && building ? handleSegmentMouseDown : undefined}
          {...segmentEditProps(SEGMENT_VARIANT.operator)}
        >
          {operator ?? ''}
        </Segment>
      )}
      {(value || activeSegment === SEGMENT_VARIANT.value) && (
        <Segment
          variant={SEGMENT_VARIANT.value}
          className='min-w-0'
          error={
            activeSegment !== SEGMENT_VARIANT.value &&
            (error === true || error === SEGMENT_VARIANT.value)
          }
          valueParts={valueParts}
          valueSeparator={valueSeparator}
          errorValueIndices={errorValueIndices}
          onClick={interactive ? e => handleSegmentClick(SEGMENT_VARIANT.value, e) : undefined}
          onMouseDown={interactive && building ? handleSegmentMouseDown : undefined}
          {...segmentEditProps(SEGMENT_VARIANT.value)}
        >
          {value ?? ''}
        </Segment>
      )}

      {/* While a building segment is in inline-edit, hide the trailing search
          input — focus and typing live in the segment input instead. */}
      {building && !isEditingThisChip && <ChipSearchInput />}

      {onRemove && !disabled && <FilterInputRemoveButton error={hasError} onRemove={onRemove} />}
    </div>
  );
};

FilterInputChip.displayName = 'FilterInputChip';
