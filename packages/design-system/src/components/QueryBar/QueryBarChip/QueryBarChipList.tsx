import type { FC } from 'react';
import { cn } from '../../../utils/cn';
import { QueryBarConnectorChip } from './QueryBarConnectorChip';
import { QueryBarChip } from './QueryBarChip';
import { useQueryBarContext } from '../QueryBarContext';

export const QueryBarChipList: FC = () => {
  const { chips, buildingChipData, buildingChipRef, onChipClick, onConnectorClick, onChipRemove } =
    useQueryBarContext();

  return (
    <>
      {chips.map(chip => {
        const isCondition = chip.variant === 'chip';
        const isConnector = chip.variant === 'and' || chip.variant === 'or';
        return (
          <div
            key={chip.id}
            className={cn('shrink-0', (isCondition || isConnector) && 'cursor-pointer hover:z-10')}
            onClick={isConnector ? () => onConnectorClick(chip.id) : undefined}
          >
            {isCondition ? (
              <QueryBarChip
                attribute={chip.attribute ?? ''}
                operator={chip.operator}
                value={chip.value}
                error={chip.error}
                onRemove={() => onChipRemove(chip.id)}
                onSegmentClick={(segment, anchorRect) => onChipClick(chip.id, segment, anchorRect)}
              />
            ) : (
              <QueryBarConnectorChip
                variant={chip.variant as Exclude<typeof chip.variant, 'chip'>}
                error={chip.error}
              />
            )}
          </div>
        );
      })}
      {buildingChipData && (
        <div ref={buildingChipRef} className='shrink-0'>
          <QueryBarChip
            building
            attribute={buildingChipData.attribute ?? ''}
            operator={buildingChipData.operator}
            value={buildingChipData.value}
          />
        </div>
      )}
    </>
  );
};

QueryBarChipList.displayName = 'QueryBarChipList';
