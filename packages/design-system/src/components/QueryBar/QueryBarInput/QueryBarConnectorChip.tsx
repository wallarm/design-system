import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';
import { VARIANT_LABELS } from '../lib/constants';
import type { QueryBarChipVariant } from '../types';
import { chipVariants } from './QueryBarChip/classes';

export type ConnectorVariant = Exclude<QueryBarChipVariant, 'chip'>;

export interface QueryBarConnectorChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  variant: ConnectorVariant;
  error?: boolean;
}

export const QueryBarConnectorChip: FC<QueryBarConnectorChipProps> = ({
  variant,
  error = false,
  className,
  ...props
}) => {
  const label = VARIANT_LABELS[variant];

  return (
    <div
      className={cn(chipVariants({ error, interactive: true }), 'max-w-[320px]', className)}
      data-slot='query-bar-chip'
      {...props}
    >
      <div className='flex flex-col justify-center leading-none overflow-hidden p-2'>
        <p className={cn('text-sm font-normal truncate', error ? 'text-text-danger' : 'text-text-secondary')}>
          {label}
        </p>
      </div>
    </div>
  );
};

QueryBarConnectorChip.displayName = 'QueryBarConnectorChip';
