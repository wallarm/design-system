import type { FC, ReactNode } from 'react';
import { cn } from '../../../utils/cn';
import { BuildingQueryBarChip } from './BuildingQueryBarChip';
import { QueryBarConnectorChip } from './QueryBarConnectorChip';
import { QueryBarChip } from './QueryBarChip';
import { useQueryBarContext } from '../QueryBarContext';

interface QueryBarChipListProps {
  children?: ReactNode;
}

export const QueryBarChipList: FC<QueryBarChipListProps> = ({ children }) => {
  const { chips, buildingChipData, buildingChipRef, onChipClick, onChipRemove } =
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
            onClick={isCondition || isConnector ? (e) => onChipClick(chip.id, e) : undefined}
          >
            {isCondition ? (
              <QueryBarChip
                attribute={chip.attribute ?? ''}
                operator={chip.operator}
                value={chip.value}
                error={chip.error}
                onRemove={() => onChipRemove(chip.id)}
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
          <BuildingQueryBarChip
            attribute={buildingChipData.attribute ?? ''}
            operator={buildingChipData.operator}
            value={buildingChipData.value}
          />
        </div>
      )}
      {children}
    </>
  );
};

QueryBarChipList.displayName = 'QueryBarChipList';
