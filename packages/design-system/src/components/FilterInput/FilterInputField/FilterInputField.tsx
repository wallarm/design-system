import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';
import { inputVariants } from '../../Input/classes';
import { ScrollArea, ScrollAreaScrollbar, ScrollAreaViewport } from '../../ScrollArea';
import { useFilterInputContext } from '../FilterInputContext';
import { ChipsWithGaps, TrailingGap } from './ChipsWithGaps';
import {
  ACTIONS_PADDING,
  COLLAPSED_MAX_HEIGHT,
  filterInputContainerVariants,
  filterInputInnerVariants,
} from './classes';
import { EditingProvider } from './FilterInputChip/context/EditingContext';
import { FilterInputChip } from './FilterInputChip/FilterInputChip';
import { FilterInputFieldActions } from './FilterInputFieldActions';
import { FilterInputSearch } from './FilterInputSearch';
import { useChipsSplitting } from './hooks/useChipsSplitting';
import { useExpandCollapse } from './hooks/useExpandCollapse';
import { useSegmentEditKeyboard } from './hooks/useSegmentEditKeyboard';

type FilterInputFieldProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export const FilterInputField: FC<FilterInputFieldProps> = ({ className, ...props }) => {
  const {
    chips,
    buildingChipData,
    buildingChipRef,
    insertIndex,
    insertAfterConnector,
    error,
    onAreaClick,
    onGapClick,
    onChipClick,
    onBuildingChipClick,
    onConnectorChange,
    onChipRemove,
    editingChipId,
    editingSegment,
    segmentFilterText,
    onSegmentFilterChange,
    onCancelSegmentEdit,
    onCustomValueCommit,
    onCustomAttributeCommit,
    onCustomOperatorCommit,
    onSwitchEditSegment,
    onRemoveEditingChip,
    menuRef,
  } = useFilterInputContext();

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

  const { handleSegmentEditKeyDown, handleSegmentEditBlur } = useSegmentEditKeyboard({
    editingChipId,
    editingSegment,
    segmentFilterText,
    chips,
    buildingChipData,
    menuRef,
    onCancelSegmentEdit,
    onCustomValueCommit,
    onCustomAttributeCommit,
    onCustomOperatorCommit,
    onSwitchEditSegment,
    onRemoveEditingChip,
  });

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
          filterInputContainerVariants({ error, multiRow }),
          className,
        )}
        data-slot='filter-input'
        // biome-ignore lint/a11y/useKeyWithClickEvents: native input semantics — keyboard reaches the inner combobox; this delegates pointer clicks on the wrapper to the area handler so multi-select commits trigger when users click the field's border/scroll-area.
        onClick={e => {
          // Wrapper-level click delegation for the gaps the inner content
          // doesn't cover — the field's border, the ScrollArea root, the
          // scrollbar strip. The inner-content onClick handles its own area;
          // skip here to avoid double-firing onAreaClick.
          const t = e.target as HTMLElement;
          if (t.closest('[data-filter-input-inner]')) return;
          if (
            t.closest(
              '[data-slot^="segment-"], button, input, [data-slot="filter-input-chip-delete"]',
            )
          )
            return;
          onAreaClick();
        }}
        {...props}
      >
        <ScrollArea
          className='h-auto flex-1 min-w-0'
          style={{ maxHeight: !isExpanded ? COLLAPSED_MAX_HEIGHT : undefined }}
        >
          {/* Inline style overrides h-full in ScrollAreaViewport (className is stripped). */}
          <ScrollAreaViewport style={{ height: 'auto', maxHeight: 'inherit' }}>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div
              ref={innerRef}
              data-filter-input-inner=''
              className={cn(filterInputInnerVariants({ hasContent }))}
              style={{ paddingRight: hasContent ? ACTIONS_PADDING : undefined }}
              onClick={e => {
                // Area click: the empty area itself, or the building chip's
                // padding/border (anywhere the user might aim "outside the
                // menu" while still inside the field). Skip interactive
                // children — segments, gap buttons, inline input, action
                // buttons — and committed chips, which the drag-selection +
                // segment-click handlers own.
                const t = e.target as HTMLElement;
                if (t === e.currentTarget) {
                  onAreaClick();
                  return;
                }
                if (
                  t.closest(
                    '[data-slot^="segment-"], button, input, [data-slot="filter-input-chip-delete"]',
                  )
                )
                  return;
                if (t.closest('[data-building]')) onAreaClick();
              }}
            >
              <ChipsWithGaps
                chips={chipsBefore}
                hideTrailingGap={hideTrailingGap}
                {...chipsGapProps}
              />

              {buildingChipData ? (
                <FilterInputChip
                  ref={buildingChipRef}
                  building
                  attribute={buildingChipData.attribute}
                  operator={buildingChipData.operator}
                  value={buildingChipData.value}
                  pair={buildingChipData.pair}
                  onSegmentClick={onBuildingChipClick}
                  className='mx-4'
                />
              ) : (
                <FilterInputSearch hasContent={hasContent} />
              )}

              <ChipsWithGaps
                chips={chipsAfter}
                hideLeadingGap={hideLeadingGap}
                {...chipsGapProps}
              />

              {chipsAfter.length > 0 && <TrailingGap chips={chipsAfter} onGapClick={onGapClick} />}
            </div>
          </ScrollAreaViewport>
          {!isExpanded && <ScrollAreaScrollbar orientation='vertical' />}
        </ScrollArea>

        <FilterInputFieldActions
          isExpanded={isExpanded}
          isOverflowing={isOverflowing}
          onToggleExpand={toggleExpand}
        />
      </div>
    </EditingProvider>
  );
};

FilterInputField.displayName = 'FilterInputField';
