import {
  Children,
  type ComponentProps,
  type FC,
  isValidElement,
  type PropsWithChildren,
  type Ref,
} from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Badge } from '../Badge';
import { Link } from '../Link';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { VStack } from '../Stack';
import { IpCountry } from './IpCountry';
import { checkHasCountry } from './utils/checkHasCountry';

type IpListNativeProps = ComponentProps<'div'>;

interface IpListBaseProps {
  ref?: Ref<HTMLDivElement>;
  asChild?: boolean;
}

export type IpListProps = IpListNativeProps & IpListBaseProps;

export const IpList: FC<IpListProps> = ({
  ref,
  asChild = false,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('list');
  const items = Children.toArray(children);
  const [first, ...rest] = items;

  if (!first) return null;

  const Comp = asChild ? Slot : 'div';

  const hasCountry = checkHasCountry(first);

  return (
    <Comp
      {...props}
      ref={ref}
      data-slot='ip-list'
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
