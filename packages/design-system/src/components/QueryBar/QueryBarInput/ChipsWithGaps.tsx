import type { FC, ReactNode } from 'react';
import type { QueryBarChipData } from '../types';
import { InsertionGap } from './InsertionGap';
import type { ChipSegment } from './QueryBarChip';
import { QueryBarChip } from './QueryBarChip/QueryBarChip';
import { QueryBarConnectorChip } from './QueryBarConnectorChip';

interface ChipsWithGapsProps {
  chips: QueryBarChipData[];
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
  const elements: ReactNode[] = [];
  let connectorIndex = 0;
  const connectorCount = chips.filter(c => c.variant === 'and' || c.variant === 'or').length;

  for (const chip of chips) {
    const isCondition = chip.variant === 'chip';
    const isConnector = chip.variant === 'and' || chip.variant === 'or';

    if (isCondition) {
      elements.push(
        <div key={chip.id} className='shrink-0 cursor-pointer hover:z-10'>
          <QueryBarChip
            chipId={chip.id}
            attribute={chip.attribute ?? ''}
            operator={chip.operator}
            value={chip.value}
            error={chip.error}
            onRemove={() => onChipRemove(chip.id)}
            onSegmentClick={(segment, anchorRect) => onChipClick(chip.id, segment, anchorRect)}
          />
        </div>,
      );
    } else if (isConnector) {
      const match = chip.id.match(/^connector-(\d+)$/);
      const condIdx = match ? Number(match[1]) : 0;
      const isFirst = connectorIndex === 0;
      const isLast = connectorIndex === connectorCount - 1;

      if (!(isFirst && hideLeadingGap)) {
        elements.push(
          <InsertionGap key={`gap-before-${chip.id}`} onClick={() => onGapClick(condIdx, false)} />,
        );
      }
      elements.push(
        <div key={chip.id} className='shrink-0'>
          <QueryBarConnectorChip
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
  chips: QueryBarChipData[];
  onGapClick: (conditionIndex: number, afterConnector: boolean) => void;
}> = ({ chips, onGapClick }) => {
  const lastCondChip = [...chips].reverse().find(c => c.variant === 'chip');
  if (!lastCondChip) return null;
  const match = lastCondChip.id.match(/^chip-(\d+)$/);
  const trailingIdx = match ? Number(match[1]) + 1 : 0;
  return <InsertionGap onClick={() => onGapClick(trailingIdx, true)} />;
};

TrailingGap.displayName = 'TrailingGap';
