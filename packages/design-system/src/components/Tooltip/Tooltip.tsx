import type { FC } from 'react';
import { Root, type TooltipProps } from '@radix-ui/react-tooltip';

export const Tooltip: FC<TooltipProps> = props => <Root {...props} />;

Tooltip.displayName = 'Tooltip';
