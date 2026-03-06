import type { FC, FocusEvent, HTMLAttributes, KeyboardEvent } from 'react';
import { useCallback, useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { inputVariants } from '../../Input/classes';
import { findChipSplitIndex } from '../lib';
import { useQueryBarContext } from '../QueryBarContext';
import { ChipsWithGaps, TrailingGap } from './ChipsWithGaps';
import { queryBarContainerVariants, queryBarInnerVariants, queryBarInputVariants } from './classes';
import { EditingProvider } from './QueryBarChip/EditingContext';
import { QueryBarChip } from './QueryBarChip/QueryBarChip';
import { QueryBarInputActions } from './QueryBarInputActions';

type QueryBarInputProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export const QueryBarInput: FC<QueryBarInputProps> = ({ className, ...props }) => {
  const {
    chips,
    buildingChipData,
    buildingChipRef,
    inputText,
    inputRef,
    placeholder,
    error,
    menuOpen,
    insertIndex,
    insertAfterConnector,
    onInputChange,
    onInputKeyDown,
    onInputClick,
    onGapClick,
    onChipClick,
    onConnectorChange,
    onChipRemove,
    // Inline segment editing
    editingChipId,
    editingSegment,
    segmentFilterText,
    onSegmentFilterChange,
    onCancelSegmentEdit,
    onCustomValueCommit,
    menuRef,
  } = useQueryBarContext();

  const hasContent = chips.length > 0 || buildingChipData != null;

  const chipSplitIndex = useMemo(
    () => findChipSplitIndex(chips, insertIndex, insertAfterConnector),
    [chips, insertIndex, insertAfterConnector],
  );

  const chipsBefore = useMemo(() => chips.slice(0, chipSplitIndex), [chips, chipSplitIndex]);
  const chipsAfter = useMemo(() => chips.slice(chipSplitIndex), [chips, chipSplitIndex]);

  // Hide the gap that sits right next to the input cursor
  const lastBefore = chipsBefore[chipsBefore.length - 1];
  const firstAfter = chipsAfter[0];
  const hideTrailingGap = lastBefore?.variant === 'and' || lastBefore?.variant === 'or';
  const hideLeadingGap = firstAfter?.variant === 'and' || firstAfter?.variant === 'or';

  // ── Segment editing handlers ──────────────────────────────

  const handleSegmentEditKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancelSegmentEdit();
        return;
      }
      // Enter on value segment → commit custom value
      // Only fires if useKeyboardNav (capture phase) didn't preventDefault (i.e. no active menu item)
      if (e.key === 'Enter' && editingSegment === 'value' && !e.defaultPrevented) {
        e.preventDefault();
        onCustomValueCommit(segmentFilterText);
        return;
      }
      // ArrowDown → move focus to the open menu
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        menuRef.current?.focus();
      }
    },
    [onCancelSegmentEdit, editingSegment, segmentFilterText, onCustomValueCommit, menuRef],
  );

  const handleSegmentEditBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const related = e.relatedTarget as HTMLElement | null;
      // Don't cancel if focus moves to a dropdown menu or date picker
      if (
        related?.closest('[role="menu"]') ||
        related?.closest('[data-scope="menu"]') ||
        related?.closest('[data-scope="date-picker"]') ||
        related?.closest('[data-part="content"]')
      )
        return;
      onCancelSegmentEdit();
    },
    [onCancelSegmentEdit],
  );

  return (
    <EditingProvider
      editingChipId={editingChipId}
      editingSegment={editingSegment}
      segmentFilterText={segmentFilterText}
      onSegmentFilterChange={onSegmentFilterChange}
      onSegmentEditKeyDown={handleSegmentEditKeyDown}
      onSegmentEditBlur={handleSegmentEditBlur}
    >
      <div
        className={cn(inputVariants({ error }), queryBarContainerVariants({ error }), className)}
        role='combobox'
        aria-expanded={menuOpen}
        aria-invalid={error}
        data-slot='query-bar'
        {...props}
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className={queryBarInnerVariants({ hasContent })}
          onClick={e => {
            if (e.target === e.currentTarget) {
              onInputClick();
            }
          }}
        >
          <ChipsWithGaps
            chips={chipsBefore}
            hideTrailingGap={hideTrailingGap}
            onChipClick={onChipClick}
            onConnectorChange={onConnectorChange}
            onChipRemove={onChipRemove}
            onGapClick={onGapClick}
          />

          {buildingChipData && (
            <div ref={buildingChipRef} className={cn('min-w-0', hasContent && 'ml-8')}>
              <QueryBarChip
                building
                attribute={buildingChipData.attribute ?? ''}
                operator={buildingChipData.operator}
                value={buildingChipData.value}
              />
            </div>
          )}
          <input
            ref={inputRef}
            type='text'
            value={inputText}
            onChange={onInputChange}
            onKeyDown={onInputKeyDown}
            onClick={onInputClick}
            placeholder={hasContent ? '' : placeholder}
            style={hasContent ? { width: `${Math.max(4, inputText.length * 8)}px` } : undefined}
            className={queryBarInputVariants({ hasContent })}
          />

          <ChipsWithGaps
            chips={chipsAfter}
            hideLeadingGap={hideLeadingGap}
            onChipClick={onChipClick}
            onConnectorChange={onConnectorChange}
            onChipRemove={onChipRemove}
            onGapClick={onGapClick}
          />

          {chipsAfter.length > 0 && <TrailingGap chips={chipsAfter} onGapClick={onGapClick} />}
        </div>

        <QueryBarInputActions />
      </div>
    </EditingProvider>
  );
};

QueryBarInput.displayName = 'QueryBarInput';
