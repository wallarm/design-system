import type { FC } from 'react';
import { Drawer, type DrawerProps } from '../Drawer';
import { DIALOG_SIZES, DIALOG_WIDTH_CONSTRAINTS } from './constants';

export type DialogProps = DrawerProps;

export const Dialog: FC<DialogProps> = ({
  width = DIALOG_SIZES.medium,
  minWidth = DIALOG_WIDTH_CONSTRAINTS.min,
  maxWidth = DIALOG_WIDTH_CONSTRAINTS.max,
  ...props
}) => <Drawer {...props} width={width} minWidth={minWidth} maxWidth={maxWidth} />;

Dialog.displayName = 'Dialog';
