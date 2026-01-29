import type { FC } from 'react';

import {
  DrawerFooterControls,
  type DrawerFooterControlsProps,
} from '../Drawer';

export type DialogFooterControlsProps = DrawerFooterControlsProps;

export const DialogFooterControls: FC<DialogFooterControlsProps> =
  DrawerFooterControls;

DialogFooterControls.displayName = 'DialogFooterControls';
