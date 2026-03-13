import type { FC, FocusEvent, HTMLAttributes, KeyboardEvent } from 'react';
import { useCallback } from 'react';
import { cn } from '../../../utils/cn';
import { inputVariants } from '../../Input/classes';
import { isMenuRelated } from '../lib';
import { useQueryBarContext } from '../QueryBarContext';
import { ChipsWithGaps, TrailingGap } from './ChipsWithGaps';
import {
  ACTIONS_PADDING,
  buildingChipWrapperClass,
  COLLAPSED_MAX_HEIGHT,
  queryBarContainerVariants,
  queryBarInnerVariants,
} from './classes';
import { EditingProvider } from './QueryBarChip/EditingContext';
import { QueryBarChip } from './QueryBarChip/QueryBarChip';
import { QueryBarFilterInput } from './QueryBarFilterInput';
import { QueryBarInputActions } from './QueryBarInputActions';
import { useChipsSplitting } from './hooks/useChipsSplitting';
import { useExpandCollapse } from './hooks/useExpandCollapse';

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
    onCustomAttributeCommit,
    menuRef,
  } = useQueryBarContext();

  const hasContent = chips.length > 0 || buildingChipData != null;

  const { isExpanded, isOverflowing, innerRef, toggleExpand, multiRow } = useExpandCollapse();

  const { chipsBefore, chipsAfter, hideTrailingGap, hideLeadingGap } = useChipsSplitting(
    chips,
    insertIndex,
    insertAfterConnector,
  );

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
      if (e.key === 'Enter' && !e.defaultPrevented) {
        if (editingSegment === 'value') {
          e.preventDefault();
          onCustomValueCommit(segmentFilterText);
          return;
        }
        if (editingSegment === 'attribute') {
          e.preventDefault();
          onCustomAttributeCommit(segmentFilterText);
          return;
        }
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        menuRef.current?.focus();
      }
    },
    [
      onCancelSegmentEdit,
      editingSegment,
      segmentFilterText,
      onCustomValueCommit,
      onCustomAttributeCommit,
      menuRef,
    ],
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
        className={cn(
          inputVariants({ error }),
          queryBarContainerVariants({ error, multiRow }),
          className,
        )}
        data-slot='query-bar'
        {...props}
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          ref={innerRef}
          className={cn(
            queryBarInnerVariants({ hasContent }),
            !isExpanded && 'overflow-y-auto',
            'query-bar-scroll',
          )}
          style={{
            maxHeight: !isExpanded ? COLLAPSED_MAX_HEIGHT : undefined,
            paddingRight: hasContent ? ACTIONS_PADDING : undefined,
          }}
          onClick={e => {
            if (e.target === e.currentTarget) onInputClick();
          }}
        >
          <ChipsWithGaps
            chips={chipsBefore}
            hideTrailingGap={hideTrailingGap}
            {...chipsGapProps}
          />

          {buildingChipData ? (
            <div
              ref={buildingChipRef}
              className={cn(buildingChipWrapperClass, hasContent && 'ml-8')}
            >
              <QueryBarChip
                building
                attribute={buildingChipData.attribute ?? ''}
                operator={buildingChipData.operator}
                value={buildingChipData.value}
                className='border-none'
              />
              <QueryBarFilterInput hasContent />
            </div>
          ) : (
            <QueryBarFilterInput hasContent={hasContent} />
          )}

          <ChipsWithGaps
            chips={chipsAfter}
            hideLeadingGap={hideLeadingGap}
            {...chipsGapProps}
          />

          {chipsAfter.length > 0 && (
            <TrailingGap chips={chipsAfter} onGapClick={onGapClick} />
          )}
        </div>

        <QueryBarInputActions
          isExpanded={isExpanded}
          isOverflowing={isOverflowing}
          onToggleExpand={toggleExpand}
        />
      </div>
    </EditingProvider>
  );
};

QueryBarInput.displayName = 'QueryBarInput';
