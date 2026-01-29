import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const NotebookPen: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M8 21v-5a2 2 0 0 1 2-2h2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M19.8 8.8 13.4 15.2 10 16l.8-3.4 6.4-6.4a2 2 0 1 1 2.8 2.8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

NotebookPen.displayName = 'NotebookPenIcon';
