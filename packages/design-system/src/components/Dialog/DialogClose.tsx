import type { FC } from 'react';

import { DrawerClose, type DrawerCloseProps } from '../Drawer';

type DialogCloseProps = DrawerCloseProps;

export const DialogClose: FC<DialogCloseProps> = DrawerClose;

DialogClose.displayName = 'DialogClose';
