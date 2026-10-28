import type { FC } from 'react';

import { DrawerBody, type DrawerBodyProps } from '../Drawer';

export type DialogBodyProps = DrawerBodyProps;

export const DialogBody: FC<DialogBodyProps> = DrawerBody;

DialogBody.displayName = 'DialogBody';
