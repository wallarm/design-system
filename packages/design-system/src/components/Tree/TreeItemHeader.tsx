import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
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

  if (collapsible) {
    return (
      <div
        ref={ref}
        data-slot='tree-item-header'
        data-state={open ? 'open' : 'closed'}
        className={cn(
          'group/trigger relative pt-2 pb-4 flex min-w-0 w-full items-center',
          className,
        )}
        {...props}
      >
        <button
          type='button'
          className={cn(
            'flex min-w-0 flex-1 items-center text-left cursor-pointer',
            'before:absolute before:inset-y-0 before:left-0 before:right-0',
          )}
          onClick={toggle}
        >
          <TreeItemIcon icon={icon} />
          <div className='min-w-0 flex-1'>{children}</div>
        </button>
        {action && (
          <div className='relative ml-2 shrink-0' data-slot='tree-item-action'>
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
      className={cn('group relative pt-2 pb-4 flex w-full items-start justify-between', className)}
      {...props}
    >
      <TreeItemIcon icon={icon} />
      <div className='min-w-0 flex-1'>{children}</div>
      {action && (
        <div className='ml-2 shrink-0' data-slot='tree-item-action'>
          {action}
        </div>
      )}
    </div>
  );
};

TreeItemHeader.displayName = 'TreeItemHeader';
