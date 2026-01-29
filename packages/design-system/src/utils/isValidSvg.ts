import { type FC, isValidElement, type ReactNode } from 'react';

export const isSvgElement = (node: ReactNode): boolean => {
  if (!isValidElement(node)) return false;

  if (node.type === 'svg') return true;

  const displayName = (node.type as FC).displayName;

  return typeof displayName === 'string' && displayName.endsWith('Icon');
};
