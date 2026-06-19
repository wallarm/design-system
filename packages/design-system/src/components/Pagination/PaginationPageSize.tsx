import { type FC, useMemo } from 'react';
import { usePaginationContext } from '@ark-ui/react/pagination';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import {
  Select,
  SelectButton,
  SelectContent,
  SelectOption,
  SelectOptionText,
  SelectPositioner,
} from '../Select';
import { Separator } from '../Separator';
import { Text } from '../Text';
import { PAGINATION_PAGE_SIZE_LABEL } from './constants';
import { createPageSizeCollection } from './lib';

export interface PaginationPageSizeProps {
  /** Selectable items-per-page values. */
  options: number[];
  /** Leading label. @default 'Rows per page' */
  label?: string;
  className?: string;
  'data-testid'?: string;
}

export const PaginationPageSize: FC<PaginationPageSizeProps> = ({
  options,
  label = PAGINATION_PAGE_SIZE_LABEL,
  className,
  'data-testid': testIdProp,
}) => {
  const api = usePaginationContext();
  const testId = useTestId('page-size', testIdProp);

  const collection = useMemo(() => createPageSizeCollection(options), [options]);

  return (
    <div className={cn('flex items-center gap-6', className)} data-slot='pagination-page-size'>
      <Text asChild size='sm' weight='medium' color='primary'>
        <span className='whitespace-nowrap'>{label}</span>
      </Text>
      <div className='w-fit'>
        <Select
          collection={collection}
          value={[String(api.pageSize)]}
          onValueChange={({ value }) => api.setPageSize(Number(value[0]))}
          data-testid={testId}
        >
          <SelectButton aria-label={label} />
          <SelectPositioner>
            <SelectContent>
              {collection.items.map(item => (
                <SelectOption key={item.value} item={item}>
                  <SelectOptionText>{item.label}</SelectOptionText>
                </SelectOption>
              ))}
            </SelectContent>
          </SelectPositioner>
        </Select>
      </div>
      <Separator orientation='vertical' />
    </div>
  );
};

PaginationPageSize.displayName = 'PaginationPageSize';
