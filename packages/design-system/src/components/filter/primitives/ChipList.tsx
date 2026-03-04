import type { FC, ReactNode } from 'react';
import { cn } from '../../../utils/cn';
import { BuildingFilterChip } from '../BuildingFilterChip';
import { ConnectorChip } from '../ConnectorChip';
import { FilterChip } from '../FilterChip';
import { useFilterContext } from '../FilterContext';

interface ChipListProps {
  children?: ReactNode;
}

export const ChipList: FC<ChipListProps> = ({ children }) => {
  const { chips, buildingChipData, buildingChipRef, onChipClick, onChipRemove } =
    useFilterContext();

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
              <FilterChip
                attribute={chip.attribute ?? ''}
                operator={chip.operator}
                value={chip.value}
                error={chip.error}
                onRemove={() => onChipRemove(chip.id)}
              />
            ) : (
              <ConnectorChip
                variant={chip.variant as Exclude<typeof chip.variant, 'chip'>}
                error={chip.error}
              />
            )}
          </div>
        );
      })}
      {buildingChipData && (
        <div ref={buildingChipRef} className='shrink-0'>
          <BuildingFilterChip
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

ChipList.displayName = 'ChipList';
