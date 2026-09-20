import type { FC } from 'react';
import { Check, Copy } from '../../icons';
import type { SvgIconProps } from '../../icons/SvgIcon';
import { useCopyable } from './CopyableContext';

export type CopyableIconProps = SvgIconProps;

/**
 * Swaps between `Copy` and `Check` icons based on the parent `<Copyable>` state.
 *
 * Must be rendered inside a `<Copyable>` tree.
 */
export const CopyableIcon: FC<CopyableIconProps> = props => {
  const { copied } = useCopyable();
  return copied ? <Check {...props} /> : <Copy {...props} />;
};

CopyableIcon.displayName = 'CopyableIcon';
