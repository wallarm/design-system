import type { FC } from 'react';
import { X } from '../../../../icons/X';
import { useTestId } from '../../../../utils/testId';
import { removeButtonVariants } from './classes';

export const FilterInputRemoveButton: FC<{ error: boolean; onRemove: () => void }> = ({
  error,
  onRemove,
}) => {
  const testId = useTestId('remove-button');
  return (
    <button
      type='button'
      onClick={e => {
        e.stopPropagation();
        onRemove();
      }}
      className={removeButtonVariants({ error })}
      data-slot='filter-input-chip-delete'
      data-testid={testId}
      aria-label='Remove filter'
    >
      <X size='sm' />
    </button>
  );
};

FilterInputRemoveButton.displayName = 'FilterInputRemoveButton';
