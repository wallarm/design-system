import type { CSSProperties } from 'react';
import { CSS } from '@dnd-kit/utilities';

interface GetDndStylesParams {
  canDnd: boolean;
  isDragging: boolean;
  transform: Parameters<typeof CSS.Translate.toString>[0];
  transition: string | undefined;
}

export const getDndStyles = ({
  canDnd,
  isDragging,
  transform,
  transition,
}: GetDndStylesParams): CSSProperties =>
  canDnd
    ? {
        opacity: isDragging ? 0.5 : 1,
        transform: CSS.Translate.toString(transform),
        transition: isDragging ? 'opacity 0.2s ease-in-out' : transition,
        zIndex: isDragging ? 1 : undefined,
      }
    : {};
