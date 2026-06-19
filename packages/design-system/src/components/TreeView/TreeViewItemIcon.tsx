import type { FC, ReactNode } from 'react';
import { ChevronDown } from '../../icons';
import { cn } from '../../utils/cn';

const ICON_LEFT = -16;

export interface TreeViewItemIconProps {
  icon?: ReactNode;
  collapsible: boolean;
}

export const TreeViewItemIcon: FC<TreeViewItemIconProps> = ({ icon, collapsible }) => {
  if (!collapsible && !icon) return null;

  if (!collapsible && icon) {
    return (
      <div
        className='absolute top-0 -translate-x-1/2 flex items-center justify-center bg-bg-page-bg p-2 text-text-secondary'
        style={{ left: ICON_LEFT }}
        data-slot='tree-view-icon'
      >
        {icon}
      </div>
    );
  }

  return (
    <div
      className='absolute top-0 -translate-x-1/2 flex items-center justify-center bg-bg-page-bg p-2'
      style={{ left: ICON_LEFT }}
      data-slot='tree-view-icon'
    >
      {icon && (
        <span className='inline-flex group-hover/trigger:hidden text-text-secondary'>{icon}</span>
      )}

      <span
        className={cn(
          'inline-flex transition-transform duration-200 motion-reduce:transition-none group-data-[state=closed]/trigger:-rotate-90',
          icon && 'hidden group-hover/trigger:inline-flex',
        )}
      >
        <ChevronDown size='md' className='text-text-secondary' />
      </span>
    </div>
  );
};

TreeViewItemIcon.displayName = 'TreeViewItemIcon';
