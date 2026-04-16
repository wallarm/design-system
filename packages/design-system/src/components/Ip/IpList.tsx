import {
  Children,
  type ComponentProps,
  type FC,
  Fragment,
  type ReactElement,
  type Ref,
} from 'react';
import { Slot } from '@radix-ui/react-slot';
import { useOverflowItems } from '../../hooks';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Badge } from '../Badge';
import { Link } from '../Link';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { VStack } from '../Stack';
import { checkHasCountry } from './utils/checkHasCountry';

type IpListNativeProps = ComponentProps<'div'>;

type IpListType = 'vertical' | 'horizontal';

interface IpListBaseProps {
  ref?: Ref<HTMLDivElement>;
  asChild?: boolean;
  type?: IpListType;
}

export type IpListProps = IpListNativeProps & IpListBaseProps;

export const IpList: FC<IpListProps> = ({
  ref,
  asChild = false,
  type = 'vertical',
  className,
  children,
  ...props
}) => {
  const testId = useTestId('list');
  const items = Children.toArray(children);

  if (items.length === 0) return null;

  if (type === 'horizontal') {
    return (
      <IpListHorizontal ref={ref} testId={testId} items={items} className={className} {...props} />
    );
  }

  const [first, ...rest] = items;
  const Comp = asChild ? Slot : 'div';
  const hasCountry = checkHasCountry(first);

  return (
    <Comp
      {...props}
      ref={ref}
      data-slot='ip-list'
      data-type='vertical'
      data-testid={testId}
      className={cn('flex flex-col min-w-0 max-w-full', className)}
    >
      {first}

      {rest.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Link size='sm' type='muted' className={cn(hasCountry && 'ml-26')}>
              +{rest.length} address{rest.length > 1 ? 'es' : ''}
            </Link>
          </PopoverTrigger>

          <PopoverContent minHeight='auto' maxHeight='320px' minWidth='auto'>
            <VStack gap={8}>{rest}</VStack>
          </PopoverContent>
        </Popover>
      )}
    </Comp>
  );
};

interface IpListHorizontalProps extends ComponentProps<'div'> {
  ref?: Ref<HTMLDivElement>;
  testId?: string;
  items: ReturnType<typeof Children.toArray>;
}

const IpListHorizontal: FC<IpListHorizontalProps> = ({
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
    reserveSpace: 56,
  });

  const overflowTestId = testId ? `${testId}-overflow-trigger` : undefined;
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
                  data-testid={overflowTestId}
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

const IpListSeparator: FC = () => (
  <span aria-hidden='true' className='text-text-muted select-none shrink-0'>
    ·
  </span>
);
