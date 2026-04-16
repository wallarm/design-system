import type { ComponentProps, FC, ReactNode, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../../utils/cn';
import { Link } from '../../Link';
import { Popover, PopoverContent, PopoverTrigger } from '../../Popover';
import { VStack } from '../../Stack';
import { checkHasCountry } from './checkHasCountry';

export interface IpListVerticalProps extends ComponentProps<'div'> {
  ref?: Ref<HTMLDivElement>;
  asChild?: boolean;
  testId?: string;
  items: ReactNode[];
}

export const IpListVertical: FC<IpListVerticalProps> = ({
  ref,
  asChild = false,
  testId,
  items,
  className,
  ...props
}) => {
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

IpListVertical.displayName = 'IpListVertical';
