import type { FC, FocusEvent, MouseEvent } from 'react';
import { cn } from '../../../../utils/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemText,
} from '../../../DropdownMenu';
import { DropdownMenuTrigger } from '../../../DropdownMenu/DropdownMenuTrigger';
import { VARIANT_LABELS } from '../../lib/constants';
import { chipVariants, segmentContainer } from '../QueryBarChip/classes';
import { connectorTextVariants } from './classes';

export type ConnectorVariant = 'and' | 'or';

export interface QueryBarConnectorChipProps {
  chipId: string;
  variant: ConnectorVariant;
  error?: boolean;
  onChange: (chipId: string, value: 'and' | 'or') => void;
  className?: string;
}

/** Prevent focus/blur events from bubbling to the QueryBar container */
const stopFocusPropagation = (e: FocusEvent) => e.stopPropagation();
const stopClickPropagation = (e: MouseEvent) => e.stopPropagation();

export const QueryBarConnectorChip: FC<QueryBarConnectorChipProps> = ({
  chipId,
  variant,
  error = false,
  onChange,
  className,
}) => {
  const label = VARIANT_LABELS[variant];

  return (
    <div onFocus={stopFocusPropagation} onBlur={stopFocusPropagation} onClick={stopClickPropagation}>
      <DropdownMenu positioning={{ placement: 'bottom', gutter: 4 }}>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            className={cn(chipVariants({ error, interactive: true }), 'max-w-[320px]', className)}
            data-slot='query-bar-connector-chip'
            aria-label={`Logical operator: ${label}`}
          >
            <div className={segmentContainer}>
              <p className={connectorTextVariants({ error })}>
                {label}
              </p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-auto min-w-64'>
          <DropdownMenuItem
            value='and'
            onSelect={() => onChange(chipId, 'and')}
          >
            <DropdownMenuItemText>AND</DropdownMenuItemText>
          </DropdownMenuItem>
          <DropdownMenuItem
            value='or'
            onSelect={() => onChange(chipId, 'or')}
          >
            <DropdownMenuItemText>OR</DropdownMenuItemText>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

QueryBarConnectorChip.displayName = 'QueryBarConnectorChip';
