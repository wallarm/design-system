import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Workflow: FC<SvgIconProps> = props => (
  <SvgIcon
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <rect width='8' height='8' x='3' y='3' rx='2' />
    <path d='M7 11v4a2 2 0 0 0 2 2h4' />
    <rect width='8' height='8' x='13' y='13' rx='2' />
  </SvgIcon>
);

Workflow.displayName = 'WorkflowIcon';
