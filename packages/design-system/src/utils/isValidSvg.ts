import { type FC, isValidElement, type ReactNode } from 'react';

export const isSvgElement = (node: ReactNode): boolean => {
  if (!isValidElement(node)) return false;

  if (node.type === 'svg') return true;

  const displayName = (node.type as FC).displayName;

  // An agent's glyph stands in for an icon too: a button holding only one squares itself off.
  return (
    typeof displayName === 'string' &&
    (displayName.endsWith('Icon') || displayName === 'AgentGlyph')
  );
};
