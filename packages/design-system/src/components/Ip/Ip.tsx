import type { ComponentProps, FC, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';

type IpNativeProps = ComponentProps<'div'>;

interface IpBaseProps {
  ref?: Ref<HTMLDivElement>;
  asChild?: boolean;
}

export type IpProps = IpNativeProps & IpBaseProps & TestableProps;

export const Ip: FC<IpProps> = ({
  ref,
  asChild = false,
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  const Comp = asChild ? Slot : 'div';

  return (
    <TestIdProvider value={testId}>
      <Comp
        {...props}
        ref={ref}
        data-testid={testId}
        data-slot='ip'
        className={cn('flex items-center gap-4 min-w-0 max-w-full overflow-hidden', className)}
      >
        {children}
      </Comp>
    </TestIdProvider>
  );
};
