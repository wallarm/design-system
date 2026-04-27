import { useContext } from 'react';
import { DrawerContext } from './DrawerContext';

export const useOptionalDrawerContext = () => useContext(DrawerContext);
