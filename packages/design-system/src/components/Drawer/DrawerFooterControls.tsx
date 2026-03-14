import type { FC, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

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
}) => {
  const testId = useTestId('footer-controls');

  return (
    <div data-testid={testId} className={cn(drawerFooterControlsVariants({ placement }))}>
      {children}
    </div>
  );
};

DrawerFooterControls.displayName = 'DrawerFooterControls';
