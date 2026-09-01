import type { FC, HTMLAttributes, Ref } from 'react';
import { Panel, type PanelProps } from 'react-resizable-panels';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';

export interface ResizablePanelProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'id' | 'onResize'>,
    Pick<
      PanelProps,
      | 'collapsedSize'
      | 'collapsible'
      | 'defaultSize'
      | 'disabled'
      | 'groupResizeBehavior'
      | 'maxSize'
      | 'minSize'
      | 'onResize'
      | 'panelRef'
    >,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Unique panel identity for layout persistence. */
  id?: string;
}

export const ResizablePanel: FC<ResizablePanelProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('panel', testIdProp);

  return (
    <Panel
      {...props}
      elementRef={ref}
      data-slot='resizable-panel'
      data-testid={testId}
      className={cn(className)}
    />
  );
};

ResizablePanel.displayName = 'ResizablePanel';
