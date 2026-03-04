import type { FC, ReactNode } from 'react';
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
        const isConnector = chip.variant === 'and' || chip.variant === 'or';
        return (
          <div
            key={chip.id}
            className='shrink-0 cursor-pointer hover:z-10'
            onClick={(e) => onChipClick(chip.id, e)}
          >
            <FilterChip
              {...chip}
              onRemove={isConnector ? undefined : () => onChipRemove(chip.id)}
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
