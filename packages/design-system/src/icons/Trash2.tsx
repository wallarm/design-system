import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const Trash2: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="M3 6h18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <line
      x1="10"
      x2="10"
      y1="11"
      y2="17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="14"
      x2="14"
      y1="11"
      y2="17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);

Trash2.displayName = 'Trash2Icon';
