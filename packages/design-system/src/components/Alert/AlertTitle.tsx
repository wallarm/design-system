import type { FC, ReactNode, Ref } from 'react';

import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import { Text } from '../Text';

export interface AlertTitleProps {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
  /** Maximum number of lines before truncation (default: 4). Set to 0 to disable truncation. */
  lineClamp?: number;
}

/**
 * Title component for Alert.
 *
 * Displays the main title text with medium weight.
 * Supports text truncation with configurable max lines.
 * Shows a tooltip with full text when content is truncated.
 */
export const AlertTitle: FC<AlertTitleProps> = ({
  ref,
  children,
  lineClamp,
}) => (
  <OverflowTooltip>
    <OverflowTooltipTrigger>
      <Text
        ref={ref}
        size="sm"
        weight="medium"
        color="primary"
        lineClamp={lineClamp}
      >
        {children}
      </Text>
    </OverflowTooltipTrigger>
    <OverflowTooltipContent>{children}</OverflowTooltipContent>
  </OverflowTooltip>
);

AlertTitle.displayName = 'AlertTitle';
