import type { FC, HTMLAttributes, Ref } from 'react';
import { Group, type GroupProps } from 'react-resizable-panels';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { ResizableProvider } from './ResizableContext';

export interface ResizablePanelGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'id'>,
    Pick<
      GroupProps,
      | 'defaultLayout'
      | 'disabled'
      | 'groupRef'
      | 'onLayoutChange'
      | 'onLayoutChanged'
      | 'orientation'
    >,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Unique id for layout persistence via localStorage. */
  autoSaveId?: string;
}

export const ResizablePanelGroup: FC<ResizablePanelGroupProps> = ({
  ref,
  className,
  orientation = 'horizontal',
  autoSaveId,
  children,
  'data-testid': testId,
  ...props
}) => {
  return (
    <ResizableProvider value={{ orientation }}>
      <TestIdProvider value={testId}>
        <Group
          {...props}
          id={autoSaveId}
          elementRef={ref}
          orientation={orientation}
          data-slot='resizable-panel-group'
          data-testid={testId}
          className={cn(className)}
        >
          {children}
        </Group>
      </TestIdProvider>
    </ResizableProvider>
  );
};

ResizablePanelGroup.displayName = 'ResizablePanelGroup';
