import type { FC, Ref } from 'react';
import { cn } from '../../utils/cn';
import { Link } from '../Link';
import { HStack } from '../Stack';
import { Text } from '../Text';

export interface BulkBarSummaryProps {
  count: number;
  isAllSelected: boolean;
  onSelectAll: () => void;
  onClear: () => void;
  /**
   * When true, prevent the summary from wrapping or being truncated by the
   * container: truncate the "X selected" text and keep the Select-all link on
   * a single line. Use when the bar can shrink (e.g. inside a Drawer).
   * Defaults to `false` — actions then rely on the parent for layout.
   */
  nowrap?: boolean;
  'data-testid'?: string;
  ref?: Ref<HTMLDivElement>;
}

export const BulkBarSummary: FC<BulkBarSummaryProps> = ({
  count,
  isAllSelected,
  onSelectAll,
  onClear,
  nowrap = false,
  'data-testid': testId,
  ref,
}) => {
  return (
    <div
      ref={ref}
      data-slot='bulk-bar-summary'
      data-testid={testId}
      className={cn('flex items-center gap-16 p-8', nowrap && 'flex-nowrap whitespace-nowrap')}
    >
      <Text size='sm' color='primary-alt' weight='medium' truncate={nowrap}>
        {count} selected
      </Text>

      <HStack gap={6}>
        <Link
          type={isAllSelected ? 'muted' : 'alt'}
          size='md'
          onClick={onSelectAll}
          disabled={isAllSelected}
          className={cn(nowrap && 'whitespace-nowrap')}
        >
          Select all
        </Link>

        <Text size='sm' color='tertiary-alt' weight='medium'>
          ·
        </Text>

        <Link type='alt' size='md' onClick={onClear}>
          Clear
        </Link>
      </HStack>
    </div>
  );
};

BulkBarSummary.displayName = 'BulkBarSummary';
