import type { ComponentProps, FC, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';

type IpNativeProps = ComponentProps<'div'>;

interface IpBaseProps {
  ref?: Ref<HTMLDivElement>;
  asChild?: boolean;
}

export type IpProps = IpNativeProps & IpBaseProps;

export const Ip: FC<IpProps> = ({ ref, asChild = false, className, children, ...props }) => {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      {...props}
      ref={ref}
      data-slot='ip'
      className={cn('flex items-center gap-4 min-w-0 max-w-full overflow-hidden', className)}
    >
      {children}
    </Comp>
  );
};
