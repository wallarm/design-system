import { type FC, useCallback, useState } from 'react';
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
import { VARIANT_LABELS } from '../../lib/constants';
import { useQueryBarContext } from '../../QueryBarContext';
import { chipVariants, segmentContainer } from '../QueryBarChip/classes';
import { connectorTextVariants } from './classes';

export type ConnectorVariant = 'and' | 'or';

export interface QueryBarConnectorChipProps {
  chipId: string;
  variant: ConnectorVariant;
  onChange: (chipId: string, value: 'and' | 'or') => void;
  className?: string;
}

export const QueryBarConnectorChip: FC<QueryBarConnectorChipProps> = ({
  chipId,
  variant,
  onChange,
  className,
}) => {
  const { menuOpen, closeAutocompleteMenu } = useQueryBarContext();
  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) closeAutocompleteMenu();
      setOpen(nextOpen);
    },
    [closeAutocompleteMenu],
  );

  const label = VARIANT_LABELS[variant];

  return (
    <DropdownMenu
      positioning={{ placement: 'bottom', gutter: 4 }}
      open={open && !menuOpen}
      onOpenChange={handleOpenChange}
    >
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          className={cn(
            chipVariants({ interactive: true }),
            'max-w-[320px] outline-none focus-visible:outline-none',
            className,
          )}
          data-slot='query-bar-connector-chip'
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

QueryBarConnectorChip.displayName = 'QueryBarConnectorChip';
