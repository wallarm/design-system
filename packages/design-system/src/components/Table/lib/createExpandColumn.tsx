import type { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronRight } from '../../../icons';
import { ToggleButton } from '../../ToggleButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';
import { TABLE_EXPAND_COLUMN_ID, TABLE_EXPAND_COLUMN_WIDTH } from './constants';

/**
 * Creates an expand/collapse column for use in Table.
 * Automatically injected by Table when `renderExpandedRow` is provided.
 */
export const createExpandColumn = <T,>(): ColumnDef<T, unknown> => {
  return {
    id: TABLE_EXPAND_COLUMN_ID,
    size: TABLE_EXPAND_COLUMN_WIDTH,
    minSize: TABLE_EXPAND_COLUMN_WIDTH,
    maxSize: TABLE_EXPAND_COLUMN_WIDTH,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    enablePinning: false,
    meta: {
      headerClassName: 'px-4 py-6',
      cellClassName: 'px-4 py-6 has-[>_[data-state=open]]:ring-0',
    },
    header: () => null,
    cell: ({ row }) => {
      if (!row.getCanExpand()) return null;

      const expanded = row.getIsExpanded();

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleButton
              variant='ghost'
              color='neutral'
              size='small'
              active={expanded}
              onToggle={row.getToggleExpandedHandler()}
              aria-expanded={expanded}
              aria-label={expanded ? 'Collapse row' : 'Expand row'}
            >
              {expanded ? <ChevronDown /> : <ChevronRight />}
            </ToggleButton>
          </TooltipTrigger>
          <TooltipContent>{expanded ? 'Collapse' : 'Expand'}</TooltipContent>
        </Tooltip>
      );
    },
  };
};
