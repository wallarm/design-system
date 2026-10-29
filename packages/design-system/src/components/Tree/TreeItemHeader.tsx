import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';

import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useTreeItemContext } from './TreeItemContext';
import { TreeItemIcon } from './TreeItemIcon';

export interface TreeItemHeaderProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}

export const TreeItemHeader: FC<TreeItemHeaderProps> = ({
  ref,
  children,
  icon,
  action,
  className,
  ...props
}) => {
  const { collapsible, open, toggle } = useTreeItemContext();
  const testId = useTestId('header');
  const actionTestId = useTestId('action');

  if (collapsible) {
    return (
      <div
        ref={ref}
        data-slot='tree-item-header'
        data-testid={testId}
        data-state={open ? 'open' : 'closed'}
        className={cn(
          'group/trigger relative flex w-full min-w-0 items-center pt-2 pb-4',
          className,
        )}
        {...props}
      >
        <button
          type='button'
          className={cn(
            'flex min-w-0 flex-1 cursor-pointer items-center text-left',
            'before:absolute before:inset-y-0 before:right-0 before:left-0',
          )}
          onClick={toggle}
        >
          <TreeItemIcon icon={icon} />
          <div className='min-w-0 flex-1'>{children}</div>
        </button>
        {action && (
          <div
            className='relative ml-2 shrink-0'
            data-slot='tree-item-action'
            data-testid={actionTestId}
          >
            {action}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      data-slot='tree-item-header'
      data-testid={testId}
      className={cn('group relative flex w-full items-start justify-between pt-2 pb-4', className)}
      {...props}
    >
      <TreeItemIcon icon={icon} />
      <div className='min-w-0 flex-1'>{children}</div>
      {action && (
        <div className='ml-2 shrink-0' data-slot='tree-item-action' data-testid={actionTestId}>
          {action}
        </div>
      )}
    </div>
  );
};

TreeItemHeader.displayName = 'TreeItemHeader';
