import type { FC, HTMLAttributes, Ref } from 'react';
import { Separator, type SeparatorProps } from 'react-resizable-panels';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { resizableHandleVariants } from './classes';
import { useResizableContext } from './ResizableContext';

export interface ResizableHandleProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'id' | 'role' | 'tabIndex'>,
    Pick<SeparatorProps, 'disabled' | 'disableDoubleClick'>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
}

export const ResizableHandle: FC<ResizableHandleProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('handle', testIdProp);
  const { orientation } = useResizableContext();

  return (
    <Separator
      {...props}
      elementRef={ref}
      data-slot='resizable-handle'
      data-testid={testId}
      className={cn(resizableHandleVariants({ orientation }), className)}
    />
  );
};

ResizableHandle.displayName = 'ResizableHandle';
