import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import { CirclePlus } from '../../../../icons/CirclePlus';
import { CircleSlash } from '../../../../icons/CircleSlash';
import { cn } from '../../../../utils/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuFooter,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemText,
} from '../../../DropdownMenu';
import { DropdownMenuTrigger } from '../../../DropdownMenu/DropdownMenuTrigger';
import { Kbd, KbdGroup } from '../../../Kbd';
import { useFilterInputContext } from '../../FilterInputContext';
import { useFilterInputPositioning } from '../../hooks/useFilterInputPositioning';
import { VARIANT_LABELS } from '../../lib/constants';
import { chipVariants, segmentContainer } from '../FilterInputChip/classes';
import { connectorTextVariants } from './classes';

export type ConnectorVariant = 'and' | 'or';

export interface FilterInputConnectorChipProps {
  chipId: string;
  variant: ConnectorVariant;
  onChange: (chipId: string, value: 'and' | 'or') => void;
  className?: string;
}

export const FilterInputConnectorChip: FC<FilterInputConnectorChipProps> = ({
  chipId,
  variant,
  onChange,
  className,
}) => {
  const { menuOpen, closeAutocompleteMenu } = useFilterInputContext();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) closeAutocompleteMenu();
      setOpen(nextOpen);
    },
    [closeAutocompleteMenu],
  );

  // Reset local open state when autocomplete menu opens to prevent flash
  // during flushSync transitions (close → field) where menuOpen briefly goes false
  useEffect(() => {
    if (menuOpen) setOpen(false);
  }, [menuOpen]);

  const positioning = useFilterInputPositioning({ anchorRef: triggerRef });

  const label = VARIANT_LABELS[variant];

  return (
    <DropdownMenu
      positioning={positioning}
      open={open && !menuOpen}
      onOpenChange={handleOpenChange}
    >
      <DropdownMenuTrigger asChild>
        <button
          ref={triggerRef}
          type='button'
          className={cn(
            chipVariants({ interactive: true }),
            'max-w-[320px] outline-none focus-visible:outline-none',
            className,
          )}
          data-slot='filter-input-connector-chip'
          aria-label={`Logical operator: ${label}`}
        >
          <div className={segmentContainer}>
            <p className={connectorTextVariants()}>{label}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-auto min-w-64'>
        <DropdownMenuItem value='and' onSelect={() => onChange(chipId, 'and')}>
          <DropdownMenuItemIcon>
            <CirclePlus />
          </DropdownMenuItemIcon>
          <DropdownMenuItemText>AND</DropdownMenuItemText>
        </DropdownMenuItem>
        <DropdownMenuItem value='or' onSelect={() => onChange(chipId, 'or')}>
          <DropdownMenuItemIcon>
            <CircleSlash />
          </DropdownMenuItemIcon>
          <DropdownMenuItemText>OR</DropdownMenuItemText>
        </DropdownMenuItem>
        <DropdownMenuFooter>
          <span className='flex items-center gap-4'>
            <KbdGroup>
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
            </KbdGroup>
            to navigate
          </span>
          <span className='flex items-center gap-4'>
            <KbdGroup>
              <Kbd>↵</Kbd>
            </KbdGroup>
            to select
          </span>
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

FilterInputConnectorChip.displayName = 'FilterInputConnectorChip';
