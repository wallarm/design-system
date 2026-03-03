import type { FC, MouseEvent as ReactMouseEvent, Ref } from 'react';
import { FilterChip } from '../FilterChip';
import type { FilterChipData } from '../types';

interface ChipListProps {
  chips: FilterChipData[];
  buildingChipData?: {
    variant: 'chip';
    attribute: string;
    operator?: string;
    value?: string;
  } | null;
  buildingChipRef?: Ref<HTMLDivElement>;
  hasMoreChips?: boolean;
  placeholder: string;
  onChipClick: (chipId: string, e: ReactMouseEvent) => void;
  onChipRemove: (chipId: string) => void;
}

export const ChipList: FC<ChipListProps> = ({
  chips,
  buildingChipData,
  buildingChipRef,
  hasMoreChips = false,
  placeholder,
  onChipClick,
  onChipRemove,
}) => (
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

ChipList.displayName = 'ChipList';
