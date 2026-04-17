import { type ComponentProps, type FC, Fragment, type ReactElement, type Ref } from 'react';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { useOverflowItems } from '../../../hooks';
import { cn } from '../../../utils/cn';
import { Badge } from '../../Badge';
import { Popover, PopoverContent, PopoverTrigger } from '../../Popover';
import { VStack } from '../../Stack';
import { IpListSeparator } from './IpListSeparator';

export interface IpListHorizontalProps extends ComponentProps<'div'> {
  ref?: Ref<HTMLDivElement>;
  testId?: string;
  items: ReactElement[];
}

/** Approx width of the `+N` Badge with gap; hook also measures dynamically when overflowRenderer is provided. */
const OVERFLOW_RESERVE_SPACE = 56;

export const IpListHorizontal: FC<IpListHorizontalProps> = ({
  ref,
  testId,
  items,
  className,
  ...props
}) => {
  const { containerRef, visibleItems, hiddenItems, MeasurementContainer } = useOverflowItems({
    items,
    renderItem: item => item,
    overflowRenderer: hidden => (
      <Badge type='secondary' color='slate' size='medium'>
        +{hidden.length}
      </Badge>
    ),
    reserveSpace: OVERFLOW_RESERVE_SPACE,
  });

  const overflowTriggerTestId = testId ? `${testId}-overflow-trigger` : undefined;
  const overflowContentTestId = testId ? `${testId}-overflow-content` : undefined;

  return (
    <>
      <MeasurementContainer />
      <div
        {...props}
        ref={composeRefs(containerRef, ref)}
        data-slot='ip-list'
        data-type='horizontal'
        data-testid={testId}
        className={cn('flex items-center gap-6 min-w-0 max-w-full', className)}
      >
        {visibleItems.map((item, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: order-preserving prefix slice from useOverflowItems
          <Fragment key={i}>
            {i > 0 && <IpListSeparator />}
            <div className='shrink-0'>{item}</div>
          </Fragment>
        ))}
        {hiddenItems.length > 0 && (
          <>
            <IpListSeparator />
            <Popover>
              <PopoverTrigger asChild>
                <Badge
                  type='secondary'
                  color='slate'
                  size='medium'
                  className='shrink-0 cursor-pointer'
                  data-testid={overflowTriggerTestId}
                >
                  +{hiddenItems.length}
                </Badge>
              </PopoverTrigger>
              <PopoverContent
                minHeight='auto'
                maxHeight='320px'
                minWidth='auto'
                data-testid={overflowContentTestId}
              >
                <VStack gap={8}>{hiddenItems}</VStack>
              </PopoverContent>
            </Popover>
          </>
        )}
      </div>
    </>
  );
};

IpListHorizontal.displayName = 'IpListHorizontal';
