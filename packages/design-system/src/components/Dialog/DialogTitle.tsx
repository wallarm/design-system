import type { FC } from 'react';
import { DrawerTitle, type DrawerTitleProps } from '../Drawer';

type DialogTitleProps = DrawerTitleProps;

export const DialogTitle: FC<DialogTitleProps> = DrawerTitle;

DialogTitle.displayName = 'DialogTitle';
