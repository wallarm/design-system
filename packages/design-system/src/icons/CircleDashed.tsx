import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const CircleDashed: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="M10.1 2.182a10 10 0 0 1 3.8 0"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M13.9 21.818a10 10 0 0 1-3.8 0"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M17.609 3.721a10 10 0 0 1 2.69 2.7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M2.182 13.9a10 10 0 0 1 0-3.8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M20.279 17.609a10 10 0 0 1-2.7 2.69"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M21.818 10.1a10 10 0 0 1 0 3.8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M3.721 6.391a10 10 0 0 1 2.7-2.69"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M6.391 20.279a10 10 0 0 1-2.69-2.7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

CircleDashed.displayName = 'CircleDashedIcon';
