import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const PanelRight: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M18 2C20.2091 2 22 3.79086 22 6V18C22 20.2091 20.2091 22 18 22H6C3.79086 22 2 20.2091 2 18V6C2 3.79086 3.79086 2 6 2H18ZM6 4C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6ZM17 6C17.5523 6 18 6.44772 18 7V17C18 17.5523 17.5523 18 17 18H15C14.4477 18 14 17.5523 14 17V7C14 6.44772 14.4477 6 15 6H17Z'
      fill='currentColor'
    />
  </SvgIcon>
);

PanelRight.displayName = 'PanelRightIcon';
