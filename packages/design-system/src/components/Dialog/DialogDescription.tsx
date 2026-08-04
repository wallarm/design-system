import type { FC } from 'react';
import { DrawerDescription, type DrawerDescriptionProps } from '../Drawer';

type DialogDescriptionProps = DrawerDescriptionProps;

export const DialogDescription: FC<DialogDescriptionProps> = DrawerDescription;

DialogDescription.displayName = 'DialogDescription';
