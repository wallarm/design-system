import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ProductHuntNeutral: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <g transform='translate(0, 0)'>
      <path
        d='M10.2 12H13.5997C13.8361 12 14.0702 11.9534 14.2886 11.863C14.5069 11.7725 14.7054 11.6399 14.8725 11.4728C15.0397 11.3056 15.1723 11.1072 15.2627 10.8888C15.3532 10.6704 15.3997 10.4364 15.3997 10.2C15.3997 9.96362 15.3532 9.72956 15.2627 9.51117C15.1723 9.29278 15.0397 9.09435 14.8725 8.92721C14.7054 8.76006 14.5069 8.62748 14.2886 8.53702C14.0702 8.44656 13.8361 8.4 13.5997 8.4H10.2V12Z'
        fill='currentColor'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 24C18.6271 24 24 18.6271 24 12C24 5.3725 18.6271 0 12 0C5.3725 0 0 5.37209 0 12C0 18.6271 5.37209 24 12 24ZM7.80001 6H13.5997C15.9193 6 17.7997 7.88044 17.7997 10.2C17.7997 12.5196 15.9193 14.4 13.5997 14.4H10.2V18H7.80001V6Z'
        fill='currentColor'
      />
    </g>
  </SvgIcon>
);

ProductHuntNeutral.displayName = 'ProductHuntNeutralIcon';
