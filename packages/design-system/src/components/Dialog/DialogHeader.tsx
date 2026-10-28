import type { FC } from 'react';

import { DrawerHeader, type DrawerHeaderProps } from '../Drawer';

type DialogHeaderProps = DrawerHeaderProps;

export const DialogHeader: FC<DialogHeaderProps> = DrawerHeader;

DialogHeader.displayName = 'DialogHeader';
