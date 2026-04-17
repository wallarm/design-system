import { type ComponentProps, type FC, Fragment, type ReactElement, type Ref } from 'react';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { useOverflowItems } from '../../../hooks';
import { cn } from '../../../utils/cn';
import { Popover, PopoverContent, PopoverTrigger } from '../../Popover';
import { VStack } from '../../Stack';
import { OVERFLOW_RESERVE_SPACE } from './constants';
import { IpListOverflowBadge } from './IpListOverflowBadge';
import { IpListSeparator } from './IpListSeparator';

export interface IpListHorizontalProps extends ComponentProps<'div'> {
  ref?: Ref<HTMLDivElement>;
  testId?: string;
  items: ReactElement[];
}

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
    overflowRenderer: hidden => <IpListOverflowBadge count={hidden.length} />,
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
                <IpListOverflowBadge
                  count={hiddenItems.length}
                  className='cursor-pointer'
                  data-testid={overflowTriggerTestId}
                />
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
