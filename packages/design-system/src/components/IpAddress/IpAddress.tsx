import type { ComponentProps, FC, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';
import { Badge } from '../Badge';
import { Country } from '../Country';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { type SourceKey, sourceLabels } from './constants';

type IpAddressNativeProps = Omit<ComponentProps<'div'>, 'children'>;

export interface IpAddressEntry {
  ip: string;
  port?: number;
  country?: string;
  sources?: SourceKey[];
}

interface IpAddressBaseProps {
  ref?: Ref<HTMLDivElement>;
  asChild?: boolean;
  addresses: IpAddressEntry[];
}

export type IpAddressProps = IpAddressNativeProps & IpAddressBaseProps;

const IpAddressItem: FC<{ entry: IpAddressEntry }> = ({ entry }) => (
  <div data-slot='ip-address' className='flex items-center gap-6 min-w-0 overflow-hidden'>
    {entry.country && <Country code={entry.country} name={false} size='medium' />}

    <OverflowTooltip>
      <OverflowTooltipTrigger>
        <span className='font-mono text-sm truncate min-w-0'>{entry.ip}</span>
      </OverflowTooltipTrigger>
      <OverflowTooltipContent>{entry.ip}</OverflowTooltipContent>
    </OverflowTooltip>

    {entry.port && (
      <span className='font-mono text-sm opacity-50 ml-[-4] shrink-0'>:{entry.port}</span>
    )}

    {entry.sources &&
      entry.sources.length > 0 &&
      entry.sources.map(source => (
        <Badge key={source} size='medium' type='secondary' color='slate'>
          {sourceLabels[source]}
        </Badge>
      ))}
  </div>
);

export const IpAddress: FC<IpAddressProps> = ({
  ref,
  asChild = false,
  addresses,
  className,
  ...props
}) => {
  const [first, ...rest] = addresses;

  if (!first) return null;

  const Comp = asChild ? Slot : 'div';

  return (
    <Comp {...props} ref={ref} className={cn('flex flex-col min-w-0 max-w-full', className)}>
      <IpAddressItem entry={first} />

      {rest?.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Badge
              type='text'
              className='cursor-pointer'
              style={{ paddingLeft: first.country ? '24px' : '0' }}
            >
              +{rest.length} address{rest.length > 1 ? 'es' : ''}
            </Badge>
          </PopoverTrigger>

          <PopoverContent minHeight='auto' maxHeight='320px' minWidth='auto'>
            <div className='flex flex-col gap-8'>
              {rest.map(entry => (
                <IpAddressItem key={entry.ip} entry={entry} />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </Comp>
  );
};
