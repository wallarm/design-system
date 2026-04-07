import { type FC, type ReactNode, useCallback } from 'react';
import { useFilterInputContext } from '../FilterInputContext';
import { CONNECTOR_ID_PATTERN } from '../lib';
import type { FilterInputChipData } from '../types';
import type { ChipSegment } from './FilterInputChip';
import { FilterInputChip } from './FilterInputChip/FilterInputChip';
import { FilterInputConnectorChip } from './FilterInputConnectorChip';
import { InsertionGap } from './InsertionGap';

interface ChipsWithGapsProps {
  chips: FilterInputChipData[];
  hideLeadingGap?: boolean;
  hideTrailingGap?: boolean;
  onChipClick: (chipId: string, segment: ChipSegment, anchorRect: DOMRect) => void;
  onConnectorChange: (chipId: string, value: 'and' | 'or') => void;
  onChipRemove: (chipId: string) => void;
  onGapClick: (conditionIndex: number, afterConnector: boolean) => void;
}

/**
 * Renders chips with InsertionGap components around each connector.
 * Trailing gap is handled separately in the parent to avoid duplicates when chips are split.
 */
export const ChipsWithGaps: FC<ChipsWithGapsProps> = ({
  chips,
  hideLeadingGap,
  hideTrailingGap,
  onChipClick,
  onConnectorChange,
  onChipRemove,
  onGapClick,
}) => {
  const { registerChipRef } = useFilterInputContext();
  const chipRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => registerChipRef(id, el),
    [registerChipRef],
  );

  const elements: ReactNode[] = [];
  let connectorIndex = 0;
  const connectorCount = chips.filter(c => c.variant === 'and' || c.variant === 'or').length;

  for (const chip of chips) {
    const isCondition = chip.variant === 'chip';
    const isConnector = chip.variant === 'and' || chip.variant === 'or';

    if (isCondition) {
      elements.push(
        <div key={chip.id} ref={chipRef(chip.id)} className='shrink-0 cursor-pointer hover:z-10'>
          <FilterInputChip
            chipId={chip.id}
            attribute={chip.attribute ?? ''}
            operator={chip.operator}
            value={chip.value}
            error={chip.error}
            valueParts={chip.valueParts}
            valueSeparator={chip.valueSeparator}
            errorValueIndices={chip.errorValueIndices}
            disabled={chip.disabled}
            onRemove={chip.disabled ? undefined : () => onChipRemove(chip.id)}
            onSegmentClick={
              chip.disabled
                ? undefined
                : (segment, anchorRect) => onChipClick(chip.id, segment, anchorRect)
            }
          />
        </div>,
      );
    } else if (isConnector) {
      const match = chip.id.match(CONNECTOR_ID_PATTERN);
      const condIdx = match ? Number(match[1]) : 0;
      const isFirst = connectorIndex === 0;
      const isLast = connectorIndex === connectorCount - 1;

      if (!(isFirst && hideLeadingGap)) {
        elements.push(
          <InsertionGap key={`gap-before-${chip.id}`} onClick={() => onGapClick(condIdx, false)} />,
        );
      }
      elements.push(
        <div key={chip.id} ref={chipRef(chip.id)} className='shrink-0'>
          <FilterInputConnectorChip
            chipId={chip.id}
            variant={chip.variant as 'and' | 'or'}
            onChange={onConnectorChange}
          />
        </div>,
      );
      if (!(isLast && hideTrailingGap)) {
        elements.push(
          <InsertionGap key={`gap-after-${chip.id}`} onClick={() => onGapClick(condIdx, true)} />,
        );
      }
      connectorIndex++;
    }
  }

  return <>{elements}</>;
};

ChipsWithGaps.displayName = 'ChipsWithGaps';

/** Trailing gap rendered once after chipsAfter in the parent layout. */
export const TrailingGap: FC<{
  chips: FilterInputChipData[];
  onGapClick: (conditionIndex: number, afterConnector: boolean) => void;
}> = ({ chips, onGapClick }) => {
  const lastCondChip = [...chips].reverse().find(c => c.variant === 'chip');
  if (!lastCondChip) return null;
  const match = lastCondChip.id.match(/^chip-(\d+)$/);
  const trailingIdx = match ? Number(match[1]) + 1 : 0;
  return <InsertionGap onClick={() => onGapClick(trailingIdx, true)} />;
};

TrailingGap.displayName = 'TrailingGap';
