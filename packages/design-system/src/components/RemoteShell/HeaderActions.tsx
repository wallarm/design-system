import type { FC } from 'react';
import { Button } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import type { NavConfigHeaderAction } from './model';

export type HeaderActionsProps = {
  actions: NavConfigHeaderAction[];
};

export const HeaderActions: FC<HeaderActionsProps> = ({ actions }) => (
  <div className='flex items-center gap-2'>
    {actions.map(({ icon: Icon, label, onClick, disabled }) => (
      <Tooltip key={label}>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            size='small'
            color='neutral'
            className='my-[-2px]'
            aria-label={label}
            onClick={onClick}
            disabled={disabled}
          >
            <Icon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    ))}
  </div>
);

HeaderActions.displayName = 'HeaderActions';
