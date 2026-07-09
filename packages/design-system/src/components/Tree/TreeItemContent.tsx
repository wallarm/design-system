import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Collapse } from '../../utils/Collapse';
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
    <Collapse ref={ref} open={open} data-slot='tree-item-content' className={className} {...props}>
      {children}
    </Collapse>
  );
};

TreeItemContent.displayName = 'TreeItemContent';
