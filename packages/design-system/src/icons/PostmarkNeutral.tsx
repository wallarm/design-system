import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const PostmarkNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M20.25 0.150024H3.75002C1.7618 0.150024 0.150024 1.7618 0.150024 3.75002V20.25C0.150024 22.2382 1.7618 23.85 3.75002 23.85H20.25C22.2382 23.85 23.85 22.2382 23.85 20.25V3.75002C23.85 1.7618 22.2382 0.150024 20.25 0.150024Z'
      fill='currentColor'
      stroke='currentColor'
      strokeWidth='0.3'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M7.9605 17.5358V5.77875H6V3.8175H12.951C17.2935 3.8175 18.1935 6.681 18.1935 8.667C18.1935 10.2608 17.547 11.4848 16.8773 12.1545C15.792 13.2398 14.3137 13.4933 12.0735 13.4933H10.3185V17.535H12.3735V19.4955H6V17.535H7.9605V17.5358ZM10.3155 11.601H12.276C15.1635 11.601 15.786 10.2615 15.786 8.6445C15.786 6.79725 14.7472 5.781 13.0155 5.781H10.3185L10.3162 11.601H10.3155Z'
      fill='currentColor'
    />
  </SvgIcon>
);

PostmarkNeutral.displayName = 'PostmarkNeutralIcon';
