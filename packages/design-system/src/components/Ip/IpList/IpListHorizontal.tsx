import {
  type ComponentProps,
  type FC,
  Fragment,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { useOverflowItems } from '../../../hooks';
import { cn } from '../../../utils/cn';
import { Badge } from '../../Badge';
import { Popover, PopoverContent, PopoverTrigger } from '../../Popover';
import { VStack } from '../../Stack';

export interface IpListHorizontalProps extends ComponentProps<'div'> {
  ref?: Ref<HTMLDivElement>;
  testId?: string;
  items: ReactNode[];
}

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
    renderItem: item => item as ReactElement,
    overflowRenderer: hidden =>
      (
        <Badge type='secondary' color='slate' size='medium'>
          +{hidden.length}
        </Badge>
      ) as ReactElement,
    reserveSpace: OVERFLOW_RESERVE_SPACE,
  });

  const overflowTriggerTestId = testId ? `${testId}-overflow-trigger` : undefined;
  const overflowContentTestId = testId ? `${testId}-overflow-content` : undefined;

  return (
    <>
      <MeasurementContainer />
      <div
        {...props}
        ref={node => {
          containerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        data-slot='ip-list'
        data-type='horizontal'
        data-testid={testId}
        className={cn('flex items-center gap-6 min-w-0 max-w-full', className)}
      >
        {visibleItems.map((item, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: list items come from children — stable within render
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

const IpListSeparator: FC = () => (
  <span aria-hidden='true' className='text-text-tertiary select-none shrink-0'>
    ·
  </span>
);
