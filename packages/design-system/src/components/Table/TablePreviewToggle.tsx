import type { FC } from 'react';
import { PanelRightAnimated } from '../../icons';
import { Button } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

export interface TablePreviewToggleProps {
  /** Whether the preview drawer is open for this row */
  active?: boolean;
  /** Toggle callback */
  onClick?: () => void;
}

export const TablePreviewToggle: FC<TablePreviewToggleProps> = ({ active = false, onClick }) => {
  const label = active ? 'Close preview' : 'Preview attack';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? 'outline' : 'ghost'}
          color='neutral'
          size='small'
          className='p-2'
          aria-pressed={active}
          aria-label={label}
          onClick={onClick}
        >
          <PanelRightAnimated active={active} size='sm' />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};

TablePreviewToggle.displayName = 'TablePreviewToggle';
