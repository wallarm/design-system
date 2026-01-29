import { type FC } from 'react';

import { Provider, type TooltipProviderProps } from '@radix-ui/react-tooltip';

export const TooltipProvider: FC<TooltipProviderProps> = (props) => (
  <Provider {...props} />
);

TooltipProvider.displayName = 'TooltipProvider';
