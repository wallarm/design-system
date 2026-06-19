import { type FC, useMemo } from 'react';
import { createListCollection } from '@ark-ui/react/collection';
import { usePaginationContext } from '@ark-ui/react/pagination';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Select } from '../Select';
import { SelectButton } from '../Select/SelectButton';
import { SelectContent } from '../Select/SelectContent';
import { SelectOption } from '../Select/SelectOption';
import { SelectOptionText } from '../Select/SelectOptionText';
import { SelectPositioner } from '../Select/SelectPositioner';
import { Separator } from '../Separator';
import { Text } from '../Text';

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
  label = 'Rows per page',
  className,
  'data-testid': testIdProp,
}) => {
  const api = usePaginationContext();
  const testId = useTestId('page-size', testIdProp);

  const collection = useMemo(
    () =>
      createListCollection({
        items: options.map(value => ({ label: String(value), value: String(value) })),
      }),
    [options],
  );

  return (
    <div
      className={cn('flex items-center gap-6', className)}
      data-slot='pagination-page-size'
      data-testid={testId}
    >
      <span className='whitespace-nowrap'>
        <Text size='sm' weight='medium' color='primary'>
          {label}
        </Text>
      </span>
      <div className='w-fit'>
        <Select
          collection={collection}
          value={[String(api.pageSize)]}
          onValueChange={({ value }) => api.setPageSize(Number(value[0]))}
          aria-label={label}
          data-testid={testId}
        >
          <SelectButton />
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
