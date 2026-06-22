import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const TestPolicies: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344' />
    <path d='m9 11 3 3L22 4' />
  </SvgIcon>
);

TestPolicies.displayName = 'TestPoliciesIcon';
