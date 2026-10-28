import type { FC } from 'react';

import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ListFilter: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M15 18C15.5523 18 16 18.4477 16 19C16 19.5523 15.5523 20 15 20H9C8.44772 20 8 19.5523 8 19C8 18.4477 8.44772 18 9 18H15ZM18 11C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13H6C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11H18ZM22 4C22.5523 4 23 4.44772 23 5C23 5.55228 22.5523 6 22 6H2C1.44772 6 1 5.55228 1 5C1 4.44772 1.44772 4 2 4H22Z'
      fill='currentColor'
    />
  </SvgIcon>
);

ListFilter.displayName = 'ListFilterIcon';
