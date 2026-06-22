import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const MousePointer: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M12.586 12.586 19 19' />
    <path d='M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z' />
  </SvgIcon>
);

MousePointer.displayName = 'MousePointerIcon';
