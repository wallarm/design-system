import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { ChevronsDownUp, ChevronsUpDown, PanelRightClose } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Button } from '../Button';

export interface TreeViewToolbarProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Left-side header label. */
  title?: ReactNode;
  /** Right-side custom content (rendered instead of the default action buttons). */
  actions?: ReactNode;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  onClose?: () => void;
}

export const TreeViewToolbar: FC<TreeViewToolbarProps> = ({
  ref,
  title,
  actions,
  onExpandAll,
  onCollapseAll,
  onClose,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('toolbar');

  return (
    <div
      ref={ref}
      data-slot='tree-view-toolbar'
      data-testid={testId}
      className={cn('flex w-full items-center gap-8 px-8 pt-8 pb-4', className)}
      {...props}
    >
      <div className='min-w-0 flex-1 truncate text-xs font-medium text-text-secondary'>
        {title ?? children}
      </div>
      <div className='flex shrink-0 items-center gap-8'>
        {actions ?? (
          <>
            {onCollapseAll && (
              <Button
                variant='ghost'
                color='neutral'
                size='small'
                aria-label='Collapse all'
                onClick={onCollapseAll}
              >
                <ChevronsDownUp size='sm' />
              </Button>
            )}
            {onExpandAll && (
              <Button
                variant='ghost'
                color='neutral'
                size='small'
                aria-label='Expand all'
                onClick={onExpandAll}
              >
                <ChevronsUpDown size='sm' />
              </Button>
            )}
            {onClose && (
              <Button
                variant='ghost'
                color='neutral'
                size='small'
                aria-label='Close'
                onClick={onClose}
              >
                <PanelRightClose size='sm' />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

TreeViewToolbar.displayName = 'TreeViewToolbar';
