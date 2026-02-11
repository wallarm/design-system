import type { FC, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const drawerFooterControlsVariants = cva('flex items-center gap-8', {
  variants: {
    placement: {
      left: 'mr-auto',
      right: 'ml-auto',
    },
  },
});

type DrawerFooterControlsVariantsProps = VariantProps<typeof drawerFooterControlsVariants>;

interface DrawerFooterControlsBaseProps {
  children: ReactNode;
}

export type DrawerFooterControlsProps = DrawerFooterControlsBaseProps &
  DrawerFooterControlsVariantsProps;

export const DrawerFooterControls: FC<DrawerFooterControlsProps> = ({
  children,
  placement = 'right',
}) => <div className={cn(drawerFooterControlsVariants({ placement }))}>{children}</div>;

DrawerFooterControls.displayName = 'DrawerFooterControls';
