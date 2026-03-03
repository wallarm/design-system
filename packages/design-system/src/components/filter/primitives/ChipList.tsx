import type { FC } from 'react';
import { FilterChip } from '../FilterChip';
import { useFilterContext } from '../FilterContext';

export const ChipList: FC = () => {
  const { chips, buildingChipData, buildingChipRef, hasMoreChips, placeholder, onChipClick, onChipRemove } =
    useFilterContext();

  return (
    <div className='flex items-center gap-1'>
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
      {hasMoreChips && (
        <p className='pl-4 text-sm text-text-secondary'>{placeholder}</p>
      )}
      {buildingChipData && (
        <div ref={buildingChipRef} className='shrink-0'>
          <FilterChip {...buildingChipData} />
        </div>
      )}
    </div>
  );
};

ChipList.displayName = 'ChipList';
