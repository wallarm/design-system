import type { FC, ReactNode } from 'react';
import { cn } from '../../../utils/cn';
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
            <FilterChip
              {...chip}
              onRemove={isCondition ? () => onChipRemove(chip.id) : undefined}
            />
          </div>
        );
      })}
      {buildingChipData && (
        <div ref={buildingChipRef} className='shrink-0'>
          <FilterChip {...buildingChipData} />
        </div>
      )}
      {children}
    </>
  );
};

ChipList.displayName = 'ChipList';
