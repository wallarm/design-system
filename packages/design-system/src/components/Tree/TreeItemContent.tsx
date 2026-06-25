import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTreeItemContext } from './TreeItemContext';

export interface TreeItemContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const TreeItemContent: FC<TreeItemContentProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const { collapsible, open } = useTreeItemContext();

  if (!collapsible) {
    return (
      <div ref={ref} data-slot='tree-item-content' className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      data-slot='tree-item-content'
      data-state={open ? 'open' : 'closed'}
      className={cn(
        'grid transition-[grid-template-rows] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        className,
      )}
      {...props}
    >
      <div className='overflow-hidden'>{children}</div>
    </div>
  );
};

TreeItemContent.displayName = 'TreeItemContent';
