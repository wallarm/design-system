import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export interface PanelRightAnimatedProps extends SvgIconProps {
  /** Whether the panel is in "open" (active) state */
  active?: boolean;
}

/**
 * Animated panel-right icon for preview drawer toggle.
 *
 * The inner filled panel transitions between narrow (closed)
 * and wide (open) states via CSS transition.
 */
export const PanelRightAnimated: FC<PanelRightAnimatedProps> = ({ active = false, ...props }) => (
  <SvgIcon {...props} viewBox='0 0 24 24' fill='none'>
    <rect
      x='3'
      y='3'
      width='18'
      height='18'
      rx='2'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <rect
      x={active ? '12' : '15'}
      y='6'
      width={active ? '6' : '3'}
      height='12'
      rx='1'
      fill='currentColor'
      style={{ transition: 'x 150ms ease, width 150ms ease' }}
    />
  </SvgIcon>
);

PanelRightAnimated.displayName = 'PanelRightAnimated';
