import type { FC, HTMLAttributes, Ref } from 'react';
import { Separator, type SeparatorProps } from 'react-resizable-panels';
import { GripVertical } from '../../icons';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { resizableHandleGripVariants, resizableHandleVariants } from './classes';
import { useResizableContext } from './ResizableContext';

export interface ResizableHandleProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'id' | 'role' | 'tabIndex'>,
    Pick<SeparatorProps, 'disabled' | 'disableDoubleClick'>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Show a visible grip icon on the handle. */
  withHandle?: boolean;
}

export const ResizableHandle: FC<ResizableHandleProps> = ({
  ref,
  className,
  withHandle = false,
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
    >
      {withHandle && (
        <div className={resizableHandleGripVariants()} data-slot='resizable-handle-grip'>
          <GripVertical className='size-10' />
        </div>
      )}
    </Separator>
  );
};

ResizableHandle.displayName = 'ResizableHandle';
