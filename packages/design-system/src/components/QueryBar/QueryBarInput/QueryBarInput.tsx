import type { FC, FocusEvent, HTMLAttributes, KeyboardEvent } from 'react';
import { useCallback, useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { inputVariants } from '../../Input/classes';
import { findChipSplitIndex, isMenuRelated } from '../lib';
import { useQueryBarContext } from '../QueryBarContext';
import { ChipsWithGaps, TrailingGap } from './ChipsWithGaps';
import { queryBarContainerVariants, queryBarInnerVariants } from './classes';
import { EditingProvider } from './QueryBarChip/EditingContext';
import { QueryBarChip } from './QueryBarChip/QueryBarChip';
import { QueryBarFilterInput } from './QueryBarFilterInput';
import { QueryBarInputActions } from './QueryBarInputActions';

type QueryBarInputProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export const QueryBarInput: FC<QueryBarInputProps> = ({ className, ...props }) => {
  const {
    chips,
    buildingChipData,
    buildingChipRef,
    insertIndex,
    insertAfterConnector,
    error,
    onInputClick,
    onGapClick,
    onChipClick,
    onConnectorChange,
    onChipRemove,
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

  const lastBefore = chipsBefore[chipsBefore.length - 1];
  const firstAfter = chipsAfter[0];
  const hideTrailingGap = lastBefore?.variant === 'and' || lastBefore?.variant === 'or';
  const hideLeadingGap = firstAfter?.variant === 'and' || firstAfter?.variant === 'or';

  const chipsGapProps = {
    onChipClick,
    onConnectorChange,
    onChipRemove,
    onGapClick,
  } as const;

  const handleSegmentEditKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancelSegmentEdit();
        return;
      }
      if (e.key === 'Enter' && editingSegment === 'value' && !e.defaultPrevented) {
        e.preventDefault();
        onCustomValueCommit(segmentFilterText);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        menuRef.current?.focus();
      }
    },
    [onCancelSegmentEdit, editingSegment, segmentFilterText, onCustomValueCommit, menuRef],
  );

  const handleSegmentEditBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      if (!isMenuRelated(e.relatedTarget as HTMLElement | null)) onCancelSegmentEdit();
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
        data-slot='query-bar'
        {...props}
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className={queryBarInnerVariants({ hasContent })}
          onClick={e => {
            if (e.target === e.currentTarget) onInputClick();
          }}
        >
          <ChipsWithGaps chips={chipsBefore} hideTrailingGap={hideTrailingGap} {...chipsGapProps} />

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

          <QueryBarFilterInput hasContent={hasContent} />

          <ChipsWithGaps chips={chipsAfter} hideLeadingGap={hideLeadingGap} {...chipsGapProps} />

          {chipsAfter.length > 0 && <TrailingGap chips={chipsAfter} onGapClick={onGapClick} />}
        </div>

        <QueryBarInputActions />
      </div>
    </EditingProvider>
  );
};

QueryBarInput.displayName = 'QueryBarInput';
