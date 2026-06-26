import type { FC, HTMLAttributes, MouseEvent as ReactMouseEvent, Ref } from 'react';
import { useCallback, useRef } from 'react';
import { cn } from '../../../../utils/cn';
import type { ChipErrorSegment, FilterInputChipData } from '../../types';
import { ChipSearchInput } from './ChipSearchInput';
import { chipVariants } from './classes';
import { useEditingContext } from './context/EditingContext';
import { FilterInputRemoveButton } from './FilterInputRemoveButton';
import { PairSeparator } from './PairSeparator';
import { Segment } from './Segment';
import { SEGMENT_VARIANT, type SegmentVariant } from './segmentVariant';

export type ChipSegment = SegmentVariant;

/** Editable segments of the paired (second) triplet. The paired attribute is fixed. */
export type PairSegment = Extract<SegmentVariant, 'operator' | 'value'>;

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
  /** Second paired triplet (two-step fields). The paired attribute is fixed. */
  pair?: FilterInputChipData['pair'];
  onRemove?: () => void;
  onSegmentClick?: (segment: ChipSegment, anchorEl: HTMLElement) => void;
  /** Click on an editable paired segment (operator/value of the second triplet). */
  onPairSegmentClick?: (segment: PairSegment, anchorEl: HTMLElement) => void;
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
  pair,
  onRemove,
  onSegmentClick,
  onPairSegmentClick,
  className,
  ...props
}) => {
  const interactive = !disabled;
  const internalRef = useRef<HTMLDivElement>(null);

  const editing = useEditingContext();
  // Building chip has no chipId; inline-edit signal is editingChipId null
  // + segment set. Committed chips match on chipId.
  const isEditingThisChip =
    editing != null &&
    editing.editingSegment != null &&
    (building ? editing.editingChipId == null : chipId != null && editing.editingChipId === chipId);
  const activeSegment = isEditingThisChip ? editing.editingSegment : null;

  // While the chip is actively edited the user is fixing it, so it must not read
  // as errored; an incomplete/invalid committed chip turns red only once it is
  // no longer in the editable state (AS-1179). The whole chip reads as errored
  // when EITHER triplet has an error — a paired chip missing its second value
  // stays red even though the base triplet is valid (base segments are reddened
  // separately, per-segment).
  const effectiveError = isEditingThisChip ? false : error;
  const effectivePairError = isEditingThisChip ? undefined : pair?.error;
  const hasError = !!effectiveError || !!effectivePairError;

  const handleSegmentClick = useCallback(
    (segment: ChipSegment, e: ReactMouseEvent) => {
      if (!onSegmentClick) return;
      if (activeSegment === segment) return;
      e.stopPropagation();
      // Anchor to the chip, not the segment: segments can be unmounted
      // mid-cascade (Backspace clears value/operator), leaving the floating
      // menu pinned to a stale rect. The chip stays mounted throughout edit.
      const anchorEl = internalRef.current;
      if (!anchorEl) return;
      onSegmentClick(segment, anchorEl);
    },
    [onSegmentClick, activeSegment],
  );

  const handlePairSegmentClick = useCallback(
    (segment: PairSegment, e: ReactMouseEvent) => {
      if (!onPairSegmentClick) return;
      e.stopPropagation();
      const anchorEl = internalRef.current;
      if (!anchorEl) return;
      onPairSegmentClick(segment, anchorEl);
    },
    [onPairSegmentClick],
  );

  /**
   * Suppress focus drop to <body> on segment mousedown. Load-bearing for
   * building chips: body-blur fires commitBuildingOnBlur and would persist
   * the chip as errored before inline-edit starts. The inline-edit input is
   * focused after re-render by useFocusManagement's double-rAF effect.
   */
  const handleSegmentMouseDown = useCallback((e: ReactMouseEvent) => {
    e.preventDefault();
  }, []);

  // Inline-edit props apply to the base triplet (side 0) or the paired triplet
  // (side 1) — never both at once, so they share the segment input refs.
  const editingSide = editing?.editingSide ?? 0;
  const segmentEditProps = (segment: ChipSegment, side: 0 | 1 = 0) =>
    isEditingThisChip && editing.editingSegment === segment && editingSide === side
      ? {
          editing: true as const,
          editText: editing.segmentFilterText,
          onEditChange: editing.onSegmentFilterChange,
          onEditKeyDown: editing.onSegmentEditKeyDown,
          onEditBlur: editing.onSegmentEditBlur,
        }
      : {};
  // Active segment on the base triplet (side 0) only — gates the base operator/
  // value segments' "render while empty during edit" behavior.
  const baseActiveSegment = editingSide === 0 ? activeSegment : null;
  const pairActiveSegment = editingSide === 1 ? activeSegment : null;

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
        // Paired chips carry two value triplets, so they get more room (380 vs
        // 320) and both values share it — each is capped so a long base value
        // can't eat the whole chip and hide the paired value (AS-1179).
        pair ? 'max-w-[380px]' : 'max-w-[320px]',
        className,
      )}
      data-slot='filter-input-condition-chip'
      {...(building && { 'data-building': '' })}
      {...props}
    >
      <Segment
        variant={SEGMENT_VARIANT.attribute}
        className='shrink-0'
        error={effectiveError === true || effectiveError === SEGMENT_VARIANT.attribute}
        onClick={interactive ? e => handleSegmentClick(SEGMENT_VARIANT.attribute, e) : undefined}
        onMouseDown={interactive && building ? handleSegmentMouseDown : undefined}
        {...segmentEditProps(SEGMENT_VARIANT.attribute)}
      >
        {attribute}
      </Segment>
      {(operator || baseActiveSegment === SEGMENT_VARIANT.operator) && (
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
      {(value || baseActiveSegment === SEGMENT_VARIANT.value) && (
        <Segment
          variant={SEGMENT_VARIANT.value}
          // In a paired chip the base value is the "key": keep it fully readable
          // when short, but cap it so a long key can't hog the row and push the
          // paired value out — the capped key and the (shrinking) paired value
          // then truncate to roughly equal widths. Standalone chips truncate
          // against the chip width as usual.
          className={pair ? 'max-w-[90px] shrink-0' : 'min-w-0'}
          error={
            baseActiveSegment !== SEGMENT_VARIANT.value &&
            (effectiveError === true || effectiveError === SEGMENT_VARIANT.value)
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

      {pair && (
        <>
          <PairSeparator />
          {/* Paired attribute is fixed by config — non-interactive. */}
          <Segment variant={SEGMENT_VARIANT.attribute} className='shrink-0'>
            {pair.attribute}
          </Segment>
          {(pair.operator || pairActiveSegment === SEGMENT_VARIANT.operator) && (
            <Segment
              variant={SEGMENT_VARIANT.operator}
              className='shrink-0'
              onClick={interactive ? e => handlePairSegmentClick('operator', e) : undefined}
              {...segmentEditProps(SEGMENT_VARIANT.operator, 1)}
            >
              {pair.operator ?? ''}
            </Segment>
          )}
          {(pair.value != null || pairActiveSegment === SEGMENT_VARIANT.value) && (
            <Segment
              variant={SEGMENT_VARIANT.value}
              className='min-w-0'
              error={
                pairActiveSegment !== SEGMENT_VARIANT.value &&
                (effectivePairError === true || effectivePairError === SEGMENT_VARIANT.value)
              }
              onClick={interactive ? e => handlePairSegmentClick('value', e) : undefined}
              {...segmentEditProps(SEGMENT_VARIANT.value, 1)}
            >
              {pair.value ?? ''}
            </Segment>
          )}
        </>
      )}

      {/* Hide trailing search input during inline-edit — focus is in the segment. */}
      {building && !isEditingThisChip && <ChipSearchInput />}

      {onRemove && !disabled && <FilterInputRemoveButton error={hasError} onRemove={onRemove} />}
    </div>
  );
};

FilterInputChip.displayName = 'FilterInputChip';
